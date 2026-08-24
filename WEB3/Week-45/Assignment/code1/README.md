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
1. Scaffold and install OpenZeppelin (needed for LiquidityPool's own
   ERC20 base, Week 29's own pattern).

     forge init mev-easy --no-git
     cd mev-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Copy MockERC20.sol and LiquidityPool.sol from Week 34 unchanged.
   Create Arbitrageur.sol, SimpleLendingPool.sol, and both test files
   from the Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code1/mev-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/LiquidationRace.t.sol:LiquidationRaceTest
[PASS] testFix_FirstSearcherWinsSecondFailsHarmlessly() (gas: 152578)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.09ms (255.43µs CPU time)

Ran 1 test for test/Arbitrage.t.sol:ArbitrageTest
[PASS] testFix_ArbitrageProfitsAndNarrowsThePriceGap() (gas: 156612)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.46ms (206.68µs CPU time)

Ran 2 test suites in 11.15ms (2.55ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code1/mev-easy$ forge test --match-test testFix_FirstSearcherWinsSecondFailsHarmlessly -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/LiquidationRace.t.sol:LiquidationRaceTest
[PASS] testFix_FirstSearcherWinsSecondFailsHarmlessly() (gas: 152578)
Traces:
  [195988] LiquidationRaceTest::testFix_FirstSearcherWinsSecondFailsHarmlessly()
    ├─ [5537] SimpleLendingPool::setPrice(800000000000000000 [8e17])
    │   └─ ← [Stop]
    ├─ [5567] SimpleLendingPool::isLiquidatable(0x00000000000000000000000000000000000000B0) [staticcall]
    │   └─ ← [Return] true
    ├─ [28229] MockERC20::mint(0x0000000000000000000000000000000000000051, 90000000000000000000 [9e19])
    │   └─ ← [Stop]
    ├─ [23429] MockERC20::mint(0x0000000000000000000000000000000000000052, 90000000000000000000 [9e19])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x0000000000000000000000000000000000000051)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(SimpleLendingPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 90000000000000000000 [9e19])
    │   └─ ← [Return] true
    ├─ [50417] SimpleLendingPool::liquidate(0x00000000000000000000000000000000000000B0, 90000000000000000000 [9e19])
    │   ├─ [7483] MockERC20::transferFrom(0x0000000000000000000000000000000000000051, SimpleLendingPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 90000000000000000000 [9e19])
    │   │   └─ ← [Return] true
    │   ├─ [28580] MockERC20::transfer(0x0000000000000000000000000000000000000051, 100000000000000000000 [1e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [1567] SimpleLendingPool::isLiquidatable(0x00000000000000000000000000000000000000B0) [staticcall]
    │   └─ ← [Return] false
    ├─ [824] MockERC20::balanceOf(0x0000000000000000000000000000000000000051) [staticcall]
    │   └─ ← [Return] 100000000000000000000 [1e20]
    ├─ [0] VM::startPrank(0x0000000000000000000000000000000000000052)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(SimpleLendingPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 90000000000000000000 [9e19])
    │   └─ ← [Return] true
    ├─ [0] VM::expectRevert(NotLiquidatable())
    │   └─ ← [Return]
    ├─ [1694] SimpleLendingPool::liquidate(0x00000000000000000000000000000000000000B0, 90000000000000000000 [9e19])
    │   └─ ← [Revert] NotLiquidatable()
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.07ms (248.74µs CPU time)

Ran 1 test suite in 10.38ms (1.07ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```