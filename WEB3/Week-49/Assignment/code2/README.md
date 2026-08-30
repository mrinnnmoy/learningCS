# For someone cloning.

Simply reinstall the dependencies.

```
cd verify-medium
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init verify-medium --no-git
     cd verify-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create src/VaultWithBug.sol and all three test/ files from the
   Solution below.

4. Run the unit test first, confirm it looks completely clean.

     forge build
     forge test --match-path test/VaultUnit.t.sol -vv

5. Then run the invariant test separately, and watch it fail.

     forge test --match-path test/VaultInvariant.t.sol -vvv
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code2/verify-medium$ forge test --match-path test/VaultUnit.t.sol -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/VaultUnit.t.sol:VaultUnitTest
[PASS] testFix_DepositThenWithdrawWorksNormally() (gas: 48825)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 534.95µs (93.32µs CPU time)

Ran 1 test suite in 89.82ms (534.95µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code2/verify-medium$ forge test --match-path test/VaultInvariant.t.sol -vvv
[⠊] Compiling...
No files changed, compilation skipped
{"timestamp":1788194725,"event":"failure","invariant":"invariant_solvency","target":"test/VaultInvariant.t.sol:VaultInvariantTest","reason":"assertion failed: 0 != 83031768379667310597"}

Ran 1 test for test/VaultInvariant.t.sol:VaultInvariantTest
[FAIL: assertion failed: 0 != 83031768379667310597]
        [Sequence] (original: 1, shrunk: 1)
                sender=0x0000000000000000000000000000000000001881 addr=[test/Handler.sol:Handler]0x2e234DAe75C793f67A35089C9d99245E1C58470b calldata=creditReward(address,uint256) args=[0x26f2F1552B4cA76d2605c43db943459C85004201, 10283031768379667310699 [1.028e22]]
 invariant_solvency() (runs: 0, calls: 0, reverts: 0)

╭----------+--------------+-------+---------+----------╮
| Contract | Selector     | Calls | Reverts | Discards |
+======================================================+
| Handler  | creditReward | 1     | 0       | 0        |
╰----------+--------------+-------+---------+----------╯

Traces:
  [53021] Handler::creditReward(0x26f2F1552B4cA76d2605c43db943459C85004201, 10283031768379667310699 [1.028e22])
    ├─ [23039] VaultWithBug::creditReward(0x26f2F1552B4cA76d2605c43db943459C85004201, 83031768379667310597 [8.303e19])
    │   └─ ← [Stop]
    └─ ← [Stop]

  [15743] VaultInvariantTest::invariant_solvency()
    ├─ [2492] Handler::totalTrackedClaims() [staticcall]
    │   └─ ← [Return] 83031768379667310597 [8.303e19]
    ├─ [0] VM::assertEq(0, 83031768379667310597 [8.303e19]) [staticcall]
    │   └─ ← [Revert] assertion failed: 0 != 83031768379667310597
    └─ ← [Revert] assertion failed: 0 != 83031768379667310597

Suite result: FAILED. 0 passed; 1 failed; 0 skipped; finished in 63.25ms (62.23ms CPU time)

Ran 1 test suite in 68.03ms (63.25ms CPU time): 0 tests passed, 1 failed, 0 skipped (1 total tests)

Failing tests:
Encountered 1 failing test in test/VaultInvariant.t.sol:VaultInvariantTest
[FAIL: assertion failed: 0 != 83031768379667310597]
        [Sequence] (original: 1, shrunk: 1)
                sender=0x0000000000000000000000000000000000001881 addr=[test/Handler.sol:Handler]0x2e234DAe75C793f67A35089C9d99245E1C58470b calldata=creditReward(address,uint256) args=[0x26f2F1552B4cA76d2605c43db943459C85004201, 10283031768379667310699 [1.028e22]]
 invariant_solvency() (runs: 0, calls: 0, reverts: 0)

Encountered a total of 1 failing tests, 0 tests succeeded

Tip: Run `forge test --rerun` to retry only the 1 failed test

Fuzz seed: 0xcaed007f1e5a7346115f9eaf68b32fd49f49e29783e7e7d05ded5ffe7b4975a3 (use `--fuzz-seed` to reproduce)
```
