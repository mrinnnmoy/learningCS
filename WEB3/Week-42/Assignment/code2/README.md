# For someone cloning.

Simply reinstall the dependencies.

```
cd governence-medium
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin.

     forge init governance-medium --no-git
     cd governance-medium
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all three src/ files and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, all passing. If the MyGovernor override
   boilerplate fails to compile against your exact installed
   OpenZeppelin version, this Assignment's own intro flags exactly
   why and what to check first.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code2/governance-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/GovernanceLifecycle.t.sol:GovernanceLifecycleTest
[PASS] testFix_FullLifecycleMovesRealFundsFromTreasury() (gas: 403529)
[PASS] testFix_UndelegatedHolderHasZeroVotingPowerUntilSelfDelegating() (gas: 87442)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 3.01ms (1.24ms CPU time)

Ran 1 test suite in 9.94ms (3.01ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code2/governance-medium$ forge test --match-test testFix_FullLifecycleMovesRealFundsFromTreasury -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/GovernanceLifecycle.t.sol:GovernanceLifecycleTest
[PASS] testFix_FullLifecycleMovesRealFundsFromTreasury() (gas: 403529)
Traces:
  [423429] GovernanceLifecycleTest::testFix_FullLifecycleMovesRealFundsFromTreasury()
    ├─ [75409] GovToken::delegate(GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit DelegateChanged(delegator: GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], fromDelegate: 0x0000000000000000000000000000000000000000, toDelegate: GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   ├─ emit DelegateVotesChanged(delegate: GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], previousVotes: 0, newVotes: 1000000000000000000000000 [1e24])
    │   └─ ← [Stop]
    ├─ [0] VM::roll(2)
    │   └─ ← [Return]
    ├─ [47716] MyGovernor::propose([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], "Release 5 ETH to recipient")
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 2
    │   ├─ emit ProposalCreated(proposalId: 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76], proposer: GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], targets: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], values: [0], signatures: [""], calldatas: [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], voteStart: 3, voteEnd: 53, description: "Release 5 ETH to recipient")
    │   └─ ← [Return] 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76]
    ├─ [641] MyGovernor::votingDelay() [staticcall]
    │   └─ ← [Return] 1
    ├─ [0] VM::roll(4)
    │   └─ ← [Return]
    ├─ [56827] MyGovernor::castVote(13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76], 1)
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 4
    │   ├─ [2708] GovToken::getPastVotes(GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], 3) [staticcall]
    │   │   └─ ← [Return] 1000000000000000000000000 [1e24]
    │   ├─ emit VoteCast(voter: GovernanceLifecycleTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], proposalId: 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76], support: 1, weight: 1000000000000000000000000 [1e24], reason: "")
    │   └─ ← [Return] 1000000000000000000000000 [1e24]
    ├─ [627] MyGovernor::votingPeriod() [staticcall]
    │   └─ ← [Return] 50
    ├─ [0] VM::roll(55)
    │   └─ ← [Return]
    ├─ [128768] MyGovernor::queue([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], 0x5629f5e2f28881a6523c4c72c2340ea673c41bcfde8470cb26d08c257ea57649)
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 55
    │   ├─ [6446] GovToken::getPastTotalSupply(3) [staticcall]
    │   │   └─ ← [Return] 1000000000000000000000000 [1e24]
    │   ├─ [2542] TimelockController::getMinDelay() [staticcall]
    │   │   └─ ← [Return] 172800 [1.728e5]
    │   ├─ [4071] TimelockController::hashOperationBatch([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], 0x0000000000000000000000000000000000000000000000000000000000000000, 0xa001bc1b523d3e8f418fda7b4d487ebfc6de99c5de8470cb26d08c257ea57649) [staticcall]
    │   │   └─ ← [Return] 0x7a6a172f187f12edd81d421c34b46a0a0b39ec0f93226117b9a9ffb01c4af430
    │   ├─ [36555] TimelockController::scheduleBatch([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], 0x0000000000000000000000000000000000000000000000000000000000000000, 0xa001bc1b523d3e8f418fda7b4d487ebfc6de99c5de8470cb26d08c257ea57649, 172800 [1.728e5])
    │   │   ├─ emit CallScheduled(id: 0x7a6a172f187f12edd81d421c34b46a0a0b39ec0f93226117b9a9ffb01c4af430, index: 0, target: Treasury: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], value: 0, data: 0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000, predecessor: 0x0000000000000000000000000000000000000000000000000000000000000000, delay: 172800 [1.728e5])
    │   │   ├─ emit CallSalt(id: 0x7a6a172f187f12edd81d421c34b46a0a0b39ec0f93226117b9a9ffb01c4af430, salt: 0xa001bc1b523d3e8f418fda7b4d487ebfc6de99c5de8470cb26d08c257ea57649)
    │   │   └─ ← [Stop]
    │   ├─ emit ProposalQueued(proposalId: 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76], etaSeconds: 172801 [1.728e5])
    │   └─ ← [Return] 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76]
    ├─ [0] VM::warp(172802 [1.728e5])
    │   └─ ← [Return]
    ├─ [78765] MyGovernor::execute([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], 0x5629f5e2f28881a6523c4c72c2340ea673c41bcfde8470cb26d08c257ea57649)
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 55
    │   ├─ [2446] GovToken::getPastTotalSupply(3) [staticcall]
    │   │   └─ ← [Return] 1000000000000000000000000 [1e24]
    │   ├─ [1159] TimelockController::isOperationPending(0x7a6a172f187f12edd81d421c34b46a0a0b39ec0f93226117b9a9ffb01c4af430) [staticcall]
    │   │   └─ ← [Return] true
    │   ├─ [52893] TimelockController::executeBatch([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000], 0x0000000000000000000000000000000000000000000000000000000000000000, 0xa001bc1b523d3e8f418fda7b4d487ebfc6de99c5de8470cb26d08c257ea57649)
    │   │   ├─ [35034] Treasury::release(0x000000000000000000000000000000000000cafE, 5000000000000000000 [5e18])
    │   │   │   ├─ [0] 0x000000000000000000000000000000000000cafE::fallback{value: 5000000000000000000}()
    │   │   │   │   └─ ← [Stop]
    │   │   │   └─ ← [Stop]
    │   │   ├─ emit CallExecuted(id: 0x7a6a172f187f12edd81d421c34b46a0a0b39ec0f93226117b9a9ffb01c4af430, index: 0, target: Treasury: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], value: 0, data: 0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000004563918244f40000)
    │   │   └─ ← [Stop]
    │   ├─ emit ProposalExecuted(proposalId: 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76])
    │   └─ ← [Return] 13144470266300992091453805723730272795583262588667111258741683142699206025095 [1.314e76]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.10ms (779.36µs CPU time)

Ran 1 test suite in 13.75ms (3.10ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
