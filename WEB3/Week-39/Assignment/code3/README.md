# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin (needed for both Ownable and
   TimelockController this time, Week 33's own combined install).

     forge init centralized-hard --no-git
     cd centralized-hard
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create src/GovernedFeeContract.sol and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 4 tests, all passing.

5. Fill in TRUST_ASSUMPTIONS.md from the starting template —
   actually answer each row against THIS contract, at
   each real phase, don't leave it generic.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code3/centralized-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/ProgressiveDecentralization.t.sol:ProgressiveDecentralizationTest
[PASS] testFix_HardCapHoldsEvenThroughTheFullLegitimateTimelockFlow() (gas: 2395306)
[PASS] testFix_InitialFeeAboveCapRevertsAtDeployment() (gas: 62959)
[PASS] testFix_Phase1_EOAOwnerChangesFeeInstantly() (gas: 21075)
[PASS] testFix_Phase2_OwnershipMovesToATimelock() (gas: 2414294)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 3.16ms (5.68ms CPU time)

Ran 1 test suite in 12.89ms (3.16ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code3/centralized-hard$ forge test --match-test testFix_Phase2_OwnershipMovesToATimelock -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/ProgressiveDecentralization.t.sol:ProgressiveDecentralizationTest
[PASS] testFix_Phase2_OwnershipMovesToATimelock() (gas: 2414294)
Traces:
  [2414294] ProgressiveDecentralizationTest::testFix_Phase2_OwnershipMovesToATimelock()
    ├─ [2293217] → new TimelockController@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   ├─ emit RoleGranted(role: 0x0000000000000000000000000000000000000000000000000000000000000000, account: TimelockController: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f], sender: ProgressiveDecentralizationTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit RoleGranted(role: 0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1, account: 0x00000000000000000000000000000000000A11cE, sender: ProgressiveDecentralizationTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit RoleGranted(role: 0xfd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f783, account: 0x00000000000000000000000000000000000A11cE, sender: ProgressiveDecentralizationTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit RoleGranted(role: 0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63, account: 0x00000000000000000000000000000000000A11cE, sender: ProgressiveDecentralizationTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit MinDelayChange(oldDuration: 0, newDuration: 172800 [1.728e5])
    │   └─ ← [Return] 10827 bytes of code
    ├─ [0] VM::prank(0x00000000000000000000000000000000000A11cE)
    │   └─ ← [Return]
    ├─ [7616] GovernedFeeContract::transferOwnership(TimelockController: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f])
    │   ├─ emit OwnershipTransferred(previousOwner: 0x00000000000000000000000000000000000A11cE, newOwner: TimelockController: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000A11cE)
    │   └─ ← [Return]
    ├─ [0] VM::expectRevert(custom error 0xf4844814)
    │   └─ ← [Return]
    ├─ [918] GovernedFeeContract::setFee(300)
    │   └─ ← [Revert] OwnableUnauthorizedAccount(0x00000000000000000000000000000000000A11cE)
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000A11cE)
    │   └─ ← [Return]
    ├─ [30258] TimelockController::schedule(GovernedFeeContract: [0x6b182f1488E8EfEb2Eb298155ed5Bd7FF8A14042], 0, 0x69fe0e2d000000000000000000000000000000000000000000000000000000000000012c, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000, 172800 [1.728e5])
    │   ├─ emit CallScheduled(id: 0x22c2e4311d108f6295a06f5ce518ce9797ce8650cdbdd8b650ccb13af3ebe3df, index: 0, target: GovernedFeeContract: [0x6b182f1488E8EfEb2Eb298155ed5Bd7FF8A14042], value: 0, data: 0x69fe0e2d000000000000000000000000000000000000000000000000000000000000012c, predecessor: 0x0000000000000000000000000000000000000000000000000000000000000000, delay: 172800 [1.728e5])
    │   └─ ← [Stop]
    ├─ [0] VM::expectRevert(custom error 0xf4844814)
    │   └─ ← [Return]
    ├─ [5911] TimelockController::execute(GovernedFeeContract: [0x6b182f1488E8EfEb2Eb298155ed5Bd7FF8A14042], 0, 0x69fe0e2d000000000000000000000000000000000000000000000000000000000000012c, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000)
    │   └─ ← [Revert] TimelockUnexpectedOperationState(0x22c2e4311d108f6295a06f5ce518ce9797ce8650cdbdd8b650ccb13af3ebe3df, 0x0000000000000000000000000000000000000000000000000000000000000004)
    ├─ [0] VM::warp(172802 [1.728e5])
    │   └─ ← [Return]
    ├─ [17813] TimelockController::execute(GovernedFeeContract: [0x6b182f1488E8EfEb2Eb298155ed5Bd7FF8A14042], 0, 0x69fe0e2d000000000000000000000000000000000000000000000000000000000000012c, 0x0000000000000000000000000000000000000000000000000000000000000000, 0x0000000000000000000000000000000000000000000000000000000000000000)
    │   ├─ [7247] GovernedFeeContract::setFee(300)
    │   │   ├─ emit FeeUpdated(oldFee: 100, newFee: 300)
    │   │   └─ ← [Stop]
    │   ├─ emit CallExecuted(id: 0x22c2e4311d108f6295a06f5ce518ce9797ce8650cdbdd8b650ccb13af3ebe3df, index: 0, target: GovernedFeeContract: [0x6b182f1488E8EfEb2Eb298155ed5Bd7FF8A14042], value: 0, data: 0x69fe0e2d000000000000000000000000000000000000000000000000000000000000012c)
    │   └─ ← [Stop]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [403] GovernedFeeContract::feeBps() [staticcall]
    │   └─ ← [Return] 300
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 970.71µs (349.14µs CPU time)

Ran 1 test suite in 10.39ms (970.71µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```