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
1. Scaffold and install OpenZeppelin (Week 29's own pattern).

     forge init liquidity-easy --no-git
     cd liquidity-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 4 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code1/liquidity-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/LiquidityBasics.t.sol:LiquidityBasicsTest
[PASS] testFirstDepositMintsSqrtMinusMinimumLiquidity() (gas: 302466)
[PASS] testInvariantRoughlyHoldsWithNoSwaps() (gas: 300827)
[PASS] testRemoveLiquidityReturnsProportionalShare() (gas: 343304)
[PASS] testSecondDepositRespectsExistingRatio() (gas: 409916)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 2.07ms (2.34ms CPU time)

Ran 1 test suite in 10.03ms (2.07ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```