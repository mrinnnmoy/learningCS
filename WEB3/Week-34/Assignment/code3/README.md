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
1. Scaffold and install, identical to Easy/Medium's own step 1.

2. Copy MockERC20.sol and LiquidityPool.sol (with swap()) from
   Medium, unchanged.

3. Create SandwichAttacker.sol, LPStaking.sol, and both test files
   from the Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-34/Assignment/code3/liquidity-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/YieldFarming.t.sol:YieldFarmingTest
[PASS] testFix_ClaimPaysExactlyTheSimplifiedFormulaPredicts() (gas: 137816)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.44ms (322.10µs CPU time)

Ran 2 tests for test/SandwichAttack.t.sol:SandwichAttackTest
[PASS] testExploit_SandwichProfitsAgainstUnprotectedVictimSwap() (gas: 466787)
[PASS] testFix_RealisticMinAmountOutMakesTheSandwichRevertInstead() (gas: 428785)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.04ms (700.45µs CPU time)

Ran 2 test suites in 11.34ms (3.48ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```