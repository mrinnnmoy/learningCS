# Account Abstraction Design. (This Week's Contracts vs. Solana's Native Model)

## Overview

This week's work explored three important parts of Ethereum account abstraction:

- **(Concept 6) Paymasters:** Sponsoring gas for an account that holds zero ETH.
- **(Concept 9) Social Recovery:** Replacing a lost owner key using guardian signatures.
- **(Concept 10) Solana's Native Account Abstraction:** Comparing Ethereum's ERC-4337 architecture with Solana's native account and transaction model.

The implementations built this week were:

- `SponsorPaymaster`
- `SessionKeyAccount`
- `SocialRecoveryAccount`
- `MinimalAccount`

The main architectural observation is:

> **ERC-4337 makes accounts programmable by building a standardized framework around Ethereum's existing transaction model, while Solana provides more of the account and transaction execution machinery directly through its runtime.**

---

# 1. What ERC-4337 Had to Build That Solana Never Needed.

## 1.1 Ethereum's original limitation

Ethereum's traditional transaction model expects a transaction to be authorized by an externally owned account (EOA).

This creates several limitations:

- The account normally needs ETH to pay its own gas.
- Authorization is primarily based on the account's private key.
- More complicated authorization rules require additional smart-contract logic.
- A transaction is not naturally represented as an application-defined object that another contract can validate before execution.

ERC-4337 addresses these limitations by introducing an additional account-abstraction layer.

---

## 1.2 The role of `UserOperation`

Instead of requiring every operation to be a normal Ethereum transaction, ERC-4337 introduces `PackedUserOperation`.

Our tests demonstrate this directly:

```text
PackedUserOperation
        ↓
EntryPoint
        ↓
Account validation
        ↓
Paymaster validation
        ↓
Account execution
        ↓
Gas settlement
```

This gives developers a standardized object containing information such as:

- sender
- nonce
- call data
- gas limits
- gas fees
- paymaster information
- signature

The result is a transaction-like object whose authorization and gas-payment rules can be customized by smart contracts.

---

# 2. `EntryPoint` as the Coordination Layer.

The real Ethereum `EntryPoint` is central to the architecture used in this week's tests.

It coordinates several different responsibilities:

- Receives `UserOperation`s.
- Calls the account's `validateUserOp`.
- Calls the paymaster's validation function when a paymaster is specified.
- Executes the account operation.
- Calculates the actual gas cost.
- Charges the appropriate party.
- Emits the corresponding UserOperation events.

Conceptually:

```text
                    UserOperation
                         │
                         ▼
                  ┌─────────────┐
                  │  EntryPoint │
                  └──────┬──────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      Account validation      Paymaster validation
             │                       │
             └───────────┬───────────┘
                         ▼
                    Execute call
                         │
                         ▼
                   Gas settlement
```

This coordination layer is one of the major differences between ERC-4337 and Solana's native transaction model.

---

# 3. Paymasters and Sponsored Gas. (Concept 6)

## 3.1 `SponsorPaymaster`

The `SponsorPaymaster` demonstrates gas sponsorship.

Its important properties are:

- It is connected to the real `EntryPoint`.
- It has an `EntryPoint` deposit.
- It only sponsors a specific `sponsoredAccount`.
- It validates the UserOperation through `validatePaymasterUserOp`.
- The account itself can hold zero ETH.

The funding process is:

```text
SponsorPaymaster
       │
       │ depositTo()
       ▼
   EntryPoint
       │
       │ stores ETH deposit
       ▼
Paymaster balance
```

The UserOperation then uses:

```text
paymasterAndData
```

to tell the EntryPoint that the paymaster should cover the operation.

---

## 3.2 What the test proves

The sponsored transaction test intentionally creates an account with:

```text
Account ETH balance = 0
```

The account still owns ERC-20 tokens.

The successful flow is:

```text
Account: 0 ETH
       │
       ▼
UserOperation
       │
       ▼
EntryPoint
       │
       ├── Account validates signature
       │
       ├── Paymaster validates sponsorship
       │
       ├── Account executes ERC-20 transfer
       │
       └── Paymaster deposit covers gas
```

The `-vvvv` trace confirms this behavior.

The important part of the trace is:

```text
MinimalAccount::validateUserOp()
        ↓
SponsorPaymaster::validatePaymasterUserOp()
        ↓
EntryPoint::innerHandleOp()
        ↓
MinimalAccount::execute()
        ↓
MockERC20::transfer()
```

The operation succeeds even though the account itself contains zero ETH.

---

## 3.3 Why this is different from simply making gas cheap

The test is important because the account is deliberately unfunded.

This means:

- The account cannot pay its own gas.
- The bundler submits the operation.
- The paymaster has deposited ETH into the EntryPoint.
- The EntryPoint uses that deposit for the operation's gas cost.

Therefore, "gasless" here does **not** mean that gas does not exist.

It means:

> **The user account does not pay the gas; another party pays it through the paymaster mechanism.**

---

# 4. Social Recovery. (Concept 9)

## 4.1 `SocialRecoveryAccount`

The `SocialRecoveryAccount` replaces the normal single-owner authorization model with:

- One current `owner`
- A fixed guardian set
- A guardian `threshold`

For this week's implementation:

```text
Guardians = 2
Threshold = 2
```

Therefore, both guardians must approve an ownership recovery.

---

## 4.2 Recovery flow

The recovery process is:

```text
Lost owner key
      │
      ▼
New owner address
      │
      ▼
Guardian 1 signs
      │
      ▼
Guardian 2 signs
      │
      ▼
recoverOwnership()
      │
      ▼
Verify guardian signatures
      │
      ▼
Check threshold
      │
      ▼
owner = newOwner
```

The contract also prevents:

- Non-guardian signatures.
- Duplicate guardian signatures.
- Recovery with fewer signatures than the threshold.

---

## 4.3 Why signature uniqueness matters

Simply counting signatures is not sufficient.

For example, with a threshold of `2`, this should **not** work:

```text
Guardian 1
Guardian 1
```

The contract therefore tracks previously accepted signers and rejects duplicates.

The required condition is:

```text
valid distinct guardian signatures >= threshold
```

This makes the recovery mechanism a real threshold-based authorization scheme rather than simply counting arbitrary signatures.

---

# 5. What the Social Recovery Test Proves.

The test checks three different states.

### Before recovery

The original owner's signature is valid:

```text
originalOwnerKey
      ↓
validateUserOp()
      ↓
validationData = 0
```

### During recovery

Two valid guardians sign the recovery message:

```text
Guardian 1 ─┐
            ├──→ recoverOwnership()
Guardian 2 ─┘
                    │
                    ▼
              owner = newOwner
```

### After recovery

The old owner's key is rejected:

```text
originalOwnerKey
      ↓
validateUserOp()
      ↓
validationData = 1
```

while the new owner's key succeeds:

```text
newOwnerKey
      ↓
validateUserOp()
      ↓
validationData = 0
```

This demonstrates that the authorization state changed because the actual on-chain `owner` variable changed.

---

# 6. `SessionKeyAccount` and Custom Authorization

The previous Medium assignment also demonstrates another important feature of programmable accounts: session keys.

The `SessionKeyAccount` allows a temporary key to operate only within a defined scope.

The validation checks include:

- Which session key signed the operation.
- Which target contract is being called.
- Whether the target is allowed.
- Whether the session key has expired.

Conceptually:

```text
Session Key
     │
     ├── Is authorized?
     │
     ├── Is target allowed?
     │
     └── Has session expired?
             │
             ▼
        Accept / Reject
```

This demonstrates the flexibility of ERC-4337:

> Account developers can define their own authorization rules instead of being restricted to a single EOA signature model.

However, those rules have to be implemented and maintained as smart-contract logic.

---

# 7. What Solana Provides Natively.

Solana starts from a different architectural model.

Instead of adding an ERC-4337-style `EntryPoint` contract on top of Ethereum's traditional transaction system, Solana's runtime already provides important primitives for transaction and account execution.

Relevant native concepts include:

- Accounts as first-class runtime objects.
- Programs controlling account state.
- Transaction instructions.
- Multiple accounts being passed into instructions.
- Runtime-level signature verification.
- Runtime-level account ownership and access rules.
- Native transaction execution and fee handling.

Therefore, Solana does not need a direct equivalent of:

```text
UserOperation
        +
EntryPoint
        +
Bundler
```

to achieve programmable application behavior.

Application programs can directly inspect the transaction context and account relationships provided by the runtime.

---

# 8. Direct Architectural Comparison.

| Feature                       | Ethereum ERC-4337                               | Solana                                                           |
| ----------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Programmable account behavior | Smart-account contracts                         | Programs + runtime account model                                 |
| UserOperation                 | Required by ERC-4337 flow                       | No direct equivalent required                                    |
| EntryPoint                    | Central ERC-4337 coordination contract          | No direct equivalent                                             |
| Bundler                       | Submits UserOperations                          | Normal transaction submission model                              |
| Custom validation             | `validateUserOp`                                | Program/runtime authorization logic                              |
| Gas sponsorship               | Paymaster + EntryPoint deposit                  | Can be implemented through Solana transaction/program mechanisms |
| Social recovery               | Custom smart-account logic                      | Custom program/account logic                                     |
| Session keys                  | Custom smart-account logic                      | Custom program/account logic                                     |
| Account deployment            | Usually separate smart-account contract         | Accounts/programs are already native runtime concepts            |
| Execution environment         | EVM + smart contracts + ERC-4337 infrastructure | Solana runtime + programs                                        |

The important distinction is not that Solana automatically provides every high-level feature.

Instead:

> **Solana provides more of the low-level account and transaction machinery directly in the protocol/runtime, while Ethereum ERC-4337 builds a standardized account-abstraction framework using smart contracts and surrounding infrastructure.**

---

# 9. What ERC-4337 Had to Build.

This week's contracts demonstrate several pieces that Ethereum needed to introduce or standardize:

### 1. `PackedUserOperation`

Provides a programmable transaction-like object.

### 2. `EntryPoint`

Coordinates:

- validation
- execution
- gas accounting
- paymaster interaction

### 3. Smart accounts

Examples:

- `MinimalAccount`
- `SessionKeyAccount`
- `SocialRecoveryAccount`

### 4. Paymasters

`SponsorPaymaster` allows another party to pay gas.

### 5. Custom validation

The account can implement:

- owner signatures
- session keys
- guardian signatures
- expiration rules
- target restrictions

This creates a highly modular system, but it also introduces additional contracts and infrastructure.

---

# 10. What This Week's Contracts Still Cannot Do as Cleanly.

## 10.1 Every account has its own logic

Each smart-account implementation contains its own authorization behavior.

For example:

```text
MinimalAccount
    └── owner signature

SessionKeyAccount
    ├── owner/session key
    ├── target restrictions
    └── expiry

SocialRecoveryAccount
    ├── owner
    ├── guardians
    └── threshold
```

This is flexible, but it means that different account designs require different contract implementations.

---

## 10.2 More infrastructure

The ERC-4337 flow involves several components:

```text
User
 │
 ▼
UserOperation
 │
 ▼
Bundler
 │
 ▼
EntryPoint
 │
 ├── Smart Account
 │
 └── Paymaster
```

Compared with a normal Ethereum transaction, this is a significantly larger architecture.

---

## 10.3 More responsibility for developers

A smart-account developer has to correctly implement:

- Signature validation
- Nonce handling
- Execution authorization
- Gas-payment behavior
- Paymaster compatibility
- Recovery rules
- Session-key rules
- Replay protection
- Access control

A mistake in any of these areas can make the account insecure.

---

# 11. Where Solana Is Cleaner.

Solana's model is cleaner in one important architectural sense:

> **The runtime already understands accounts, programs, transactions, signatures, and account access relationships.**

A developer can therefore build application-specific authorization logic on top of those native primitives without first recreating an Ethereum-style account-abstraction coordination layer.

For example, a Solana program can define rules such as:

```text
Only these signers?
        ↓
Are required accounts present?
        ↓
Is the transaction authorized?
        ↓
Modify account state
```

The program does not need to introduce a separate `UserOperation` abstraction simply to express application-specific authorization.

---

# 12. But Solana Does Not Make Everything Automatic.

It would be incorrect to conclude that Solana automatically provides:

- Social recovery
- Session keys
- Paymasters
- Multisig
- Arbitrary account policies

These still require application-level design.

The difference is that Solana developers build these features using a runtime that already provides native account/program primitives.

Therefore:

```text
Ethereum ERC-4337
    = protocol + smart contracts + EntryPoint + account abstraction infrastructure

Solana
    = protocol/runtime primitives + programs implementing application logic
```

Both models still require developers to write application-specific authorization logic.

---

# 13. Does ERC-7702 Close the Gap?

ERC-7702 changes the comparison significantly.

One limitation of traditional Ethereum smart accounts is that an EOA and a smart account are separate concepts.

A user normally has to interact with a deployed smart-account contract to obtain programmable account behavior.

ERC-7702 allows an existing EOA to delegate its execution behavior to contract code.

This can make programmable accounts more practical.

---

## 13.1 What ERC-7702 improves.

ERC-7702 can reduce some of the separation between:

```text
EOA
```

and:

```text
Smart Account
```

This opens the door to features such as:

- Custom authorization
- Transaction batching
- Sponsored execution
- More flexible account behavior

without necessarily requiring users to abandon their existing EOA address.

---

## 13.2 Why it is not the same as Solana

ERC-7702 is still an Ethereum-specific mechanism.

It does not remove:

- Ethereum's transaction model
- Ethereum's EVM
- Ethereum's account model
- ERC-4337 infrastructure where ERC-4337 is being used
- Application-level smart-account logic

Instead, it changes how an existing Ethereum account can use delegated code.

Therefore:

> **ERC-7702 moves Ethereum closer to programmable accounts, but it does not reproduce Solana's native account/runtime architecture.**

---

# 14. Overall Design Position.

Based on the contracts implemented this week, I would describe the two architectures as follows.

### Ethereum ERC-4337

**Strengths:**

- Highly modular.
- Smart accounts can implement arbitrary validation.
- Paymasters enable sponsored gas.
- Session keys can provide limited authorization.
- Social recovery can replace lost owner keys.
- Different components can be composed together.
- Existing Ethereum infrastructure can support the system.

**Costs:**

- More contracts.
- More infrastructure.
- `EntryPoint` coordination.
- UserOperation abstraction.
- Bundler infrastructure.
- Developers must implement account validation securely.
- Different account designs may require separate smart-account implementations.

---

### Solana

**Strengths:**

- Account/program behavior is native to the runtime.
- Transaction execution already understands account relationships.
- Programs can implement custom authorization directly.
- No direct equivalent of an ERC-4337 EntryPoint is required.
- No separate UserOperation abstraction is required for basic programmable application behavior.

**Costs:**

- Application-specific features still require program logic.
- Social recovery is not automatically provided.
- Session keys are not automatically provided.
- Sponsored transactions still require an application-level design.
- Developers still need to reason carefully about authorization and account state.

---

# 15. Final Conclusion.

This week's implementation makes the architectural difference concrete.

We built:

```text
MinimalAccount
       │
       └── Basic programmable account

SessionKeyAccount
       │
       └── Custom session-key authorization

SponsorPaymaster
       │
       └── External gas sponsorship

SocialRecoveryAccount
       │
       └── Guardian-based ownership recovery
```

All of these features are possible because Ethereum's account behavior can be moved into smart-contract logic and coordinated through ERC-4337's `EntryPoint`.

The trade-off is that Ethereum has to assemble these pieces around its existing transaction model.

Solana starts from a runtime where programs, accounts, signatures, and transaction execution are already native concepts. It therefore does not need to reproduce an ERC-4337-style `EntryPoint` architecture just to make application-level authorization programmable.

However, Solana does not magically provide every high-level account-abstraction feature. Developers still need to implement policies such as multisig, recovery, session authorization, and sponsorship.

The key difference is therefore **where the abstraction lives**:

```text
Ethereum:                                       Solana:

EOA / Smart Account                             Transaction
        ↓                                           ↓
UserOperation                                   Solana Runtime
        ↓                                           ↓
EntryPoint                                      Program
        ↓                                           ↓
Account + Paymaster                             Accounts + Program Logic
        ↓
EVM execution
```

ERC-7702 is an important step toward reducing the separation between EOAs and programmable accounts on Ethereum, but it remains an Ethereum-specific mechanism rather than a copy of Solana's native model.

My conclusion is therefore:

> **ERC-4337 gives Ethereum a powerful and modular way to make accounts programmable, but it does so by constructing an abstraction layer above Ethereum's existing transaction model. Solana's architecture provides more of the underlying account and transaction programmability directly at the runtime level. ERC-7702 narrows this architectural gap by making existing EOAs more programmable, but Ethereum and Solana still solve account abstraction through fundamentally different architectural approaches.**
