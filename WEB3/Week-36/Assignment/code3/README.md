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
1. Scaffold and install OpenZeppelin (Week 29's own pattern — only
   needed here for the ERC20 base; ECDSA isn't used until Medium).

     forge init bridge-hard --no-git
     cd bridge-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all four src/ files and both test files from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 4 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-36/Assignment/code3/bridge-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/LiquidityNetworkBridge.t.sol:LiquidityNetworkBridgeTest
[PASS] testExploit_InsufficientDestinationLiquidityReverts() (gas: 18011)
[PASS] testFix_DepositAndReleaseMovesRealTokensNoMinting() (gas: 197871)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.81ms (579.95µs CPU time)

Ran 2 tests for test/ReplayAttack.t.sol:ReplayAttackTest
[PASS] testExploit_SameSignatureMintsTwiceAgainstVulnerableReceiver() (gas: 580938)
[PASS] testFix_IdenticalReplayFailsAgainstFixedReceiver() (gas: 667023)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.87ms (2.04ms CPU time)

Ran 2 test suites in 9.87ms (3.68ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```
