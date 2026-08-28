# For someone cloning.

Simply reinstall the dependencies.

```
cd restaking-easy
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init restaking-easy --no-git
     cd restaking-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create src/RestakingManager.sol and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code1/restaking-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/RestakingManager.t.sol:RestakingManagerTest
[PASS] testExploit_CannotSlashARestakerWhoNeverOptedIn() (gas: 49463)
[PASS] testExploit_OnlyTheRegisteredSlasherCanSlash() (gas: 14534)
[PASS] testFix_LegitimateSlashReducesExactlyTheOptedInRestaker() (gas: 27754)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 1.21ms (477.63µs CPU time)

Ran 1 test suite in 10.44ms (1.21ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code1/restaking-easy$ forge test --match-test testFix_LegitimateSlashReducesExactlyTheOptedInRestaker -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/RestakingManager.t.sol:RestakingManagerTest
[PASS] testFix_LegitimateSlashReducesExactlyTheOptedInRestaker() (gas: 27754)
Traces:
  [27754] RestakingManagerTest::testFix_LegitimateSlashReducesExactlyTheOptedInRestaker()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [12830] RestakingManager::slash(0x00000000000000000000000000000000000000A1, 0xce751b613d078702054f66d662101cb038a506bad5884932e50a02300c605b3f, 20000000000000000000 [2e19])
    │   ├─ emit Slashed(restaker: 0x00000000000000000000000000000000000000A1, avsId: 0xce751b613d078702054f66d662101cb038a506bad5884932e50a02300c605b3f, amount: 20000000000000000000 [2e19])
    │   └─ ← [Stop]
    ├─ [824] RestakingManager::restaked(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 80000000000000000000 [8e19]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.67ms (377.14µs CPU time)

Ran 1 test suite in 16.63ms (1.67ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code1/restaking-easy$ forge test --match-test testExploit_CannotSlashARestakerWhoNeverOptedIn -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/RestakingManager.t.sol:RestakingManagerTest
[PASS] testExploit_CannotSlashARestakerWhoNeverOptedIn() (gas: 49463)
Traces:
  [49463] RestakingManagerTest::testExploit_CannotSlashARestakerWhoNeverOptedIn()
    ├─ [0] VM::deal(0x00000000000000000000000000000000000000C1, 50000000000000000000 [5e19])
    │   └─ ← [Return]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [24130] RestakingManager::restake{value: 50000000000000000000}()
    │   ├─ emit Restaked(restaker: 0x00000000000000000000000000000000000000C1, amount: 50000000000000000000 [5e19])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [0] VM::expectRevert(NotOptedIn())
    │   └─ ← [Return]
    ├─ [5398] RestakingManager::slash(0x00000000000000000000000000000000000000C1, 0xce751b613d078702054f66d662101cb038a506bad5884932e50a02300c605b3f, 10000000000000000000 [1e19])
    │   └─ ← [Revert] NotOptedIn()
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 737.22µs (181.85µs CPU time)

Ran 1 test suite in 88.91ms (737.22µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```