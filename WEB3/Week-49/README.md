# List of things learned.

## 1. Property-based / invariant testing.

Every test this course has written since Week 27 checks one specific, hand-picked scenario.

Deposit this exact amount, expect this exact balance.

**Invariant testing** is genuinely different, rather than writing a scenario.

A real Foundry invariant test declares a **property that must hold true no matter what sequence of valid calls happens to a contract** and Foundry itself generates hundreds of random call sequences against a real **handler** contract, checking the invariant after every single one.

```solidity
import {StdInvariant} from "forge-std/StdInvariant.sol";

contract VaultInvariantTest is StdInvariant, Test {
    function setUp() public {
        vault = new VaultWithBug();
        handler = new Handler(vault);
        targetContract(address(handler));   // Foundry fuzzes calls INTO the handler, not the vault directly
    }

    function invariant_solvency() public view {
        assertEq(address(vault).balance, handler.totalTrackedDeposits());
    }
}
```

This is a fundamentally more powerful net than any hand-written example test.

It explores real, valid sequences of calls nobody sat down and specifically thought to write a test for.

Medium's own assignment builds and runs exactly this and catches a real bug that passes every hand-written unit test cleanly.

---

## 2. Fuzzing strategies beyond basic fuzzing.

Foundry's own **basic fuzzing** is simpler than Concept 1's own stateful version and this course hasn't used it explicitly before either.

Any test function taking parameters is automatically fuzzed, called hundreds of times with randomly generated values for those parameters.

```solidity
function testFuzz_DepositThenWithdrawReturnsExactAmount(uint96 amount) public {
    amount = uint96(bound(amount, 1, 1000 ether));   // Concept 2's own bounding — constrain to SENSIBLE values
    vm.deal(address(this), amount);
    vault.deposit{value: amount}();
    vault.withdraw(amount);
    assertEq(address(this).balance, amount);
}
```

`bound()` (and `vm.assume(condition)`, which simply discards a generated input entirely if it doesn't satisfy the condition) keep a fuzz run from wasting effort on nonsensical inputs.

A raw, unbounded `uint256` includes values no real deposit could ever be.

A genuinely useful, easy-to-miss Foundry feature worth naming directly.

When a fuzz test _does_ fail, Foundry automatically **shrinks** the failing input down to the smallest, simplest value that still reproduces the failure, rather than reporting whatever large, complicated random value it happened to hit first.

Easy's own assignment triggers this directly and reads the shrunk result.

---

## 3. Formal verification tools, in overview: Certora and Halmos.

Two real, currently-used tools worth naming by name, the same factual treatment this course has given other real infrastructure (Chainlink, Pyth, Safe).

- **Certora** is a real, commercial formal verification service, used by several major, real, live protocols, with its own specification language (CVL) for expressing properties and _mathematically proving_ a contract satisfies them.

  Not sampling many inputs the way fuzzing does, but genuinely exhaustive, provable correctness across the entire input space, within the specification's own stated scope.

- **Halmos** (Tutorial, step 2) is a real, free, open-source alternative, genuinely more accessible for this course specifically because it works directly against ordinary Foundry-style Solidity test files rather than a separate specification language.

  This week's own hands-on symbolic execution work uses Halmos directly, the same "one tool built hands-on, one named and compared" pattern this course used for Hardhat and Foundry back in Week 30.

---

## 4. Symbolic execution basics.

The real mechanism underneath Halmos, genuinely different from Concepts 1 and 2's own fuzzing.

Rather than trying many _specific_, concrete (even if randomly generated) input values, **symbolic execution** represents a function's own inputs as abstract, symbolic variables and explores every possible execution path _mathematically_, proving a property holds for **every possible value simultaneously**, not a large sample of them.

```solidity
function check_withdrawNeverExceedsDeposit(uint128 depositAmount, uint128 withdrawAmount) public {
    // Halmos treats BOTH parameters as fully symbolic — every possible pair of values is
    // considered at once, not hundreds of random samples the way testFuzz_ would be run.
}
```

This is a genuinely stronger guarantee than fuzzing within its own real limits.

A fuzz test that runs a thousand times and never fails is still only _evidence_ the property likely holds.

A symbolic proof that completes successfully is a mathematical _guarantee_ it holds for every input the tool actually explored, including ones a fuzz campaign might never have happened to generate.

The real, honest limit is **path explosion**, a function with enough branches and enough symbolic state can have so many possible execution paths that exhaustive exploration becomes computationally impractical.

Exactly why symbolic execution tools work best on smaller, more contained functions (Hard's own assignment picks one deliberately small function for exactly this reason) rather than an entire, large contract at once.

---

## 5. Writing testable contract specifications.

A **specification** states, in plain terms, what must always be true about a contract.

Written _before_ or _independently of_ its own implementation, describing the intended behavior rather than describing whatever the code currently happens to do.

This is a genuinely different mindset from "write the code, then write tests confirming it does what it does".

A real specification is closer to Concept 1's own invariant, stated in prose first:

- "the contract's own ETH balance must always equal the sum of every user's own tracked balance,"
- "a user can never withdraw more than they've deposited,"
- "the total supply of an LRT (Week 48, Concept 4) never changes as a direct result of a slash."

Hard's own assignment writes a real `SPEC.md` first, then builds both an invariant test and a Halmos symbolic test directly against those same, plainly-stated properties.

Closing the loop on a real pattern this entire course has used since Week 28.

Nearly every "good vs. bad" pairing this course has ever built (Week 28's reentrancy, Week 31's oracle manipulation, Week 39's circuit breakers) is really a case where a specification like this, written first and actually checked, would have caught the bug before it ever shipped.

---

## 6. Differential testing between implementations.

A real, powerful technique for validating that two supposedly-equivalent implementations genuinely behave identically.

Run the **identical, fuzzed sequence of operations** against both and assert their results match at every single step.

Week 46's own `UnoptimizedVault` and `OptimizedVault` are the perfect, already-built pair for this.

Week 46's own `testFix_BothVaultsProduceIdenticalResults` checked exactly _one_ hand-picked sequence.

Hard's own assignment this week fuzzes the sequence itself, confirming the two contracts agree across hundreds of different, randomly-generated deposit/withdraw patterns, not just the one this course happened to write by hand.

```solidity
function testFuzz_UnoptimizedAndOptimizedAgreeOnEveryOperation(uint96 depositAmount) public {
    depositAmount = uint96(bound(depositAmount, 1, 100 ether));
    // ... run the IDENTICAL operation against BOTH contracts, assert IDENTICAL results
    assertEq(unoptimized.totalDeposited(), optimized.totalDeposited());
}
```

This is genuinely the strongest confidence this course has ever had that Week 46's own optimizations changed _cost_, not _behavior_.

Not because one specific sequence happened to match, but because hundreds of independently-generated ones all did.

---

## 7. Continuous fuzzing in CI pipelines.

A fuzz or invariant suite run once, locally, before a commit is a real, useful check.

Running the identical suite **continuously**, on every single push, via a real CI pipeline, catches a regression the moment it's introduced rather than whenever someone next happens to run the tests by hand.

```yaml
name: Foundry CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: foundry-rs/foundry-toolchain@v1
      - run: forge test -vvv
```

Real, dedicated continuous-fuzzing services exist beyond this.

Running much longer, deeper fuzz campaigns overnight or continuously, well beyond what a quick CI run on every push would have time for.

Worth knowing exist as the natural next step beyond what Hard's own assignment builds, a real, achievable CI workflow running this course's own full test suite, invariants included, on every push.

---

## 8. Writing a specification first, then catching a real bug it predicts.

Hard's own assignment is this concept, built rather than only described.

`SPEC.md` (Concept 5) states a property in plain language _before_ the final contract logic is presented, an invariant test (Concept 1) and a Halmos symbolic test (Concepts 3, 4) are both built directly against that same stated property.

And the actual payoff both genuinely catch the same real, deliberately-introduced bug from two structurally different directions.

One by exploring many random sequences until it happens to trigger the violation, the other by proving no input to one specific function could ever satisfy the buggy condition.

Seeing the identical bug caught twice, by two genuinely different techniques starting from the identical written specification, is the real, concrete argument for why "testable specification first" is worth the extra discipline.

---

## Assignment.

1. **Easy - Basic Fuzzing, Bounding Inputs and Watching Foundry Shrink a Failure.**

   **What you practice:**
   - Foundry's own basic fuzzing, for the first time this course has used it explicitly (Concept 2)
   - `bound()`/`vm.assume()`, keeping fuzzed inputs sensible
   - Watching Foundry's own shrinking behavior on a real, deliberately-triggered failure

   **Requirements:**
   - A `SimpleVault` contract: `deposit()` (payable, credits `balances[msg.sender]`), `withdraw(uint256 amount)` (reverts if `amount > balances[msg.sender]`, otherwise sends real ETH via `.call{value}("")`).
   - A fuzz test confirming `deposit` then `withdraw` of the identical, bounded amount always returns the caller to their exact original balance.
   - A second fuzz test, deliberately run against a version of `SimpleVault` with an off-by-one bug (`amount >= balances[msg.sender]` instead of `>`, incorrectly allowing a withdrawal of exactly the full balance to still succeed when it should — flip this to demonstrate the OPPOSITE, genuinely broken direction: allowing `amount` to be one wei MORE than the real balance under a specific condition), confirming Foundry reports a shrunk, minimal failing case.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output:
           Ran 2 tests for test/FuzzBasics.t.sol:FuzzBasicsTest
           [PASS] testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance(uint96) (runs: 256, ...)
           [PASS] testFuzz_DepositThenWithdrawReturnsExactAmount(uint96) (runs: 256, ...)

       Both tests technically pass — the SECOND one passes because a
       revert DOES eventually happen (Week 27's own underflow check), just
       for the wrong reason and one step too late, exactly the honest
       point BuggyVault's own comment makes.

   2. Command: forge test --match-test testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance -vvvv

       Expected output: a trace showing the broken `amount > balances[msg.sender] + 1`
       check being PASSED (not triggering its own revert), followed by the
       underflow reverting the subtraction one line later — confirming
       directly that the check itself never actually did its intended job,
       the overall revert happened by accident, not by design.

   3. Action: in src/BuggyVault.sol, change the withdraw amount check
       back to the CORRECT `if (amount > balances[msg.sender]) revert();`,
       rebuild, and re-run testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance.

       Expected output: still PASSES, but now for the RIGHT reason —
       confirming a passing fuzz test alone doesn't tell you WHY it
       passed; only reading the trace (Test Case 2) actually reveals which
       check was doing the real work. Revert the fix afterward so
       BuggyVault matches Requirements again.

   4. Command: run with a much larger local run count to see if a longer
       fuzz campaign changes anything:
           forge test --match-test testFuzz_DepositThenWithdrawReturnsExactAmount --fuzz-runs 5000 -v

       Expected output: still passes, all 5000 runs — confirming `SimpleVault`'s
       own correct logic holds up under a genuinely deeper fuzz campaign,
       not just Foundry's own smaller default run count.
   ```

2. **Medium - Invariant Testing: Catching a Real Bug Unit Tests Miss Entirely.**

   **What you practice:**
   - Building a real handler contract and a real Foundry invariant test, for the first time this course (Concept 1)
   - Watching an invariant catch a real, deliberately-introduced bug that every hand-written unit test passes cleanly

   **Requirements:**
   - A `VaultWithBug` contract: `deposit()`, `withdraw(uint256)` (both correct, ordinary logic), plus `creditReward(address user, uint256 amount)` — a deliberately buggy function crediting a user's own tracked balance without any real ETH ever backing that credit.
   - A `Handler` contract: exposes bounded, fuzzable wrappers around `deposit`, `withdraw`, and `creditReward`, tracking its own independent `totalTrackedDeposits` ghost variable that only increases on real `deposit` calls (deliberately NOT incremented by `creditReward`, since that function never actually adds real ETH).
   - A hand-written, ordinary unit test exercising only `deposit`/`withdraw` directly, confirming it passes cleanly with no sign of any problem.
   - A real Foundry invariant test: `invariant_solvency()`, asserting `address(vault).balance == handler.totalTrackedDeposits()`, run via `targetContract(address(handler))`.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test --match-path test/VaultUnit.t.sol -vv

       Expected output:
           Ran 1 test for test/VaultUnit.t.sol:VaultUnitTest
           [PASS] testFix_DepositThenWithdrawWorksNormally()

       A completely clean pass — nothing here even hints at the real bug,
       since this hand-written test never happens to call `creditReward`
       at all.

   2. Command: forge test --match-path test/VaultInvariant.t.sol -vvv

       Expected output: `invariant_solvency` FAILS, with Foundry printing
       the real, minimal call sequence it found that broke it — almost
       certainly including at least one `creditReward` call, since that's
       the only function capable of desynchronizing `address(vault).balance`
       from `handler.totalTrackedDeposits()` at all. This is Concept 1's
       own entire point, made completely concrete: a real bug, invisible
       to Test Case 1's own clean pass, found automatically by exploring
       sequences nobody specifically wrote a test for.

   3. Action: comment out the `creditReward` function inside
       `Handler.sol` entirely (so the fuzzer can never call it at all),
       then re-run the invariant test.

       Expected output: `invariant_solvency` now PASSES, consistently —
       confirming directly that `creditReward` was genuinely the sole
       source of the violation, not some unrelated issue in `deposit`/
       `withdraw` themselves. Revert the change afterward so the handler
       matches Requirements again.

   4. Action: fix the REAL bug properly instead — require `creditReward`
       to actually receive real ETH matching the credited amount (`payable`,
       checking `msg.value == amount`), update the handler to send that
       ETH and correctly increment `totalTrackedDeposits` to match, then
       re-run the invariant test.

       Expected output: passes — confirming the invariant genuinely
       validates a real fix, not just detecting the presence of ANY call
       to `creditReward` regardless of correctness.
   ```

3. **Hard - A Specification First, Differential Testing and Halmos Symbolic Proof.**

   **What you practice:**
   - Writing a real specification BEFORE presenting the final implementation (Concept 5)
   - Differential fuzz testing between Week 46's own two vault implementations (Concept 6)
   - A real Halmos symbolic proof, exhaustively checking one property across every possible input (Concepts 3, 4)
   - A real CI workflow running this course's own full test suite, invariants included, on every push (Concept 7)

   **Requirements:**
   - A `SPEC.md`, written first: stating plainly, in prose, that `OptimizedVault.withdraw` must never allow a caller to withdraw more than they've genuinely deposited, under any circumstance, for any input.
   - A differential fuzz test reusing Week 46's own `UnoptimizedVault` and `OptimizedVault` (copied unchanged): the identical, fuzzed sequence of `deposit`/`withdraw` calls run against both, asserting `totalDeposited()` matches between them after every single operation.
   - A Halmos `check_` function, symbolically proving `SPEC.md`'s own stated property for `OptimizedVault.withdraw` directly — every possible `(depositAmount, withdrawAmount)` pair, not a fuzzed sample of them.
   - A real `.github/workflows/foundry-ci.yml`, running `forge test` (fuzz and invariant suites included) on every push.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test --match-path test/DifferentialVault.t.sol -vv

       Expected output:
           Ran 1 test for test/DifferentialVault.t.sol:DifferentialVaultTest
           [PASS] testFuzz_BothVaultsAgreeAfterEveryOperation(uint96,uint96) (runs: 256, ...)

   2. Command: halmos --contract HalmosProofTest --function check_withdrawNeverExceedsDeposit

       Expected output: Halmos reports the property holds across every
       explored path — a genuinely different kind of confirmation than
       Test Case 1's own "256 random pairs agreed," this is closer to "no
       pair COULD violate this," within Halmos's own real exploration
       limits (Concept 4).

   3. Action: in a SCRATCH copy of OptimizedVault.sol (not the real
       Week 46 file this Requirements section depends on), temporarily
       introduce SPEC.md's own exact violation — allow `withdraw` to
       succeed even when `amount > balance` by removing its own guard
       entirely — point HalmosProofTest at this broken copy instead, and
       re-run the identical Halmos command.

       Expected output: Halmos reports a genuine counterexample — a real,
       specific `(depositAmount, withdrawAmount)` pair where the property
       fails, found directly rather than by chance — confirming Halmos
       genuinely explores the space rather than trivially passing
       regardless of the code underneath it. Discard the scratch copy
       afterward; the real `OptimizedVault.sol` this Requirements section
       depends on stays unchanged.

   4. Command: push this project to a real GitHub repository with the
       `.github/workflows/foundry-ci.yml` file in place, and confirm the
       Actions tab shows a real, passing CI run.

       Expected output: a real, green check mark — confirming Concept 7's
       own claim directly: this course's own full test suite, fuzz and
       differential tests included, now runs automatically on every single
       push, not only when manually remembered.
   ```
