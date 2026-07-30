# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
forge install OpenZeppelin/openzeppelin-foundry-upgrades
forge build
```

---

# How to Build.

```
1. Scaffold and install, identical to Easy's own step 1.

2. Set foundry.toml identically to Easy's.

3. Create all three src/ files and the one test file from the
   Solution below.

4. Build and run.

     forge clean
     forge test -vv --force

   You should see 3 tests: one confirming the safe V1→V2 upgrade,
   one confirming the unsafe V1→V2Bad upgrade is REJECTED (this test
   passing means the rejection itself happened correctly), and one
   confirming a non-owner can't authorize an upgrade at all.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-33/Assignment/code2/upgrade-medium$ forge test -vv --force
[⠊] Compiling...
[⠆] Compiling 62 files with Solc 0.8.36
[⠒] Solc 0.8.36 finished in 3.20s
Compiler run successful!

Ran 3 tests for test/UUPSUpgrade.t.sol:UUPSUpgradeTest
[PASS] testExploit_UnsafeLayoutChangeIsRejectedByValidation() (gas: 18489057)
Logs:
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

[PASS] testFix_NonOwnerCannotAuthorizeAnUpgrade() (gas: 14624871)
Logs:
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

[PASS] testFix_SafeUpgradePreservesStateAndAddsNewField() (gas: 48395292)
Logs:
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 8.02s (16.78s CPU time)

Ran 1 test suite in 8.02s (8.02s CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```