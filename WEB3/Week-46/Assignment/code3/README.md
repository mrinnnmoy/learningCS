# For someone cloning.

Simply reinstall the dependencies.

```
cd gas-hard
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init gas-hard --no-git
     cd gas-hard

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and the one test file from the Solution
   below.

4. Build, run, and snapshot the UNOPTIMIZED baseline first:

     forge build
     forge test -vv
     forge snapshot

5. Confirm the diff shows the optimized version genuinely improved:

     forge snapshot --diff

6. Fill in GAS_OPTIMIZATION_REPORT.md with the real numbers your own
   run produced.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code3/gas-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/VaultOptimization.t.sol:VaultOptimizationTest
[PASS] testFix_BatchCheckActiveCostsLessOnOptimizedVault() (gas: 239434)
Logs:
  UnoptimizedVault.batchCheckActive gas: 11518
  OptimizedVault.batchCheckActive gas: 11270

[PASS] testFix_BothVaultsProduceIdenticalResults() (gas: 419073)
[PASS] testFix_DepositCostsLessOnOptimizedVault() (gas: 215957)
Logs:
  UnoptimizedVault.deposit gas: 123377
  OptimizedVault.deposit gas: 79678

[PASS] testFix_TotalDepositedCostsLessOnOptimizedVault() (gas: 835589)
Logs:
  UnoptimizedVault.totalDeposited gas: 5560
  OptimizedVault.totalDeposited gas: 5161

Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 1.78ms (1.27ms CPU time)

Ran 1 test suite in 10.98ms (1.78ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code3/gas-hard$ forge snapshot
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/VaultOptimization.t.sol:VaultOptimizationTest
[PASS] testFix_BatchCheckActiveCostsLessOnOptimizedVault() (gas: 239434)
[PASS] testFix_BothVaultsProduceIdenticalResults() (gas: 419073)
[PASS] testFix_DepositCostsLessOnOptimizedVault() (gas: 215957)
[PASS] testFix_TotalDepositedCostsLessOnOptimizedVault() (gas: 835589)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 1.62ms (1.77ms CPU time)

Ran 1 test suite in 9.17ms (1.62ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code3/gas-hard$ forge snapshot --diff
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/VaultOptimization.t.sol:VaultOptimizationTest
[PASS] testFix_BatchCheckActiveCostsLessOnOptimizedVault() (gas: 239434)
[PASS] testFix_BothVaultsProduceIdenticalResults() (gas: 419073)
[PASS] testFix_DepositCostsLessOnOptimizedVault() (gas: 215957)
[PASS] testFix_TotalDepositedCostsLessOnOptimizedVault() (gas: 835589)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 2.37ms (1.39ms CPU time)

Ran 1 test suite in 10.68ms (2.37ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
━ VaultOptimizationTest::testFix_BatchCheckActiveCostsLessOnOptimizedVault() (gas: 239434 → 239434 | 0 0.000%)
━ VaultOptimizationTest::testFix_BothVaultsProduceIdenticalResults() (gas: 419073 → 419073 | 0 0.000%)
━ VaultOptimizationTest::testFix_DepositCostsLessOnOptimizedVault() (gas: 215957 → 215957 | 0 0.000%)
━ VaultOptimizationTest::testFix_TotalDepositedCostsLessOnOptimizedVault() (gas: 835589 → 835589 | 0 0.000%)

--------------------------------------------------------------------------------
Total tests: 4, ↑ 0, ↓ 0, ━ 4
Overall gas change: 0 (0.000%)
```