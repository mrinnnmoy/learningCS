# List of things learned.

## 1. The problem with EOAs. (A private key as a single point of failure)

Every EOA (Week 26, Concept 1) has its own validation logic fixed permanently at the _protocol_ level.

Exactly one ECDSA signature, over exactly one private key, full stop.

No way to add a spending limit, a multisig requirement, a recovery mechanism or a time-scoped permission to an EOA itself, ever, no matter how the account is used.

Lose that one key (Week 4's own seed-phrase risk) and the account is gone, permanently, with no path back.

The exact, specific limitation every other concept this week works around, one piece at a time.

---

## 2. ERC-4337 architecture overview.

The genuinely elegant part of ERC-4337's own design.

It achieves everything below **entirely in smart contracts and off-chain infrastructure**, with zero changes to the Ethereum protocol itself.

A "smart account" is simply a contract implementing a specific interface (Concept 3) and a separate, parallel system of off-chain actors (Concept 4) and one real, canonical on-chain contract (Concept 5) makes using one feel, from a user's own point of view, like sending an ordinary transaction.

Worth naming the real, live alternative approach directly, since it's genuinely current, not hypothetical.

**ERC-7702** (part of Ethereum's real Pectra hard fork, live since May 2025) takes the opposite path.

An actual _protocol-level_ change letting an EOA temporarily delegate its own execution to contract code, without needing a separate smart account at all.

The two aren't competitors so much as different layers of the identical underlying goal.

EntryPoint v0.8 (Tutorial, step 2) added _native_ support for EIP-7702 specifically so the two approaches can compose rather than fork the ecosystem in two directions.

---

## 3. UserOperations.

The actual "pseudo-transaction" object a smart account acts on, structurally similar to a real transaction (Week 26, Concept 6) but processed entirely differently.

No protocol-level transaction type of its own, just a struct passed into a real contract call (Concept 5).

```solidity
struct PackedUserOperation {
    address sender;                 // the smart account this operation is FOR
    uint256 nonce;
    bytes initCode;                 // if the account doesn't exist yet, deploys it first (a factory call)
    bytes callData;                 // what the account should actually DO once validated
    bytes32 accountGasLimits;       // packed: verificationGasLimit | callGasLimit
    uint256 preVerificationGas;
    bytes32 gasFees;                // packed: maxPriorityFeePerGas | maxFeePerGas
    bytes paymasterAndData;         // Concept 6 — who's paying, and how
    bytes signature;                // checked by the ACCOUNT's own code, not a fixed protocol rule (Concept 1)
}
```

`accountGasLimits` and `gasFees` packing two `uint128` values into one `bytes32` each is a real, deliberate gas-optimization detail, not an arbitrary encoding choice.

Easy's own assignment includes the exact helper needed to build one correctly.

---

## 4. Bundlers.

UserOperations don't enter the ordinary transaction mempool (Week 2, Concept 6) at all.

They sit in a **separate, alternative mempool** specifically for UserOperations, watched by **bundlers**.

Off-chain actors (a real, new role, genuinely distinct from Week 37's own relayer and Week 41's own oracle, though structurally adjacent to both) who simulate pending UserOperations, batch several together and submit them as one real, ordinary transaction calling `EntryPoint.handleOps()` (Concept 5).

Earning a portion of the gas those UserOperations themselves pay for, as compensation for fronting the real transaction.

A genuinely important, easy-to-miss fact worth stating directly.

`handleOps()` is a plain, public function, callable by _anyone_ "being a bundler" isn't a permissioned role granted by anyone, it's simply the act of calling this one function with a batch of UserOperations, exactly why this week's own assignments can play the bundler's own role directly and honestly, rather than needing to run a real, separate bundler service.

---

## 5. The EntryPoint contract.

The one real, canonical, singleton contract (Tutorial, step 2) every compliant smart account and every bundler ultimately talks to.

It orchestrates the entire flow, calling each UserOperation's own `validateUserOp` (Concept 1's fixed rule, replaced here by whatever code the account itself implements), collecting whatever gas payment is owed (from the account directly, or from a paymaster, Concept 6), executing the operation's own `callData` and refunding the bundler for the real gas it actually spent.

```solidity
function handleOps(PackedUserOperation[] calldata ops, address payable beneficiary) external;
```

Nothing about this function is special-cased to any particular account implementation.

It's the identical, real contract every different smart account this week builds (Easy's simple owner-based one, Medium's session-key one, Hard's paymaster-sponsored and socially-recoverable ones) all interact with in exactly the same way.

---

## 6. Paymasters. (sponsored, gasless transactions)

A **paymaster** is a separate contract that can agree to cover a UserOperation's own gas cost.

The real mechanism behind "gasless" UX real apps genuinely advertise, where a user interacts with a dapp having never held any ETH at all.

A paymaster implements its own validation hook, deciding _whether_ to sponsor a given UserOperation (an allowlist, a rate limit, accepting payment in an ERC-20 token instead of ETH) and must first **deposit real ETH into the EntryPoint itself**, a real, required step, before it can sponsor anything at all.

```solidity
entryPoint.depositTo{value: 1 ether}(address(paymaster));   // REQUIRED before the paymaster can sponsor anything

function validatePaymasterUserOp(PackedUserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost)
    external returns (bytes memory context, uint256 validationData);
```

Hard's own assignment builds and funds a real paymaster, then runs a UserOperation from an account holding _zero_ ETH of its own.

The gas genuinely comes from the paymaster's own EntryPoint deposit, not the account.

---

## 7. Smart contract wallets. (real, named providers)

Worth naming the real, current landscape directly, the same factual treatment Week 41 gave Chainlink and Pyth.

**Safe** (Week 38's own naming) is the dominant _multisig_ smart wallet, not originally ERC-4337-native, though it now ships an ERC-4337 module.

**Biconomy** and **ZeroDev** are ERC-4337-native infrastructure specifically, providing SDKs and bundler/paymaster services built around this exact standard.

A wider real ecosystem sits around the same standard:

- Alchemy,
- Pimlico,
- Stackup,
- Candide,
- Etherspot and
- thirdweb.

All offer some combination of bundler RPCs, paymaster contracts and wallet SDKs.

This week's own assignments build simplified, educational versions of exactly what these real, live providers offer in production, the identical relationship this course's own `MockERC20` has always had to a real, audited token.

---

## 8. Session keys.

Because a smart account's own `validateUserOp` (Concept 1's fixed rule, genuinely replaced by real code here) is just ordinary Solidity, it can implement validation rules an EOA structurally cannot.

A **session key**, a separate, temporary signing key, scoped to only authorize specific kinds of calls, for a limited time, without ever having access to the account's own full authority.

```solidity
struct SessionKey {
    address key;
    address allowedTarget;      // this session key can ONLY authorize calls to this ONE contract
    uint256 expiry;            // and only until this timestamp
}
```

Medium's own assignment builds exactly this.

A session key that successfully authorizes an allowed call, fails outright against a disallowed target and fails again once its own expiry has passed (`vm.warp`, Week 31's own pattern).

A real, concrete capability with zero equivalent for a plain EOA, whose validation the protocol itself fixes permanently (Concept 1).

---

## 9. Social recovery mechanisms.

The direct fix for Concept 1's own worst failure mode.

Since a smart account's `owner` (or equivalent) is simply a _storage variable_ the account's own code controls, rather than a protocol-level fact the way an EOA's key is, that variable can be designed to be _replaceable_.

A set of **guardians** (Week 38 and 42's own `M`-of-`N` threshold pattern, reused directly for a genuinely new purpose) can collectively authorize swapping in a brand-new owner key if the original is ever lost or compromised, with no way for a plain EOA to ever offer the equivalent.

```solidity
function recoverOwnership(address newOwner, bytes[] calldata guardianSignatures) external {
    // require `threshold` distinct, valid guardian signatures — Week 38/42's own exact pattern
    owner = newOwner;   // the OLD key stops working; the NEW one starts, immediately
}
```

Hard's own assignment demonstrates the old owner's own signature genuinely failing to validate any further UserOperation the instant recovery completes and the new owner's own signature working correctly from that point forward.

---

## 10. Native account abstraction. Tthe Solana comparison)

The single most satisfying closing comparison this course can draw, back to its own very first half.

Everything ERC-4337 builds this week, custom validation logic, session-scoped permissions, social recovery, is something Solana's own account model (Week 11) has supported **natively, from day one**, with no separate standard layered on top at all.

Every Solana program can already implement arbitrary signature schemes, multisig logic, or delegation rules directly, because Solana never had Ethereum's own EOA-vs-contract-account split (Week 26, Concept 1) to begin with.

There was never a "plain," protocol-fixed account type whose validation logic couldn't be customized in the first place.

ERC-4337 is a genuinely clever, real, and necessary piece of engineering specifically _because_ Ethereum's own account model needed retrofitting to reach a capability Solana's own architecture simply started with.

---

## 11. The full UserOperation lifecycle, start to finish.

```
User's own dapp                Bundler (Concept 4)              EntryPoint (Concept 5)         Smart Account
────────────────                ────────────────────              ─────────────────────         ─────────────
builds a UserOperation,
signs it (Concept 3)
      │
      ▼
submits to the alt-mempool ──►
                              simulates, batches with
                              other pending UserOps
                                        │
                                        ▼
                              calls handleOps(ops, beneficiary) ──►
                                                                  validateUserOp() ──────────►
                                                                                            checks signature
                                                                                            (owner, session key —
                                                                                             Concepts 1, 8 — or
                                                                                             guardian-replaced
                                                                                             owner, Concept 9)
                                                                  ◄────────────────────────  returns validationData
                                                                  (Concept 6 — if a paymaster
                                                                   is attached, its own
                                                                   validatePaymasterUserOp
                                                                   runs here too)
                                                                        │
                                                                        ▼
                                                                  executes callData ─────────►
                                                                                            the account's own
                                                                                            real, intended action
                                                                  refunds the bundler
                                                                  for real gas spent
```

Every assignment this week runs a real, concrete slice of this exact diagram.

Easy the plain owner path, Medium the session-key branch, Hard both the paymaster branch and the guardian-replaced-owner branch.

---

## Assignment.

1. **Easy - A Minimal Smart Account, Validated by the Real, Canonical EntryPoint.**

   **What you practice:**
   - Building a real, compliant `IAccount` implementation from scratch (Concepts 1, 3)
   - Constructing a real `PackedUserOperation` by hand, including the `accountGasLimits`/`gasFees` packing detail (Concept 3)
   - Playing the bundler's own real role directly — calling `handleOps()` yourself, honestly, exactly what a real bundler does (Concepts 4, 5)

   **Requirements:**
   - A `MinimalAccount is IAccount` contract: `owner` (settable only at construction), `validateUserOp` recovering the signer from `userOp.signature` against the account's own `userOpHash`, returning `0` for a valid owner signature or `1` otherwise (ERC-4337's own real convention for validation failure), forwarding any `missingAccountFunds` back to the `EntryPoint`; `execute(address target, uint256 value, bytes calldata data)`, callable by the owner directly or by the `EntryPoint` itself.
   - A test forking Sepolia, deploying a fresh `MinimalAccount`, funding it with real (forked) ETH, building and signing a real `PackedUserOperation` whose `callData` transfers ERC-20 tokens the account itself holds, and calling the REAL `EntryPoint.handleOps()` directly, confirming the transfer genuinely executed.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output:
           Ran 1 test for test/MinimalAccount.t.sol:MinimalAccountTest
           [PASS] testFix_UserOperationExecutesViaTheRealEntryPoint()

   2. Command: forge test --match-test testFix_UserOperationExecutesViaTheRealEntryPoint -vvvv

       Expected output: a full trace showing `handleOps` genuinely calling
       INTO the real, live `EntryPoint` bytecode (visible in the trace as
       real, forked contract code, not a mock), which then calls back into
       `MinimalAccount.validateUserOp`, then `execute` — confirming Concept
       11's own full diagram running for real, against real, canonical
       infrastructure this course didn't deploy.

   3. Action: in the test, temporarily sign the UserOperation with a
       DIFFERENT, wrong private key (any value other than `ownerKey`)
       instead, then re-run.

       Expected result: `validateUserOp` now returns `1` (Concept 3's own
       "signature failure" convention) instead of `0`, and the real
       `EntryPoint` itself rejects the whole operation — confirming
       signature validation is genuinely enforced by the real, canonical
       contract, not just this account's own optimistic logic.

   4. Action: remove the `vm.deal(address(account), 1 ether);` line
       entirely, then re-run.

       Expected result: the operation now fails, since `MinimalAccount`
       has nothing to forward back to the `EntryPoint` when
       `missingAccountFunds` is nonzero — confirming Concept 5's own gas
       accounting is real and enforced, not merely a formality. Revert the
       change afterward.
   ```

2. **Medium - Session Keys: Scoped, Temporary Signing Authority.**

   **What you practice:**
   - Validation logic an EOA structurally cannot express — a second, separate key with genuinely restricted authority (Concept 8)
   - The exact failure modes a session key's own scoping produces: wrong target, and expired

   **Requirements:**
   - A `SessionKeyAccount` (extending Easy's own `MinimalAccount` in spirit): `setSessionKey(address key, address allowedTarget, uint256 expiry)` (owner-only), storing one active session key at a time.
   - `validateUserOp` accepts EITHER a valid owner signature (full authority, unchanged from Easy) OR a valid session key signature, but only if the UserOperation's own decoded `callData` target matches `allowedTarget` AND `block.timestamp <= expiry` — any session-key-signed operation failing either check returns `1` (Concept 3's own failure convention), not a revert.
   - A test: a session key successfully executes a call to its own `allowedTarget`; the identical key fails against a DIFFERENT target; the identical key, still targeting the right contract, fails once `vm.warp` moves past its own `expiry`.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 3 tests for test/SessionKey.t.sol:SessionKeyTest
           [PASS] testExploit_SessionKeyFailsAfterItsOwnExpiry()
           [PASS] testExploit_SessionKeyFailsAgainstADisallowedTarget()
           [PASS] testFix_SessionKeySucceedsWithinItsOwnScope()

   2. Command: forge test --match-test testExploit_SessionKeyFailsAgainstADisallowedTarget -vvvv

       Expected output: a trace showing `validateUserOp` correctly
       recovering the session key's own real signature, but returning `1`
       because the decoded target doesn't match `sessionAllowedTarget` —
       confirming Concept 8's own scoping is checked against the ACTUAL
       decoded call, not just whether a signature is valid at all.

   3. Action: change the session key's own configured `allowedTarget`
       (via a fresh `setSessionKey` call from the owner) to
       `address(disallowedToken)` instead, then repeat
       `testExploit_SessionKeyFailsAgainstADisallowedTarget`'s own exact
       call.

       Expected result: it now SUCCEEDS — confirming the scoping is
       genuinely dynamic and owner-configurable, not hardcoded to any
       specific token address baked into the contract itself.

   4. Action: confirm the owner's OWN signature still works, unaffected
       by any of the session key's own restrictions, by calling
       `_buildAndSubmit(ownerKey, address(disallowedToken), 50 ether)`
       directly.

       Expected result: succeeds — confirming Concept 8's own scoping
       applies ONLY to the session key, never to the owner's own full
       authority, exactly the intended, real distinction.
   ```

3. **Hard - A Real Paymaster, Sponsored Gasless Transactions and Social Recovery.**

   **What you practice:**
   - A real paymaster, funded through the real `EntryPoint`'s own deposit mechanism, sponsoring a UserOperation for an account holding zero ETH (Concept 6)
   - Guardian-based social recovery, genuinely replacing a lost owner key (Concept 9)
   - Solana's own native account abstraction (Concept 10), argued directly against everything built this week

   **Requirements:**
   - A `SponsorPaymaster` contract: `validatePaymasterUserOp` sponsoring any UserOperation from an allowlisted `sponsoredAccount` unconditionally; deposits real ETH into the `EntryPoint` via `depositTo` before sponsoring anything.
   - A test running a full UserOperation for an account holding **zero ETH**, confirming it succeeds ONLY because the paymaster covers the cost — and confirming it FAILS if attempted without `paymasterAndData` set at all.
   - A `SocialRecoveryAccount` (extending Easy's own `MinimalAccount` in spirit): a fixed set of `guardians` and a `threshold`; `recoverOwnership(address newOwner, bytes[] calldata guardianSignatures)`, requiring `threshold` distinct valid guardian signatures (Week 38/42's own exact multisig-signature pattern) before replacing `owner`.
   - A test: the original owner's signature validates a UserOperation successfully; guardians recover the account to a NEW owner; the OLD owner's signature now fails; the NEW owner's signature now succeeds.
   - An `ACCOUNT_ABSTRACTION_DESIGN.md`, arguing Concept 10's own Solana comparison concretely against this week's specific, real contracts.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 2 tests for test/SponsoredTransaction.t.sol:SponsoredTransactionTest
           [PASS] testExploit_UnsponsoredZeroEthAccountFails()
           [PASS] testFix_ZeroEthAccountSucceedsViaSponsoredPaymaster()
           Ran 2 tests for test/SocialRecovery.t.sol:SocialRecoveryTest
           [PASS] testExploit_InsufficientGuardianSignaturesCannotRecover()
           [PASS] testFix_GuardiansRecoverOwnershipAndOldKeyStopsWorking()

   2. Command: forge test --match-test testFix_ZeroEthAccountSucceedsViaSponsoredPaymaster -vvvv

       Expected output: a trace showing the real `EntryPoint` calling
       `SponsorPaymaster.validatePaymasterUserOp`, then drawing real gas
       payment from the paymaster's own EntryPoint deposit (Concept 6),
       NEVER touching the account's own (zero) balance at all — confirming
       "gasless," in this context, means genuinely paid by someone else,
       not simply cheap.

   3. Command: forge test --match-test testFix_GuardiansRecoverOwnershipAndOldKeyStopsWorking -vvvv

       Expected output: a trace confirming `_validateWith(originalOwnerKey)`
       genuinely returns `0` before recovery and `1` after — the SAME real
       private key, the SAME signing logic, a categorically different
       result purely because `owner` itself, a plain storage variable
       (Concept 9), changed underneath it.

   4. Action: re-read Concept 10, then fill in
       ACCOUNT_ABSTRACTION_DESIGN.md's own three sections with real,
       specific reasoning about the actual contracts built this week —
       not a generic restatement of the Concept 10 comparison. There's no
       single "correct" wording Foundry can check here; the point is a
       real, argued position, the same standard every previous week's own
       design-document deliverable has been held to.
   ```
