# List of things learned.

## 1. Storage vs. memory vs. calldata cost trade-offs.

Week 27, Concept 2 already introduced storage as the EVM's own persistent, expensive data location.

This week states the real, precise numbers underneath it and places `memory` and `calldata` alongside it for the first time as genuinely distinct cost tiers.

`SLOAD`/`SSTORE` (storage) are metered per Week 26, Concept 2's own key-value model and EIP-2929 makes the _first_ access to a given slot within one transaction ("cold") meaningfully more expensive than every subsequent one ("warm").

Roughly 2100 gas cold vs. 100 gas warm for a read.

Writing a slot from zero to a nonzero value costs a real 20,000 gas, while updating an already-nonzero slot costs only 5,000.

`MSTORE`/`MLOAD` (memory) are dramatically cheaper, a flat, small cost per word, plus a quadratically-growing cost as memory expands further, meant to discourage genuinely huge allocations rather than ordinary use.

`CALLDATALOAD` (calldata) is cheaper still for read-only access, since it reads a transaction's own input directly with no copying into memory required at all.

|                              | Storage                                               | Memory                           | Calldata                                                             |
| ---------------------------- | ----------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| Persists after the call ends | Yes                                                   | No                               | No (it's the input itself)                                           |
| Typical cost                 | High (thousands of gas per write)                     | Low, grows with allocation size  | Lowest, for read-only access                                         |
| Used for                     | A contract's own permanent state (Week 27, Concept 2) | Temporary values within one call | External function parameters that are only ever read, never modified |

This table is the concrete foundation every other concept this week builds on.

Concept 7's own calldata-vs-memory parameter choice is a direct, practical application of this exact row.

---

## 2. Packing storage variables, deepened.

Week 40, Concept 4 already built and measured this technique directly.

Worth returning to here specifically for the honest nuance that week didn't have room for.

Packing multiple fields into one slot only pays off when those fields are genuinely _read or written together_.

Isolating one packed field out of a shared slot costs a real, small amount of extra work.

A bitwise mask and shift that an unpacked, dedicated slot never needs to pay at all.

```solidity
// Reading ONE packed field still needs to isolate it from the rest of the slot
struct Packed {
    uint128 quantity;
    uint128 price;
}
// quantity alone: SLOAD the whole slot, then mask off the high 128 bits — a real, if small, extra cost
```

A struct whose fields are _always_ accessed together (Hard's own `Deposit` struct this week) is a clean, unambiguous win.

Packing saves a real, expensive `SLOAD`/`SSTORE` for every field beyond the first sharing a slot.

A single field accessed constantly, on its own, in a tight, hot loop, with its packed neighbors rarely touched, is a genuine, if less common, case where packing can cost slightly more than it saves.

Worth checking with a real measurement (Concept 8) rather than packing everything by reflex.

---

## 3. Custom errors vs. `require` strings, measured for real.

Week 27, Concept 13 and Week 29, Concept 9 both already introduced custom errors as the modern convention.

This week measures exactly why, with real numbers rather than only the general claim.

A `require` string is stored directly in the contract's own deployed bytecode, adding real, measurable deployment cost for every character and a revert carrying that string has to ABI-encode and return the full string data at runtime.

A custom error's revert data is just its own 4-byte selector (Week 26, Concept 6) plus any typed arguments, encoded exactly like a function call.

Dramatically smaller, both at deployment and at the moment of reverting.

```solidity
require(newValue > 0, "value must be greater than zero, this is a long descriptive message");   // stored in bytecode, in FULL

error ValueTooLow();
if (newValue == 0) revert ValueTooLow();   // 4 bytes, full stop
```

Easy's own assignment measures both the deployment-gas difference and the revert-path gas difference directly, rather than trusting either claim unverified.

---

## 4. Unchecked math blocks, measured for real.

Week 27, Concept 10, Week 29, Concept 9 and Week 31, Concept 2 all already covered `unchecked { ... }` as a real, deliberate opt-out of Solidity 0.8's own default overflow protection and Week 31's own security caution.

Only where overflow is _provably_ impossible, still holds completely.

This week measures the actual gas this opt-out saves, in the single most common genuinely-safe case.

A loop counter, bounded by an array's own real length, that can never realistically approach `uint256`'s own maximum value.

```solidity
uint256 length = values.length;
for (uint256 i = 0; i < length;) {
    total += values[i];
    unchecked { ++i; }   // provably safe — i can never overflow within any real array's own bounds
}
```

The saving here is genuinely small per iteration and genuinely real when multiplied across a large loop.

Easy's own assignment measures the difference directly across a realistic array size, rather than asserting a savings that may or may not be meaningful in practice.

---

## 5. Yul and inline assembly basics.

**Yul** is the lower-level intermediate language Solidity itself compiles down through before reaching raw EVM bytecode.

`assembly { ... }` blocks let a contract write Yul directly, bypassing Solidity's own higher-level syntax and some of its own safety guarantees entirely.

```solidity
uint256 public counter;

function incrementYul() external {
    assembly {
        sstore(counter.slot, add(sload(counter.slot), 1))   // .slot — real, valid syntax for a state variable's own storage slot
    }
}
```

A genuinely honest point worth making directly, not glossed over.

For something this simple, Medium's own assignment measures `incrementYul` against the equivalent plain `counter += 1;` and finds them costing nearly identical gas.

Solidity's own compiler already generates essentially the same opcodes for simple arithmetic, so hand-written assembly buys nothing here.

Yul's real value shows up in operations the compiler can't already optimize this tightly.

Medium's own `efficientHash` function, building a `keccak256` input directly in memory without an intermediate `abi.encodePacked` allocation, is a case that genuinely benefits.

---

## 6. Function selectors and calldata layout.

Week 26, Concept 6 already introduced the 4-byte function selector.

This week states the fuller picture.

Every argument after that selector is laid out in 32-byte-aligned words, padded according to its own type (a smaller integer right-padded with zeros in some encodings, an address left-padded, a dynamic type like `bytes`/`string` carrying an offset pointer to where its own actual data lives later in the calldata).

A real, historically-true optimization worth naming honestly rather than overstating.

Ordering a contract's own most-frequently-called external functions earlier in the source has, in older Solidity compiler versions, produced a measurably cheaper dispatch path, since the compiler's own generated selector-matching logic checked candidates in a specific, source-order-influenced sequence.

Modern `solc` versions use more sophisticated dispatch strategies (approaching a binary search or hash-based approach for contracts with many functions), so this specific technique's own real effect size varies by exactly which compiler version is doing the compiling, worth verifying with a real measurement (Concept 8) rather than assumed as still-significant advice from an older tutorial.

---

## 7. Loop and array optimization patterns.

Three real, concrete techniques, most of them already implicit in earlier weeks' own code without being named directly until now.

**Cache an array's own length before looping**, reading `.length` fresh on every iteration re-does real work (a storage read for a storage array, or recomputing for a calldata one) the loop condition doesn't need to repeat.

**Prefer `calldata` over `memory`** for a read-only external array parameter (Concept 1's own table).

`memory` requires copying the entire array in before the function body even starts.

`calldata` reads it in place.

**Avoid repeated storage reads/writes inside a loop body** where the same value is touched more than once.

Read once into a local variable, operate on that, write back to storage a single time at the end, rather than paying a fresh `SLOAD`/`SSTORE` on every iteration for a value that isn't actually changing between them.

```solidity
function totalDeposited() external view returns (uint256 total) {
    uint256 length = depositors.length;         // cached ONCE
    for (uint256 i = 0; i < length;) {
        total += deposits[depositors[i]].amount;   // still one necessarily-per-iteration read — each depositor differs
        unchecked { ++i; }                          // Concept 4
    }
}
```

---

## 8. Gas profiling tools: Foundry gas reports & snapshots.

`forge test --gas-report` (Week 30, Concept 7, used constantly since) is the tool this course has already leaned on throughout.

This week adds `forge snapshot`, genuinely new.

It records every test's own exact gas usage into a committed `.gas-snapshot` file and `forge snapshot --diff` compares a fresh run against that saved baseline, showing exactly which tests got cheaper or more expensive since the snapshot was last taken.

This is the real, practical workflow behind every claim this week's own Contents makes.

Measure first, optimize, then measure again and confirm the change actually helped, rather than trusting a technique's own reputation.

```
forge snapshot                # record the current baseline
# ... make a change ...
forge snapshot --diff          # shows exactly what changed, and by how much
```

Hard's own assignment uses this directly, snapshotting an unoptimized contract, then diffing against the optimized version to produce a real, measured savings report.

---

## 9. Optimizing one real contract, step by step.

Hard's own assignment is this concept, built rather than only described.

A single, deliberately unoptimized `Vault` contract and a second, `OptimizedVault`, applying Concepts 2 through 7 together.

Packed struct fields, custom errors, a single reused storage pointer instead of repeated `mapping` lookups, a `calldata` array parameter and a cached, unchecked loop.

Measured against each other with `forge snapshot` (Concept 8), producing one real, committed record of exactly how much each individual change actually saved, not a hypothetical total.

---

## Assignment.

1. **Easy - Custom Errors and Unchecked Math, Measured For Real.**

   **What you practice:**
   - The real deployment-gas and revert-path-gas difference between `require` strings and custom errors (Concept 3)
   - The real gas difference a provably-safe `unchecked` loop counter produces across a realistic array size (Concept 4)

   **Requirements:**
   - A `RequireStringDemo` contract: `setValue(uint256)`, gated by two `require` calls with long, descriptive string messages.
   - A `CustomErrorDemo` contract: identical logic, using `ValueTooLow()`/`ValueTooHigh()` custom errors instead.
   - A `LoopGasDemo` contract: `sumChecked(uint256[] calldata values)` (an ordinary, checked loop) and `sumUnchecked(uint256[] calldata values)` (cached length, `unchecked` counter increment, Concept 4, 7).
   - A test measuring and comparing both contracts' own real deployment gas, and both contracts' own real revert-path gas for an out-of-range input.
   - A test measuring and comparing `sumChecked` vs. `sumUnchecked` against a realistic 100-element array.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

       Expected output: both tests PASS, and the printed numbers show
       `CustomErrorDemo` and `sumUnchecked` each meaningfully cheaper than
       their own counterpart — confirming Concepts 3 and 4 with real
       measurements, not assumed.

   2. Command: forge test --match-test testFix_CustomErrorsCostLessThanRequireStrings -vvvv

       Expected output: a trace showing `RequireStringDemo`'s own revert
       carrying the FULL string as its return data, against
       `CustomErrorDemo`'s own revert carrying only a 4-byte selector —
       the exact mechanical source of the measured gas difference, visible
       directly.

   3. Action: in src/LoopGasDemo.sol, temporarily remove
       `uint256 length = values.length;` from `sumUnchecked` and go back
       to reading `values.length` fresh inside the loop condition each
       time (keeping the `unchecked { ++i; }` itself unchanged), then
       re-run.

       Expected output: `uncheckedGas` increases somewhat — confirming
       Concept 7's own length-caching claim is a real, separate, additive
       source of savings, not the same thing `unchecked` alone already
       provides. Revert the change afterward.

   4. Action: re-run with a 500-element array instead of 100.

       Expected output: the gap between `checkedGas` and `uncheckedGas`
       grows roughly proportionally with the array's own size — confirming
       Concept 4's own claim that the per-iteration saving is small but
       genuinely compounds across a larger loop, not a fixed, one-time
       discount.
   ```

2. **Medium - Yul Basics and Calldata vs. Memory, Measured For Real.**

   **What you practice:**
   - Reading and writing storage directly via inline assembly, and confirming honestly when it does (and doesn't) actually save gas (Concept 5)
   - The real gas cost `calldata` saves over `memory` for a read-only external array parameter (Concepts 1, 7)
   - `forge snapshot`, for the first time this course (Concept 8)

   **Requirements:**
   - A `YulBasics` contract: `incrementYul()` (using `sstore(counter.slot, add(sload(counter.slot), 1))` directly), `incrementSolidity()` (plain `counter += 1;`), and `efficientHash(uint256 a, uint256 b)` (building the hash input directly in memory via inline assembly, avoiding an intermediate `abi.encodePacked` allocation).
   - A `CalldataVsMemory` contract: `sumMemory(uint256[] memory values)` and `sumCalldata(uint256[] calldata values)`, otherwise identical.
   - A test confirming `incrementYul` and `incrementSolidity` cost nearly identical gas (Concept 5's own honest point) and confirming `efficientHash` produces the exact same result `keccak256(abi.encodePacked(a, b))` would.
   - A test measuring `sumMemory` vs. `sumCalldata` against a realistic array, and recording both via `forge snapshot`.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv && forge snapshot

       Expected output: all tests pass, and a real `.gas-snapshot` file
       appears in the project root, listing every test's own exact gas
       number — Concept 8's own real, committable artifact.

   2. Command: forge test --match-test testFix_YulAndSolidityIncrementCostNearlyIdenticalGas -vv

       Expected output: PASSES, with the two printed numbers genuinely
       close together — confirming Concept 5's own honest claim directly:
       hand-written assembly bought nothing measurable for a plain
       increment, exactly as the Contents section said, not an
       overstated Yul advantage.

   3. Action: after recording the snapshot in Test Case 1, temporarily
       change `efficientHash` to use `abi.encodePacked` internally instead
       of raw assembly (still returning the correct result), then run:
       forge snapshot --diff

       Expected output: a real, visible diff showing this specific test's
       own gas usage increased — confirming `efficientHash`'s own
       assembly version genuinely was cheaper than the equivalent
       Solidity-level encoding, the real case Concept 5 said assembly
       actually helps with. Revert the change afterward.

   4. Command: forge test --match-test testFix_CalldataCostsLessThanMemoryForReadOnlyArrays -vvvv

       Expected output: a trace showing `sumMemory`'s own call performing
       a real memory-copy step before its loop even begins, entirely
       absent from `sumCalldata`'s own trace — the exact mechanical source
       of Concept 1's own table claim, made visible.
   ```

3. **Hard - Optimizing One Real Contract, Step by Step, With a Measured Report.**

   **What you practice:**
   - Every technique from Concepts 2 through 7, applied together to one real, realistic contract (Concept 9)
   - `forge snapshot --diff`, used for its real, intended purpose: proving a specific set of changes produced a specific, measured improvement

   **Requirements:**
   - An `UnoptimizedVault` contract: an unpacked `Deposit` struct (`uint256 amount`, `uint256 timestamp`, `bool active`), `require` strings throughout, a checked loop with no cached length in `totalDeposited`, and a `memory` array parameter in `batchCheckActive`.
   - An `OptimizedVault` contract: the identical external behavior, but with a packed `Deposit` struct (`uint128 amount`, `uint64 timestamp`, `bool active` — one slot), custom errors, a single reused storage pointer per function instead of repeated mapping lookups, a cached-length `unchecked` loop in `totalDeposited`, and a `calldata` array parameter in `batchCheckActive`.
   - A test confirming both contracts produce IDENTICAL results for the identical sequence of deposits, withdrawals, and queries — the optimization changed cost, not behavior.
   - A test measuring and comparing real gas for `deposit`, `totalDeposited` (with several depositors), and `batchCheckActive` (with a real array) across both contracts.
   - A `GAS_OPTIMIZATION_REPORT.md`, filled in with the real, measured savings for each individual technique, backed by an actual `forge snapshot --diff`.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 3 tests for test/VaultOptimization.t.sol:VaultOptimizationTest
           [PASS] testFix_BatchCheckActiveCostsLessOnOptimizedVault()
           [PASS] testFix_BothVaultsProduceIdenticalResults()
           [PASS] testFix_DepositCostsLessOnOptimizedVault()

   2. Command: forge snapshot, then forge snapshot --diff after no
       changes at all.

       Expected output: no diff at all — confirming the snapshot mechanism
       itself is stable and deterministic run to run, a real, necessary
       property before trusting it to detect a genuine regression later.

   3. Action: in src/OptimizedVault.sol, temporarily remove the
       `unchecked { ++i; }` from `totalDeposited` (reverting to a plain,
       checked `i++` in the loop's own increment clause), then run:
       forge snapshot --diff

       Expected output: a real, visible increase in `totalDeposited`'s own
       gas cost specifically, confirming Concept 4's own real, if modest,
       contribution was genuinely part of the measured total, not
       redundant with the other techniques already applied. Revert the
       change afterward.

   4. Action: fill in GAS_OPTIMIZATION_REPORT.md's own table using the
       REAL numbers your own `forge snapshot`/`--diff` run produced, not
       estimated or copied figures — then answer both of its own written
       questions with real reasoning about this specific contract, the
       same standard every previous week's own design-document deliverable
       has been held to.
   ```
