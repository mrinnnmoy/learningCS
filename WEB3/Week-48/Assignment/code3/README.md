# For someone cloning.

Simply reinstall the dependencies.

```
cd restaking-hard
forge install foundry-rs/forge-std
forge build
```

---


# How to Build.

```
1. Scaffold.

     forge init restaking-hard --no-git
     cd restaking-hard

2. Set the same solc pin as Easy/Medium.

3. Create src/MultiAVSRestaking.sol and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, both passing.

5. Fill in RESTAKING_RISK_ANALYSIS.md from its own starting template.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code3/restaking-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/CascadingSlash.t.sol:CascadingSlashTest
[PASS] testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty() (gas: 47774)
[PASS] testFix_SlashOrderChangesEachAVSsOwnRecoveryButNotTheFinalTotal() (gas: 45907)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.37ms (625.88µs CPU time)

Ran 1 test suite in 85.96ms (1.37ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code3/restaking-hard$ forge test --match-test testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/CascadingSlash.t.sol:CascadingSlashTest
[PASS] testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty() (gas: 47774)
Traces:
  [47774] CascadingSlashTest::testExploit_CascadingSlashLeavesTwentyFivePercentNotZeroOrFifty()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [15960] MultiAVSRestaking::slash(0x00000000000000000000000000000000000000A1, 0xf81826b82628c464e61ceb61ccab56fd536327a858b922eec40669a8c07a00ec)
    │   ├─ emit Slashed(restaker: 0x00000000000000000000000000000000000000A1, avsId: 0xf81826b82628c464e61ceb61ccab56fd536327a858b922eec40669a8c07a00ec, amountSlashed: 50000000000000000000 [5e19], remainingStake: 50000000000000000000 [5e19])
    │   └─ ← [Return] 50000000000000000000 [5e19]
    ├─ [824] MultiAVSRestaking::restaked(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 50000000000000000000 [5e19]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [11160] MultiAVSRestaking::slash(0x00000000000000000000000000000000000000A1, 0xd2b86434353da5a1ad153afbff0192fc5ade6db47cb27b03fc993e67a51c6600)
    │   ├─ emit Slashed(restaker: 0x00000000000000000000000000000000000000A1, avsId: 0xd2b86434353da5a1ad153afbff0192fc5ade6db47cb27b03fc993e67a51c6600, amountSlashed: 25000000000000000000 [2.5e19], remainingStake: 25000000000000000000 [2.5e19])
    │   └─ ← [Return] 25000000000000000000 [2.5e19]
    ├─ [824] MultiAVSRestaking::restaked(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 25000000000000000000 [2.5e19]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 633.27µs (132.95µs CPU time)

Ran 1 test suite in 9.27ms (633.27µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```