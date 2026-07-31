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
1. Scaffold and install, identical to Easy's own step 1.

2. Copy MockERC20.sol from Easy unchanged; copy LiquidityPool.sol
   from Easy and add the swap() function from the Solution below.

3. Create the one test file from the Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code2/liquidity-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/FeesAndImpermanentLoss.t.sol:FeesAndImpermanentLossTest
[PASS] testFix_FeesGrowLPsRedeemableValueOverTime() (gas: 574503)
[PASS] testFix_ImpermanentLossMatchesTheClosedFormFormula() (gas: 424286)
[PASS] testFix_LargerPriceMoveProducesLargerImpermanentLoss() (gas: 1971118)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 1.60ms (1.86ms CPU time)

Ran 1 test suite in 8.76ms (1.60ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```