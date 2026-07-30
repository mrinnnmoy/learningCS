# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
forge install OpenZeppelin/openzeppelin-foundry-upgrades
forge build
```

---

# How to Build.

```
1. Scaffold and install THREE dependencies this time (the plain,
   non-upgradeable OpenZeppelin package is needed for TimelockController
   itself):

     forge init upgrade-hard --no-git
     cd upgrade-hard
     forge install OpenZeppelin/openzeppelin-contracts
     forge install OpenZeppelin/openzeppelin-contracts-upgradeable
     forge install OpenZeppelin/openzeppelin-foundry-upgrades
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt
     echo '@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/' >> remappings.txt
     echo 'openzeppelin-foundry-upgrades/=lib/openzeppelin-foundry-upgrades/src/' >> remappings.txt

2. Set foundry.toml identically to Easy/Medium's.

3. Copy VaultV1.sol and VaultV2.sol from Medium, and create the two
   new src/ files and both test/ files from the Solution below.

4. Build and run.

     forge clean
     forge test -vv --force

   You should see 3 tests: one confirming a too-early execution
   reverts and a post-delay one succeeds, one confirming the
   uninitialized-implementation attack succeeds against
   VulnerableImplementation, one confirming it fails against
   SafeImplementation.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-33/Assignment/code3/upgrade-hard$ forge test -vv --force
[⠊] Compiling...
[⠢] Compiling 73 files with Solc 0.8.36
[⠆] Solc 0.8.36 finished in 4.11s
Compiler run successful!

Ran 2 tests for test/UninitializedImplementation.t.sol:UninitializedImplementationTest
[PASS] testExploit_AttackerInitializesTheRawImplementationDirectly() (gas: 469492)
[PASS] testFix_DisableInitializersPreventsTheIdenticalAttack() (gas: 443616)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 14.13ms (10.35ms CPU time)

Ran 1 test for test/TimelockedUpgrade.t.sol:TimelockedUpgradeTest
[PASS] testFix_UpgradeCannotExecuteBeforeTheDelayHasPassed() (gas: 1064422)
Logs:
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 5.87s (1.56ms CPU time)

Ran 2 test suites in 5.88s (5.88s CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```