# List of things learned.

## 1. `payable` functions.

A function marked `payable` is the only kind of function allowed to receive ETH alongside a call, via `msg.value`. (Week 27, Concept 9)

Every other function reverts automatically if any ETH is attached, a compiler-enforced default-deny that's easy to under-appreciate until Concept 8 shows what's at stake around money moving through a contract at all.

This is the promise Week 27's Concept 12 named but deliberately didn't use. This week is where it gets used, for real.

```solidity
function deposit() external payable {
    balances[msg.sender] += msg.value;   // msg.value: Week 27, Concept 9
}
```

Constructors can be `payable` too, letting a contract be funded at the moment it's deployed (Week 27, Concept 5) and plain state variables can be marked `payable` when typed as `address payable`.

The specific address type allowed to receive ETH via `.transfer`/`.send` (Concept 2).

A plain `address` has to be explicitly cast to `address payable` first, the compiler's way of forcing a deliberate choice before money can move.

---

## 2. Sending & receiving ETH. (`transfer`, `send` & `call`)

Three different ways exist to actually move ETH out of a contract and they are not interchangeable, differing in gas forwarded, failure behavior and as of current Solidity best practice — which one you should actually reach for.

```solidity
payable(recipient).transfer(amount);                        // reverts on failure, forwards 2300 gas

bool ok = payable(recipient).send(amount);                  // returns false on failure, forwards 2300 gas

(bool ok2, ) = recipient.call{value: amount}("");           // returns false on failure, forwards ALL remaining gas
```

|                                                                                         | `.transfer()`                                                                | `.send()`                                                                               | `.call{value: x}("")`                                                                                            |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Gas forwarded                                                                           | Fixed 2300                                                                   | Fixed 2300                                                                              | All remaining gas (or a manually specified amount)                                                               |
| On failure                                                                              | Reverts automatically                                                        | Returns `false`, execution continues                                                    | Returns `false`, execution continues                                                                             |
| Recipient can be a contract with real logic in `receive()`/`fallback()` (Concepts 3, 4) | Only if that logic fits in 2300 gas — most real logic doesn't                | Same 2300-gas ceiling                                                                   | Yes, any amount of logic                                                                                         |
| Current best practice                                                                   | Avoid — the fixed stipend breaks against many legitimate contract recipients | Avoid, same reason, plus silent failure if the caller forgets to check the return value | Preferred, paired with Concept 9's Checks-Effects-Interactions discipline to stay safe despite the unlimited gas |

The fixed 2300-gas stipend on `.transfer()`/`.send()` was originally meant as a reentrancy defense in itself (2300 gas isn't enough for a recipient contract to do much, historically not even enough to write to storage).

Concept 8 explains directly why relying on a gas stipend as _the_ defense stopped being good practice once gas costs for certain opcodes changed and more fundamentally, why it was never a substitute for Concept 9's own discipline even when it worked.

---

## 3. The `receive()` function.

A special, unnamed function, `receive() external payable { ... }`.

At most one per contract, no parameters, no return value, runs automatically whenever the contract receives ETH via a plain transfer with empty calldata.

Exactly what happens when `Concept 2`'s `.call{value: amount}("")` (empty `""`) targets this contract, or when a plain EOA-to-contract ETH send happens from a wallet with no function call attached at all.

```solidity
receive() external payable {
    balances[msg.sender] += msg.value;
    emit Deposited(msg.sender, msg.value);
}
```

If a contract has no `receive()` defined at all and receives a plain ETH transfer with empty calldata, `fallback()` (Concept 4) is what runs instead, if that exists.

And if neither exists, the transfer reverts outright, a contract can genuinely refuse ETH just by omitting both.

---

## 4. The `fallback()` function.

`fallback() external [payable] { ... }`, also at most one per contract, runs when a call arrives with calldata that doesn't match any existing function's selector (Week 26, Concept 6's 4-byte selector).

Or when it arrives with empty calldata specifically _and_ no `receive()` is defined (Concept 3's own fallthrough rule).

Unlike `receive()`, `fallback()` can optionally access the raw incoming `msg.data` (Week 27, Concept 9), which is exactly what makes it the mechanism behind Week 33's proxy pattern later in this course.

A proxy's `fallback()` reads whatever calldata arrived and forwards it onward via `delegatecall` (Concept 6), without needing to know in advance what function was being called.

```solidity
fallback() external payable {
    emit FallbackTriggered(msg.sender, msg.value, msg.data);
}
```

---

## 5. `receive()` vs. `fallback()`. (which one actually runs)

Both Concepts 3 and 4 exist because Solidity needs an answer for _"what happens when a call doesn't cleanly match a normal function,"_ and the answer branches on two things:

- whether calldata is empty and
- whether ETH is attached.

```
Incoming call
   │
   ├─ calldata empty?
   │     ├─ yes ── receive() exists? ──yes──> runs receive()
   │     │              │
   │     │              no
   │     │              ▼
   │     │        fallback() exists? ──yes──> runs fallback()
   │     │              │
   │     │              no ──> REVERTS (contract cannot accept this)
   │     │
   │     └─ no  ──> fallback() exists? ──yes──> runs fallback(), gets full msg.data
   │                     │
   │                     no ──> REVERTS (no matching function, no fallback)
```

|                                   | `receive()`                                      | `fallback()`                                                                  |
| --------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Triggered by                      | Plain ETH transfer, empty calldata               | Unmatched function selector, or empty calldata with no `receive()`            |
| Parameters / access to `msg.data` | None                                             | Full access, `bytes calldata`/`bytes memory` depending on payable variant     |
| Must be `payable` to accept ETH   | Always payable by definition                     | Only if declared `payable`                                                    |
| Typical use                       | Accepting plain ETH deposits (Easy's assignment) | Proxy forwarding (Week 33), catching mistaken calls, logging unexpected input |

---

## 6. Low-level calls. (`call`, `delegatecall`, `staticcall`)

All three send a raw, ABI-encoded message (Week 26, Concept 6) to a target address and return `(bool success, bytes memory returnData)` rather than reverting automatically on failure the way a normal Solidity function call does.

The caller has to check `success` itself, an easy thing to forget and a real, named category in Week 20's Solana-side security list's spiritual EVM cousin (Week 31 covers this specific EVM failure mode directly).

The three differ in exactly one axis each:

- whose storage context the call executes in and
- whether it's allowed to modify state at all.

```solidity
(bool ok1, bytes memory r1) = target.call(data);            // target's own storage, can write
(bool ok2, bytes memory r2) = target.delegatecall(data);    // CALLER's storage, can write
(bool ok3, bytes memory r3) = target.staticcall(data);      // target's own storage, read-only — reverts on any write attempt
```

```
call:               Caller ──code runs in Target's storage──> Target's storage changes
delegatecall:       Caller ──code borrowed from Target, runs in CALLER's storage──> Caller's storage changes
staticcall:         Caller ──code runs in Target's storage, writes forbidden──> nothing changes (or reverts)
```

|                                   | `call`                    | `delegatecall`                        | `staticcall`                                           |
| --------------------------------- | ------------------------- | ------------------------------------- | ------------------------------------------------------ |
| Storage context                   | Target's own              | Caller's own (!)                      | Target's own                                           |
| Can write state                   | Yes                       | Yes (in caller's storage)             | No — reverts on write                                  |
| `msg.sender` inside target's code | The calling contract      | Unchanged — still the ORIGINAL caller | The calling contract                                   |
| Typical use                       | Ordinary CCIs (Concept 7) | Proxy/library patterns (Week 33)      | Safe read-only probes, `view`-equivalent for raw calls |

`delegatecall` is genuinely the sharpest tool here and worth naming plainly as dangerous by default.

Because it runs in the _caller's_ storage, the two contracts' storage layouts (Week 27, Concept 2's slot ordering) must line up exactly or a write meant for one variable silently corrupts a completely different one.

This is precisely the storage-collision risk Week 33 covers in depth for proxies, demonstrated safely and locally in this week's own Medium assignment first.

Worth one more cross-chain comparison.

Solana's Cross-Program Invocation (Week 11, Concept 8; Week 14) never merges storage context this way, a called program always operates on its own accounts regardless of who invoked it.

`delegatecall`'s storage-borrowing has no real Solana equivalent, it's a genuinely EVM-specific capability.

---

## 7. Cross-contract interactions (CCIs).

Any time one deployed contract calls into another, whether via a low-level call (Concept 6) or, more commonly and more safely, via a typed interface (Concept 10, covered as necessary added material below), that's a CCI.

The Ethereum-side counterpart to Week 11's Cross-Program Invocation, with one structural difference worth naming directly.

- A Solana CPI (Week 14) explicitly lists every account the invoked program will touch, passed in by the caller, checked by the runtime;
- An EVM CCI has no such list, the called contract can read and depending on which mechanism from Concept 6 is used, write whatever its own code touches, with no equivalent of Solana's account-list-based sandboxing.

This is exactly why Concepts 8 and 9 below matter as much as they do, nothing structural stops a called contract from calling back into the caller before the caller's own state settles.

---

## 8. Reentrancy risks in cross-contract calls.

When contract A calls out to contract B (a CCI, Concept 7) and B's code deliberately or not calls back into A _before_ A's own call to B has returned.

A's execution resumes mid-function, potentially re-running logic against state A hasn't finished updating yet.

This becomes a real vulnerability specifically when a function reads a balance, sends ETH out based on that balance (Concept 2) and only updates the recorded balance _after_ the send.

Since the moment ETH is sent via `.call{value}("")` to a contract recipient, that recipient's `receive()` (Concept 3) runs automatically, mid-transaction, with the sender's balance still showing its pre-withdrawal amount.

```
Attacker.attack()
  └─> Vault.withdraw()                                          balances[Attacker] = 10 ETH  (not yet cleared)
        └─> call{value: 10}(Attacker)                           ETH sent BEFORE the balance is zeroed — the bug
              └─> Attacker.receive()                            triggered automatically by the incoming ETH (Concept 3)
                    └─> Vault.withdraw()  balances[Attacker]    is STILL 10 ETH — re-enters!
                          └─> call{value: 10}(Attacker) ...
                                └─> Attacker.receive() ...      (repeats — Hard's assignment bounds this)
        balances[Attacker] = 0                                  <- only runs once the FIRST call finally unwinds,
                                                                long after the vault has already paid out several times over
```

This week's Hard assignment builds and runs exactly this, deliberately, against a contract deployed only locally against your own `anvil` chain, never against a real target.

Week 31 covers the wider vulnerability catalogue this belongs to (missing signer/owner-check analogues, integer issues and others) in full, this week isolates reentrancy specifically because Concepts 1 through 7 above are exactly the mechanism it depends on.

---

## 9. The Checks-Effects-Interactions (CEI) pattern.

The fix for Concept 8 and simple enough to state in one line.

Inside any function that both changes state and sends ETH or makes an external call, do every check first (`require`/custom errors, Week 27 Concept 10, 13), then every state change (Week 27, Concept 2) and only _then_ the external interaction (Concept 6, 7) never send ETH out, or call another contract, before your own bookkeeping already reflects the new state.

```solidity
function withdraw() external {
    uint256 bal = balances[msg.sender];
    require(bal > 0, "nothing to withdraw");            // CHECK

    balances[msg.sender] = 0;                           // EFFECT — before the call, this is the whole fix

    (bool ok, ) = msg.sender.call{value: bal}("");      // INTERACTION — last, on purpose
    require(ok, "transfer failed");
}
```

Under CEI, Concept 8's re-entering `Vault.withdraw()` call reads `balances[Attacker]` as already `0` and does nothing further.

The attack in Concept 8's diagram simply can't get past its first re-entrant call.

CEI is a _pattern_, not a compiler-enforced rule the way `payable` (Concept 1) is, which is exactly why Concept 11 below adds a second, mechanical layer of defense on top of it, belt-and-suspenders rather than either alone.

---

## 10. Interface-based external calls. (typed CCIs)

Concept 6's low-level `call` works, but hand-encoding calldata by function signature string is exactly the kind of error-prone manual ABI work Week 26's Concept 6 already flagged as fragile.

A Solidity `interface` declares a target contract's callable functions by their real typed signatures and calling through it produces the correct ABI-encoded calldata automatically, with the compiler checking argument types at compile time rather than failing silently at runtime the way a mistyped low-level `call` would.

```solidity
interface ILogger {
    function log(string calldata note) external;
}

ILogger(loggerAddress).log("split executed");   // compiler-checked, auto-encoded — Concept 7's CCI, done safely
```

This is the version of a CCI every later week that calls into another contract by name reaches for by default, Week 29's ERC-20 interactions and Week 37's bridge contracts both call through interfaces exactly this way.

Concept 6's raw `call`/`delegatecall`/`staticcall` stay necessary specifically for the cases an interface can't express

- an unknown target ABI,
- a proxy's blind-forwarding `fallback()` (Concept 4),
- or `delegatecall`'s storage-borrowing itself,

which has no "typed" version at all.

---

## 11. Reentrancy guards. (A second, mechanical layer of defense)

Concept 9's CEI ordering is a _discipline_, easy to get right in one function and easy to miss in a codebase with many of them.

A reentrancy guard makes the same protection mechanical and compiler-enforced-in-spirit, a modifier (Week 27, Concept 4) that tracks whether a protected function is already mid-execution and reverts any attempt to re-enter it.

Regardless of whether that particular function's own CEI ordering happens to be correct.

```solidity
bool private locked;

modifier nonReentrant() {
    if (locked) revert ReentrantCall();
    locked = true;
    _;
    locked = false;
}
```

Hard's assignment applies both CEI and this guard to the same fixed contract, deliberately redundant, to demonstrate that either one alone would have stopped Concept 8's specific attack, matching real-world practice.

Week 29 swaps this hand-rolled version for OpenZeppelin's own audited `ReentrancyGuard`, unchanged in mechanism, exactly the same substitution Week 27, Concept 11 made for `Ownable`.

---

## Assignment.

1. **Easy - A Payable Vault: `receive()`, `fallback()` and Safe Withdrawals.**

   **What you practice:**
   - `payable` functions and accepting ETH via an explicit `deposit()` (Concept 1)
   - `receive()` for plain ETH transfers, `fallback()` for anything else, and telling the two apart in practice (Concepts 3, 4, 5)
   - Sending ETH back out via `.call{value}("")`, not `.transfer()`/`.send()` (Concept 2)
   - The Checks-Effects-Interactions pattern, applied for real, for the first time (Concept 9)
   - Reinforces Week 27: custom errors (Concept 13), `msg.sender`/`msg.value` (Concept 9)

   **Requirements:**
   - A `SimpleVault` contract with a private `mapping(address => uint256) balances`.
   - `deposit()`, `payable`, credits `msg.sender`'s balance by `msg.value`, emits `Deposited(address indexed from, uint256 amount)`.
   - `receive()`, does exactly what `deposit()` does (credits the sender, emits the same event) — a plain ETH transfer with no calldata should work identically to calling `deposit()` explicitly.
   - `fallback()`, `payable`, emits `FallbackTriggered(address indexed from, uint256 amount, bytes data)` without crediting any balance — it exists to make unmatched calls observable, not to silently accept them as deposits.
   - `withdraw(uint256 amount)`, following CEI exactly: reverts `InsufficientBalance(uint256 requested, uint256 available)` if `amount` exceeds the caller's balance, otherwise updates the balance _before_ sending ETH via `.call{value: amount}("")`, reverts `ETHTransferFailed()` if that call fails, emits `Withdrawn(address indexed to, uint256 amount)` on success.
   - `balanceOf(address account)`, `view`, returns that account's recorded balance.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command:
           cast send <ADDRESS> "deposit()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

           cast call <ADDRESS> "balanceOf(address)(uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
           --rpc-url http://127.0.0.1:8545

       Expected output: `1000000000000000000` (1 ETH in wei, Week 26
       Concept 10) — confirming deposit() credited the caller correctly.

   2. Command (a plain ETH send, no function call — exercises receive()
       specifically, Concept 3, distinct from Test Case 1's explicit call):
           cast send <ADDRESS> --value 0.5ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

           cast call <ADDRESS> "balanceOf(address)(uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
           --rpc-url http://127.0.0.1:8545

       Expected output: `1500000000000000000` (1.5 ETH) — confirming a
       plain transfer with no calldata was credited identically to an
       explicit deposit() call, proving receive() genuinely runs and
       genuinely shares deposit()'s own logic rather than silently
       swallowing the ETH.

   3. Command:
           cast send <ADDRESS> "withdraw(uint256)" 2000000000000000000 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: reverts, decodable as
       `InsufficientBalance(2000000000000000000, 1500000000000000000)` —
       the caller only has 1.5 ETH recorded, requesting 2 correctly fails
       with both numbers visible in the revert itself (Week 27, Concept 13).

   4. Command: in src/SimpleVault.sol, temporarily reorder withdraw() so
       the external call happens BEFORE the balance update (reintroducing
       Concept 8's exact bug on purpose):

           function withdraw(uint256 amount) external {
               uint256 bal = balances[msg.sender];
               if (amount > bal) revert InsufficientBalance(amount, bal);

               (bool ok, ) = msg.sender.call{value: amount}("");   // moved up — INTERACTION before EFFECT
               if (!ok) revert ETHTransferFailed();

               balances[msg.sender] = bal - amount;                 // now runs last
           }

       Rebuild and redeploy fresh (note the NEW address, <ADDRESS2>), then:
           cast send <ADDRESS2> "deposit()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

           cast send <ADDRESS2> "withdraw(uint256)" 1000000000000000000 \
           --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

       Expected output: this specific withdraw() still succeeds fine on
       its own — an ordinary EOA has no receive()/fallback() logic to
       re-enter with, so the reordering alone doesn't break THIS test.
       That's the actual point to notice: CEI ordering only becomes
       observably dangerous once the recipient can run its own code on
       receipt, exactly what Hard's assignment builds next. Revert the
       source change afterward; <ADDRESS2> was only ever a throwaway local
       deployment, safe to abandon.
   ```

2. **Medium - Cross-Contract Interactions: Splitting Payments via `call`, an Interface and `delegatecall`.**

   **What you practice:**
   - Low-level `call` for sending ETH to multiple recipients in one transaction (Concept 2, 6)
   - A typed interface (`ILogger`) for a genuine, compiler-checked CCI, contrasted directly against the raw low-level call used for payments in the same contract (Concepts 7, 10)
   - `staticcall`, used for a safe, read-only pass-through probe (Concept 6)
   - `delegatecall`'s storage-context-borrowing, demonstrated directly and safely across two small contracts with deliberately matching storage layout (Concept 6)

   **Requirements:**
   - A `Logger` contract: one function `log(string calldata note) external`, emits `Logged(address indexed from, string note)`.
   - An `ILogger` interface declaring `log(string calldata note) external`.
   - A `PaymentSplitter` contract, constructor takes `address[] memory payees` (reverts `NoPayees()` if empty) and a `Logger` address, stored as `ILogger public immutable logger`.
   - `split()`, `payable`, divides `msg.value` evenly across all payees via low-level `.call{value: share}("")`, reverting `ETHTransferFailed(address payee)` naming whichever payee's transfer failed, then calls `logger.log("split executed")` through the typed interface, then emits `Split(uint256 totalAmount, uint256 perPayee)`.
   - `peek(address target, bytes calldata data)`, `view`, forwards `data` to `target` via `staticcall` and returns whatever it returns, reverting `StaticCallFailed()` on failure — a generic, safe, read-only probe usable against any contract's `view` function.
   - A separate `MathLib` contract: `uint256 public lastResult;` (storage slot 0), function `multiply(uint256 a, uint256 b) external returns (uint256)`, stores and returns `a * b`.
   - A separate `Delegator` contract: `uint256 public lastResult;` (storage slot 0, deliberately matching `MathLib`'s layout), function `multiplyViaDelegatecall(address mathLib, uint256 a, uint256 b) external returns (uint256)` that calls `MathLib.multiply` via `delegatecall` and reverts `DelegatecallFailed()` on failure.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command:
           cast send <SPLITTER_ADDRESS> "split()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast balance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545

       Expected output: Account 1's balance increased by exactly 0.5 ETH
       (half of the 1 ETH sent, split across 2 payees) — confirming the
       raw low-level `call` loop actually moved real ETH to a real
       recipient (Concept 2, 6).

   2. Command:
           cast logs --address <LOGGER_ADDRESS> --rpc-url http://127.0.0.1:8545

       Expected output: one `Logged` event, emitted from the Logger
       contract, NOT from PaymentSplitter — confirming `logger.log(...)`
       genuinely executed as a separate CCI into a separate deployed
       contract (Concept 7), through the typed `ILogger` interface
       (Concept 10), not just an internal function call that happens to
       share a name.

   3. Command:
           cast call <SPLITTER_ADDRESS> "peek(address,bytes)(bytes)" <SPLITTER_ADDRESS> \
           $(cast calldata "payeeCount()") --rpc-url http://127.0.0.1:8545

       Expected output: returns encoded `2` — confirming `peek()`'s
       `staticcall` successfully read another function's return value
       through raw calldata, entirely read-only; separately, try passing
       calldata for a state-changing function instead (e.g.
       `cast calldata "split()"`) and observe `peek()` reverts with
       `StaticCallFailed()` — `staticcall` genuinely refuses to let a write
       through, exactly Concept 6's table claim, not just documentation of
       intent.

   4. Command:
           cast send <DELEGATOR_ADDRESS> "multiplyViaDelegatecall(address,uint256,uint256)" \
           <MATHLIB_ADDRESS> 6 7 --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <DELEGATOR_ADDRESS> "lastResult()(uint256)" --rpc-url http://127.0.0.1:8545

           cast call <MATHLIB_ADDRESS> "lastResult()(uint256)" --rpc-url http://127.0.0.1:8545

       Expected output: `Delegator.lastResult()` returns `42`;
       `MathLib.lastResult()` returns `0`, untouched — this is Concept 6's
       entire point made concrete: the multiplication ran using MathLib's
       *code*, but wrote to Delegator's *storage*, because `delegatecall`
       executes in the caller's own storage context. Temporarily change
       `Delegator`'s `lastResult` declaration to come AFTER a second dummy
       `uint256 public unused;` (shifting it to slot 1, no longer matching
       MathLib's slot 0), rebuild, redeploy fresh, and repeat this same
       test: `Delegator.lastResult()` now stays `0` and `unused` silently
       receives the `42` instead — confirming storage layout alignment
       was the entire thing making the correct version work, not
       incidental to it. Revert the source change afterward.
   ```

3. **Hard - A Reentrancy Case Study: Attack, Then Defense.**

   **What you practice:**
   - Building and running Concept 8's exact reentrancy attack, contained entirely to contracts you deploy and control yourself, locally
   - Fixing it two ways at once — Checks-Effects-Interactions (Concept 9) and a mechanical reentrancy guard (Concept 11) — and confirming both independently would have stopped it
   - `receive()` (Concept 3) used as the actual attack vector, tying Concepts 1 through 9 together as one mechanism rather than nine separate facts

   **Requirements:**
   - A `VulnerableVault` contract: `deposit()` (payable, credits `balances[msg.sender]`), and `withdraw()` which — deliberately, for this case study only — sends ETH via `.call{value: bal}("")` _before_ zeroing `balances[msg.sender]`, violating Concept 9 on purpose. A `vaultBalance()` view function returning `address(this).balance`.
   - A `ReentrancyAttacker` contract: constructor takes the vault's address; `attack()` (payable) deposits the attached ETH into the vault, then calls `withdraw()`; `receive()` re-enters `target.withdraw()` up to a bounded `MAX_REENTRIES` (3) times, checking the vault still holds enough balance to make another withdrawal worthwhile each time; `collect()` sends the attacker contract's full drained balance to whichever address deployed it.
   - A `GuardedVault` contract: same `deposit()`, but `withdraw()` now follows CEI correctly (balance zeroed _before_ the external call) AND is wrapped in a hand-rolled `nonReentrant` modifier (Concept 11), reverting `ReentrantCall()` on any re-entrant attempt regardless of ordering.
   - A second `ReentrancyAttacker`-style deployment (reuse the same contract, pointed at `GuardedVault` instead) to confirm the identical attack fails against the fixed version.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command (fund the vulnerable vault with an honest, unrelated
       deposit first, so there's real ETH for the attack to actually
       drain beyond just the attacker's own — use anvil Account 1's key,
       copied in full):
           cast send <VAULT> "deposit()" --value 5ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

           cast call <VAULT> "vaultBalance()(uint256)" --rpc-url http://127.0.0.1:8545

       Expected output: `5000000000000000000` (5 ETH) — the vault genuinely
       holds real funds before the attack, so a successful drain means
       something.

   2. Command (run the attack, 1 ETH from the attacker's own deployer):
           cast send <ATTACKER> "attack()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ATTACKER> "reentryCount()(uint8)" --rpc-url http://127.0.0.1:8545

           cast balance <ATTACKER> --rpc-url http://127.0.0.1:8545

       Expected output: `reentryCount()` returns `3` (MAX_REENTRIES hit),
       and the attacker contract's own ETH balance is `4000000000000000000`
       (4 ETH: the attacker's 1 ETH deposit withdrawn 4 times total — the
       original call plus 3 re-entrant ones — before balances[Attacker]
       ever got zeroed) — confirming Concept 8's diagram happened for real,
       draining 3 ETH that was never the attacker's own out of the vault's
       honest 5 ETH deposit from Test Case 1.

   3. Command (confirm the fix actually holds against the identical
       attack, this time against the guarded vault and its own attacker
       deployment from DeployGuarded.s.sol):
           cast send <GUARDED_VAULT> "deposit()" --value 5ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

           cast send <ATTACKER2> "attack()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ATTACKER2> "reentryCount()(uint8)" --rpc-url http://127.0.0.1:8545

           cast balance <ATTACKER2> --rpc-url http://127.0.0.1:8545

       Expected output: `reentryCount()` returns `0` — the very first
       re-entrant call into `GuardedVault.withdraw()` reverts with
       `ReentrantCall()` (Concept 11), so `receive()`'s own `if` condition
       never even gets a chance to run a second time — and the attacker's
       balance is exactly `1000000000000000000` (1 ETH, its own original
       deposit, withdrawn back out exactly once, nothing more), confirming
       zero funds beyond the attacker's own were drained this time.

   4. Command: in src/GuardedVault.sol, temporarily remove ONLY the
       `nonReentrant` modifier from `withdraw()` (leaving CEI ordering
       itself untouched — balance is still zeroed before the call), rebuild,
       redeploy fresh via DeployGuarded.s.sol (new <GUARDED_VAULT2>,
       <ATTACKER3>), fund it the same way as Test Case 3, then repeat the
       attack:
           cast send <ATTACKER3> "attack()" --value 1ether --rpc-url http://127.0.0.1:8545 \
           --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

           cast call <ATTACKER3> "reentryCount()(uint8)" --rpc-url http://127.0.0.1:8545

       Expected output: `reentryCount()` STILL returns `0` — confirming
       Concept 9's CEI ordering alone, with no guard at all, already
       defeats this specific attack (the re-entrant `withdraw()` call
       reads a balance that's already been zeroed, same as Test Case 3's
       outcome, for a genuinely different reason). This is the intended
       result, not a failure to revert the modifier removal: it demonstrates
       Concept 9 and Concept 11 are two independently-sufficient defenses,
       exactly the "belt and suspenders" claim Concept 11 made in Contents.
       Revert the modifier removal afterward so GuardedVault carries both
       defenses again, matching Requirements.
   ```
