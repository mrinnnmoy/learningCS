# Specification. (OptimizedVault.withdraw)

Written BEFORE this week's own tests and implementation verification, following Concept 5.

---

## 1. The Property

A caller of `OptimizedVault.withdraw(amount)` must **NEVER be able to withdraw more real ETH than they have genuinely deposited into the vault**, for any possible input.

More precisely:

- A withdrawal amount equal to or less than the caller's deposited amount must succeed.
- A withdrawal amount greater than the caller's deposited amount must not succeed.
- A successful withdrawal must transfer exactly the requested amount of ETH to the caller.
- A successful withdrawal must reduce the caller's tracked deposited amount by exactly the withdrawn amount.
- The vault must never allow the caller to obtain ETH that is not backed by their own deposited balance.

This property must hold regardless of the particular input values supplied to `withdraw()`.

---

## 2. Why This Property Matters

The specification describes the **intended behavior** of the vault rather than its current implementation.

The property therefore does not depend on a particular Solidity condition such as:

```solidity
if (d.amount < amount) revert InsufficientBalance();
```

The implementation could change completely while this specification would remain valid.

The important requirement is the relationship between:

```text
ETH deposited
        ↓
tracked vault balance
        ↓
ETH withdrawn
```

A caller must never be able to withdraw more ETH than their genuinely deposited amount.

This follows Concept 5's principle that a specification should describe **what the system must guarantee**, rather than merely describing how the current implementation happens to achieve it.

---

## 3. OptimizedVault Implementation

`OptimizedVault` stores each user's deposit using the following packed structure:

```solidity
struct Deposit {
    uint128 amount;
    uint64 timestamp;
    bool active;
}
```

The withdrawal operation is implemented as:

```solidity
function withdraw(uint256 amount) external {
    Deposit storage d = deposits[msg.sender];

    if (!d.active) revert NoActiveDeposit();
    if (d.amount < amount) revert InsufficientBalance();

    d.amount -= uint128(amount);

    (bool success, ) = payable(msg.sender).call{value: amount}("");

    if (!success) revert TransferFailed();
}
```

The important specification-relevant condition is:

```solidity
if (d.amount < amount) revert InsufficientBalance();
```

Therefore, a caller cannot reach the ETH transfer when the requested amount exceeds their tracked deposit.

---

## 4. Specification vs. Implementation

The specification is intentionally independent from the implementation.

### Specification

```text
withdraw(amount) must never allow:

amount > genuinely deposited amount
```

### Current implementation

```solidity
if (d.amount < amount) revert InsufficientBalance();
```

The specification describes the required security property.

The implementation provides one particular mechanism for enforcing that property.

---

# 5. Differential Testing

The specification is tested indirectly using differential fuzz testing.

The project contains two vault implementations from Week 46:

```text
UnoptimizedVault
OptimizedVault
```

Both implementations receive the same fuzzed inputs.

For every fuzzed test case:

1. A bounded deposit amount is generated.
2. The same amount is deposited into both vaults.
3. Their `totalDeposited()` values are compared.
4. A bounded withdrawal amount is generated.
5. The same withdrawal is performed on both vaults.
6. Their `totalDeposited()` values are compared again.

The important property is:

```text
UnoptimizedVault.totalDeposited()
        ==
OptimizedVault.totalDeposited()
```

after every operation.

This provides differential evidence that the optimized implementation preserves the observable accounting behavior of the original implementation.

---

## Differential Test

The test is located at:

```text
test/DifferentialVault.t.sol
```

Command:

```bash
forge test --match-path test/DifferentialVault.t.sol -vv
```

Actual successful result:

```text
Ran 1 test for test/DifferentialVault.t.sol:DifferentialVaultTest

[PASS] testFuzz_BothVaultsAgreeAfterEveryOperation(uint96,uint96)
(runs: 256, ...)

Suite result: ok.
1 passed; 0 failed; 0 skipped
```

Therefore, the differential fuzz test successfully passed across Foundry's 256 fuzz runs.

---

# 6. Symbolic Verification with Halmos

Differential fuzzing provides evidence over many concrete inputs, but it does not exhaustively examine every possible input.

Halmos is therefore used to symbolically execute the withdrawal property.

The symbolic test is located at:

```text
test/HalmosProof.t.sol
```

The proof uses:

```solidity
function check_withdrawNeverExceedsDeposit(
    uint128 depositAmount,
    uint128 withdrawAmount
) public
```

Halmos treats the function parameters symbolically rather than selecting only ordinary concrete test values.

The proof checks the successful withdrawal path for symbolic values satisfying:

```text
depositAmount > 0
withdrawAmount <= depositAmount
```

For that path, the proof verifies that:

1. The caller receives exactly `withdrawAmount` ETH.
2. The caller's tracked deposit decreases by exactly `withdrawAmount`.

---

## Halmos Environment

Halmos was installed in an isolated Python virtual environment.

Version used:

```text
halmos 0.3.3
```

Because Halmos requires AST information from the Foundry artifacts in this environment, the artifacts were regenerated using:

```bash
forge clean
forge build --ast
```

The symbolic proof was then executed with:

```bash
halmos \
  --contract HalmosProofTest \
  --function check_withdrawNeverExceedsDeposit
```

---

## Halmos Result

Actual successful result:

```text
Running 1 tests for test/HalmosProof.t.sol:HalmosProofTest

[PASS] check_withdrawNeverExceedsDeposit(uint128,uint128)
(paths: 6, time: 0.10s, bounds: [])

Symbolic test result:
1 passed; 0 failed
```

This provides symbolic verification of the tested withdrawal behavior rather than relying only on Foundry's randomly generated fuzz inputs.

---

# 7. Unsupported `expectRevert` in Halmos 0.3.3

The initial version of the symbolic test used:

```solidity
vm.expectRevert();
```

Halmos 0.3.3 reported:

```text
Unsupported cheat code: expectRevert()
```

The proof was therefore rewritten without `vm.expectRevert()`.

The final proof focuses on the successful withdrawal path and verifies that every allowed symbolic withdrawal:

```text
withdrawAmount <= depositAmount
```

transfers and deducts exactly the requested amount.

The actual `OptimizedVault` implementation independently protects the forbidden path using:

```solidity
if (d.amount < amount) revert InsufficientBalance();
```

This keeps the symbolic proof compatible with Halmos 0.3.3 while still testing the core withdrawal property.

---

# 8. Solidity Typecast Warning

During compilation, Foundry reports:

```text
warning[unsafe-typecast]:
typecasts that can truncate values should be checked

src/OptimizedVault.sol:45:21
d.amount -= uint128(amount);
```

The warning is caused by:

```solidity
uint128(amount)
```

The Halmos proof uses:

```solidity
uint128 withdrawAmount
```

Therefore, within the symbolic proof's withdrawal input, the value is already constrained to the `uint128` range.

The warning does not prevent compilation or affect the successful differential fuzz or Halmos verification results.

---

# 9. CI Verification

The project also includes a GitHub Actions workflow:

```text
.github/workflows/foundry-ci.yml
```

The workflow runs:

```bash
forge test -vvv
```

on pushes and pull requests.

This ensures the project's Foundry test suite, including unit, fuzz, differential, and invariant tests present in the repository, can be automatically executed by CI.

---

# 10. Verification Strategy

This week's verification uses several complementary techniques.

### Specification

Defines the intended behavior independently of the implementation.

```text
What must always be true?
```

### Differential fuzzing

Compares the optimized implementation against the known Week 46 implementation across many concrete inputs.

```text
Do both implementations behave consistently?
```

### Symbolic execution

Uses Halmos to explore symbolic execution paths rather than relying only on randomly generated inputs.

```text
Can the tested withdrawal property be violated by a symbolic input?
```

### Continuous Integration

Runs the Foundry test suite automatically through GitHub Actions.

```text
Does the verification suite continue passing automatically?
```

Together these provide stronger confidence than relying on ordinary example-based unit tests alone.

---

# 11. Final Verification Status

| Verification                 | Result     |
| ---------------------------- | ---------- |
| `forge build`                | PASS       |
| Differential fuzz test       | PASS       |
| Differential fuzz runs       | 256        |
| Halmos version               | 0.3.3      |
| Halmos symbolic proof        | PASS       |
| Halmos symbolic paths        | 6          |
| GitHub Actions workflow      | Configured |
| Specification-first workflow | Completed  |

---

# 12. Final Property

The central property of this assignment remains:

> `OptimizedVault.withdraw` must never allow a caller to withdraw more real ETH than they have genuinely deposited into the vault.

The differential fuzz test provides concrete behavioral comparison against the Week 46 implementation.

The Halmos proof provides symbolic verification of the allowed withdrawal behavior.

The specification remains independent of the current implementation, ensuring that future optimizations can be evaluated against the same intended security property.
