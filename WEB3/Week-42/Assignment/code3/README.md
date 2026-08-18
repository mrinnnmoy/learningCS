# For someone cloning.

Simply reinstall the dependencies.

```
cd governence-hard
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin.

     forge init governance-hard --no-git
     cd governance-hard
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Copy GovToken.sol and Treasury.sol from Medium unchanged; copy
   MyGovernor.sol and change GovernorSettings(1, 50, 0) to
   GovernorSettings(1, 50, 1000 ether).

4. Create the one test file from the Solution below.

5. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code3/governance-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/GovernanceAttacks.t.sol:GovernanceAttacksTest
[PASS] testExploit_LowBalanceAddressCannotProposeAtAll() (gas: 179666)
[PASS] testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed() (gas: 268132)
[PASS] testFix_UnanimousSupportStillFailsWithoutQuorum() (gas: 302554)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 3.59ms (2.21ms CPU time)

Ran 1 test suite in 12.41ms (3.59ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code3/governance-hard$ forge test --match-test testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/GovernanceAttacks.t.sol:GovernanceAttacksTest
[PASS] testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed() (gas: 268132)
Traces:
  [268132] GovernanceAttacksTest::testFix_FlashLoanedVotingPowerIsIgnoredBecauseSnapshotAlreadyPassed()
    ├─ [59297] MyGovernor::propose([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000000de0b6b3a7640000], "Release 1 ETH")
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 2
    │   ├─ [6708] GovToken::getPastVotes(GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], 1) [staticcall]
    │   │   └─ ← [Return] 1000000000000000000000000 [1e24]
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 2
    │   ├─ emit ProposalCreated(proposalId: 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], proposer: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], targets: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], values: [0], signatures: [""], calldatas: [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000000de0b6b3a7640000], voteStart: 3, voteEnd: 53, description: "Release 1 ETH")
    │   └─ ← [Return] 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76]
    ├─ [641] MyGovernor::votingDelay() [staticcall]
    │   └─ ← [Return] 1
    ├─ [0] VM::roll(4)
    │   └─ ← [Return]
    ├─ [0] VM::prank(GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   └─ ← [Return]
    ├─ [65432] GovToken::transfer(0x000000000000000000000000000000000000bEEF, 10000000000000000000000 [1e22])
    │   ├─ emit Transfer(from: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], to: 0x000000000000000000000000000000000000bEEF, amount: 10000000000000000000000 [1e22])
    │   ├─ emit DelegateVotesChanged(delegate: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], previousVotes: 1000000000000000000000000 [1e24], newVotes: 990000000000000000000000 [9.9e23])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x000000000000000000000000000000000000bEEF)
    │   └─ ← [Return]
    ├─ [71409] GovToken::delegate(0x000000000000000000000000000000000000bEEF)
    │   ├─ emit DelegateChanged(delegator: 0x000000000000000000000000000000000000bEEF, fromDelegate: 0x0000000000000000000000000000000000000000, toDelegate: 0x000000000000000000000000000000000000bEEF)
    │   ├─ emit DelegateVotesChanged(delegate: 0x000000000000000000000000000000000000bEEF, previousVotes: 0, newVotes: 10000000000000000000000 [1e22])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x000000000000000000000000000000000000bEEF)
    │   └─ ← [Return]
    ├─ [36261] MyGovernor::castVote(41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], 1)
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 4
    │   ├─ [2042] GovToken::getPastVotes(0x000000000000000000000000000000000000bEEF, 3) [staticcall]
    │   │   └─ ← [Return] 0
    │   ├─ emit VoteCast(voter: 0x000000000000000000000000000000000000bEEF, proposalId: 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], support: 1, weight: 0, reason: "")
    │   └─ ← [Return] 0
    ├─ [5334] MyGovernor::proposalVotes(41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76]) [staticcall]
    │   └─ ← [Return] 0, 0, 0
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.48ms (345.59µs CPU time)

Ran 1 test suite in 11.65ms (3.48ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code3/governance-hard$ forge test --match-test testFix_UnanimousSupportStillFailsWithoutQuorum -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/GovernanceAttacks.t.sol:GovernanceAttacksTest
[PASS] testFix_UnanimousSupportStillFailsWithoutQuorum() (gas: 302554)
Traces:
  [302554] GovernanceAttacksTest::testFix_UnanimousSupportStillFailsWithoutQuorum()
    ├─ [0] VM::prank(GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   └─ ← [Return]
    ├─ [69432] GovToken::transfer(0x00000000000000000000000000000000000000D1, 10000000000000000000000 [1e22])
    │   ├─ emit Transfer(from: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], to: 0x00000000000000000000000000000000000000D1, amount: 10000000000000000000000 [1e22])
    │   ├─ emit DelegateVotesChanged(delegate: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], previousVotes: 1000000000000000000000000 [1e24], newVotes: 990000000000000000000000 [9.9e23])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000D1)
    │   └─ ← [Return]
    ├─ [71409] GovToken::delegate(0x00000000000000000000000000000000000000D1)
    │   ├─ emit DelegateChanged(delegator: 0x00000000000000000000000000000000000000D1, fromDelegate: 0x0000000000000000000000000000000000000000, toDelegate: 0x00000000000000000000000000000000000000D1)
    │   ├─ emit DelegateVotesChanged(delegate: 0x00000000000000000000000000000000000000D1, previousVotes: 0, newVotes: 10000000000000000000000 [1e22])
    │   └─ ← [Stop]
    ├─ [0] VM::roll(3)
    │   └─ ← [Return]
    ├─ [52797] MyGovernor::propose([0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], [0], [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000000de0b6b3a7640000], "Release 1 ETH")
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 3
    │   ├─ [2708] GovToken::getPastVotes(GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], 2) [staticcall]
    │   │   └─ ← [Return] 990000000000000000000000 [9.9e23]
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 3
    │   ├─ emit ProposalCreated(proposalId: 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], proposer: GovernanceAttacksTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496], targets: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], values: [0], signatures: [""], calldatas: [0x0357371d000000000000000000000000000000000000000000000000000000000000cafe0000000000000000000000000000000000000000000000000de0b6b3a7640000], voteStart: 4, voteEnd: 54, description: "Release 1 ETH")
    │   └─ ← [Return] 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76]
    ├─ [641] MyGovernor::votingDelay() [staticcall]
    │   └─ ← [Return] 1
    ├─ [0] VM::roll(5)
    │   └─ ← [Return]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000D1)
    │   └─ ← [Return]
    ├─ [56827] MyGovernor::castVote(41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], 1)
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 5
    │   ├─ [2708] GovToken::getPastVotes(0x00000000000000000000000000000000000000D1, 4) [staticcall]
    │   │   └─ ← [Return] 10000000000000000000000 [1e22]
    │   ├─ emit VoteCast(voter: 0x00000000000000000000000000000000000000D1, proposalId: 41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76], support: 1, weight: 10000000000000000000000 [1e22], reason: "")
    │   └─ ← [Return] 10000000000000000000000 [1e22]
    ├─ [627] MyGovernor::votingPeriod() [staticcall]
    │   └─ ← [Return] 50
    ├─ [0] VM::roll(56)
    │   └─ ← [Return]
    ├─ [19288] MyGovernor::state(41746172610811399184056138350034465073841955617021568844015402767169717259537 [4.174e76]) [staticcall]
    │   ├─ [556] GovToken::clock() [staticcall]
    │   │   └─ ← [Return] 56
    │   ├─ [6446] GovToken::getPastTotalSupply(4) [staticcall]
    │   │   └─ ← [Return] 1000000000000000000000000 [1e24]
    │   └─ ← [Return] 3
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.55ms (451.74µs CPU time)

Ran 1 test suite in 12.38ms (2.55ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
