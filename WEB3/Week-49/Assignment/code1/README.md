# For someone cloning.

Simply reinstall the dependencies.

```
cd verify-easy
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init verify-easy --no-git
     cd verify-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run — fuzz tests run with Foundry's own default 256 runs
   unless configured otherwise.

     forge build
     forge test -vv
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code1/verify-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/FuzzBasics.t.sol:FuzzBasicsTest
[PASS] testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance(uint96) (runs: 256, μ: 40755, ~: 40501)
[PASS] testFuzz_DepositThenWithdrawReturnsExactAmount(uint96) (runs: 256, μ: 33740, ~: 33543)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 7.07ms (12.73ms CPU time)

Ran 1 test suite in 11.96ms (7.07ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code1/verify-easy$ forge test \
  --match-test testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance \
  -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/FuzzBasics.t.sol:FuzzBasicsTest
[PASS] testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance(uint96) (runs: 256, μ: 40796, ~: 40501)
Traces:
  [40501] FuzzBasicsTest::testFuzz_BuggyVaultRejectsExactlyOneWeiOverBalance(7755)
    ├─ [0] VM::deal(FuzzBasicsTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], 7755)
    │   └─ ← [Return]
    ├─ [22537] BuggyVault::deposit{value: 7755}()
    │   └─ ← [Stop]
    ├─ [0] VM::expectRevert(custom error 0xf4844814)
    │   └─ ← [Return]
    ├─ [1186] BuggyVault::withdraw(7756)
    │   └─ ← [Revert] panic: arithmetic underflow or overflow (0x11)
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 6.18ms (5.68ms CPU time)

Ran 1 test suite in 9.84ms (6.18ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code1/verify-easy$ forge test \
  --match-test testFuzz_DepositThenWithdrawReturnsExactAmount \
  --fuzz-runs 5000 \
  -v
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/FuzzBasics.t.sol:FuzzBasicsTest
[PASS] testFuzz_DepositThenWithdrawReturnsExactAmount(uint96) (runs: 5000, μ: 33756, ~: 33543)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 26.80ms (26.41ms CPU time)

Ran 1 test suite in 28.23ms (26.80ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```