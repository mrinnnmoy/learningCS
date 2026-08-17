# For someone cloning.

Simply reinstall the dependencies.

```
cd oracle-hard
forge install foundry-rs/forge-std
forge install smartcontractkit/chainlink-brownie-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install Chainlink's contracts (Tutorial above).

     forge init oracle-hard --no-git
     cd oracle-hard
     forge install smartcontractkit/chainlink-brownie-contracts
     echo '@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/' >> remappings.txt

2. Set the same solc pin as Easy/Medium.

3. Copy MockERC20.sol, SimplePool.sol, FlashLoanProvider.sol,
   VulnerableLendingPool.sol, and FlashLoanAttacker.sol from Week 31's
   own Hard assignment, unchanged. Create
   ChainlinkGuardedLendingPool.sol and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, both passing.

5. Fill in ORACLE_DESIGN.md from its own starting template.
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code3/oracle-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/ChainlinkGuardedAttack.t.sol:ChainlinkGuardedAttackTest
[PASS] testExploit_UnchangedAttackStillDrainsVulnerablePool() (gas: 1685466)
[PASS] testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle() (gas: 2361226)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.56ms (1.25ms CPU time)

Ran 1 test suite in 9.38ms (2.56ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-41/Assignment/code3/oracle-hard$ forge test --match-test testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/ChainlinkGuardedAttack.t.sol:ChainlinkGuardedAttackTest
[PASS] testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle() (gas: 2361226)
Traces:
  [2440826] ChainlinkGuardedAttackTest::testFix_IdenticalAttackFailsAgainstRealChainlinkShapedOracle()
    ├─ [578290] → new MockV3Aggregator@0xc7183455a4C133Ae270771860664b6B7ec320bB1
    │   └─ ← [Return] 2109 bytes of code
    ├─ [580190] → new ChainlinkGuardedLendingPool@0xa0Cb889707d426A7A386870A03bc70d1b0697598
    │   └─ ← [Return] 2893 bytes of code
    ├─ [28229] MockERC20::mint(ChainlinkGuardedLendingPool: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 2000000000000000000000000 [2e24])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x000000000000000000000000000000000000bEEF)
    │   └─ ← [Return]
    ├─ [852488] → new FlashLoanAttacker@0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d
    │   └─ ← [Return] 4249 bytes of code
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [28229] MockERC20::mint(0x000000000000000000000000000000000000bEEF, 10000000000000000000 [1e19])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x000000000000000000000000000000000000bEEF)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10000000000000000000 [1e19])
    │   └─ ← [Return] true
    ├─ [0] VM::expectRevert(custom error 0xf4844814)
    │   └─ ← [Return]
    ├─ [221207] FlashLoanAttacker::attack(10000000000000000000000 [1e22], 10000000000000000000 [1e19])
    │   ├─ [24583] MockERC20::transferFrom(0x000000000000000000000000000000000000bEEF, FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10000000000000000000 [1e19])
    │   │   └─ ← [Return] true
    │   ├─ [23129] MockERC20::approve(ChainlinkGuardedLendingPool: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 10000000000000000000 [1e19])
    │   │   └─ ← [Return] true
    │   ├─ [48359] ChainlinkGuardedLendingPool::depositCollateral(10000000000000000000 [1e19])
    │   │   ├─ [24583] MockERC20::transferFrom(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], ChainlinkGuardedLendingPool: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 10000000000000000000 [1e19])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   ├─ [118955] FlashLoanProvider::flashLoan(10000000000000000000000 [1e22], FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 0x)
    │   │   ├─ [2824] MockERC20::balanceOf(FlashLoanProvider: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9]) [staticcall]
    │   │   │   └─ ← [Return] 50000000000000000000000 [5e22]
    │   │   ├─ [26580] MockERC20::transfer(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10000000000000000000000 [1e22])
    │   │   │   └─ ← [Return] true
    │   │   ├─ [86430] FlashLoanAttacker::onFlashLoan(10000000000000000000000 [1e22], 0x)
    │   │   │   ├─ [23129] MockERC20::approve(SimplePool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 10000000000000000000000 [1e22])
    │   │   │   │   └─ ← [Return] true
    │   │   │   ├─ [47676] SimplePool::swapBForA(10000000000000000000000 [1e22])
    │   │   │   │   ├─ [7483] MockERC20::transferFrom(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], SimplePool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 10000000000000000000000 [1e22])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   ├─ [26580] MockERC20::transfer(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 909090909090909090909 [9.09e20])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   └─ ← [Return] 909090909090909090909 [9.09e20]
    │   │   │   ├─ [1023] SimplePool::spotPriceBPerA() [staticcall]
    │   │   │   │   └─ ← [Return] 120999999999999999999 [1.209e20]
    │   │   │   ├─ [824] ChainlinkGuardedLendingPool::collateralDeposited(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d]) [staticcall]
    │   │   │   │   └─ ← [Return] 10000000000000000000 [1e19]
    │   │   │   ├─ [7096] ChainlinkGuardedLendingPool::borrow(1209999999999999999990 [1.209e21])
    │   │   │   │   ├─ [1930] MockV3Aggregator::latestRoundData() [staticcall]
    │   │   │   │   │   └─ ← [Return] 1, 100000000 [1e8], 1, 1, 1
    │   │   │   │   └─ ← [Revert] exceeds collateral value
    │   │   │   └─ ← [Revert] exceeds collateral value
    │   │   └─ ← [Revert] exceeds collateral value
    │   └─ ← [Revert] exceeds collateral value
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [2824] MockERC20::balanceOf(0x000000000000000000000000000000000000bEEF) [staticcall]
    │   └─ ← [Return] 0
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.50ms (567.76µs CPU time)

Ran 1 test suite in 14.61ms (1.50ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```