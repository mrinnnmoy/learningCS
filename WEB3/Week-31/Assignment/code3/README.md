# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, same pattern as Easy/Medium.

     forge init security-hard --no-git
     cd security-hard

2. Set the same solc pin as every previous week.

3. Create all seven src/ files and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, both passing — one confirming the attack
   succeeds against VulnerableLendingPool, one confirming the identical
   attack fails to profit against GuardedLendingPool.

5. Run Slither against the whole project (Tutorial above):

     slither .

   Read through the findings. MockERC20's own open mint() is expected
   to be flagged — it's a deliberately insecure test fixture, not a
   real contract, note that explicitly rather than "fixing" it (doing
   so would break every test that relies on minting fresh tokens).
   VulnerableLendingPool and VulnerableAuction-style patterns from
   Easy, if scanned too, are EXPECTED findings this week, not bugs to
   silently patch — the whole point is having built them on purpose.

6. Fill in SECURITY_CHECKLIST.md (Solution below is a starting
   template — actually answer each line against these specific
   contracts, don't leave it as a generic list).
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-31/Assignment/code3/security-hard$ forge test -vv
[⠒] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/FlashLoanOracleAttack.t.sol:FlashLoanOracleAttackTest
[PASS] testExploit_FlashLoanOracleManipulationDrainsVulnerablePool() (gas: 1685444)
[PASS] testFix_IdenticalAttackRevertsEntirelyAgainstGuardedPool() (gas: 1851217)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 3.60ms (2.27ms CPU time)

Ran 1 test suite in 140.90ms (3.60ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-31/Assignment/code3/security-hard$ forge test --match-test testExploit -vvvv
[⠒] Compiling...
No files changed, compilation skipped

Ran 1 test for test/FlashLoanOracleAttack.t.sol:FlashLoanOracleAttackTest
[PASS] testExploit_FlashLoanOracleManipulationDrainsVulnerablePool() (gas: 1685444)
Traces:
  [1847444] FlashLoanOracleAttackTest::testExploit_FlashLoanOracleManipulationDrainsVulnerablePool()
    ├─ [504514] → new VulnerableLendingPool@0xc7183455a4C133Ae270771860664b6B7ec320bB1
    │   └─ ← [Return] 2515 bytes of code
    ├─ [28229] MockERC20::mint(VulnerableLendingPool: [0xc7183455a4C133Ae270771860664b6B7ec320bB1], 2000000000000000000000000 [2e24])
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
    ├─ [266333] FlashLoanAttacker::attack(10000000000000000000 [1e19], 10000000000000000000 [1e19])
    │   ├─ [24583] MockERC20::transferFrom(0x000000000000000000000000000000000000bEEF, FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10000000000000000000 [1e19])
    │   │   └─ ← [Return] true
    │   ├─ [23129] MockERC20::approve(VulnerableLendingPool: [0xc7183455a4C133Ae270771860664b6B7ec320bB1], 10000000000000000000 [1e19])
    │   │   └─ ← [Return] true
    │   ├─ [48381] VulnerableLendingPool::depositCollateral(10000000000000000000 [1e19])
    │   │   ├─ [24583] MockERC20::transferFrom(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], VulnerableLendingPool: [0xc7183455a4C133Ae270771860664b6B7ec320bB1], 10000000000000000000 [1e19])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   ├─ [164062] FlashLoanProvider::flashLoan(10000000000000000000 [1e19], FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 0x)
    │   │   ├─ [2824] MockERC20::balanceOf(FlashLoanProvider: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9]) [staticcall]
    │   │   │   └─ ← [Return] 50000000000000000000000 [5e22]
    │   │   ├─ [26580] MockERC20::transfer(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10000000000000000000 [1e19])
    │   │   │   └─ ← [Return] true
    │   │   ├─ [130001] FlashLoanAttacker::onFlashLoan(10000000000000000000 [1e19], 0x)
    │   │   │   ├─ [23129] MockERC20::approve(SimplePool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 10000000000000000000 [1e19])
    │   │   │   │   └─ ← [Return] true
    │   │   │   ├─ [47676] SimplePool::swapBForA(10000000000000000000 [1e19])
    │   │   │   │   ├─ [7483] MockERC20::transferFrom(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], SimplePool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 10000000000000000000 [1e19])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   ├─ [26580] MockERC20::transfer(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 9900990099009900990 [9.9e18])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   └─ ← [Return] 9900990099009900990 [9.9e18]
    │   │   │   ├─ [1023] SimplePool::spotPriceBPerA() [staticcall]
    │   │   │   │   └─ ← [Return] 1020099999999999999 [1.02e18]
    │   │   │   ├─ [824] VulnerableLendingPool::collateralDeposited(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d]) [staticcall]
    │   │   │   │   └─ ← [Return] 10000000000000000000 [1e19]
    │   │   │   ├─ [47987] VulnerableLendingPool::borrow(10200999999999999990 [1.02e19])
    │   │   │   │   ├─ [1023] SimplePool::spotPriceBPerA() [staticcall]
    │   │   │   │   │   └─ ← [Return] 1020099999999999999 [1.02e18]
    │   │   │   │   ├─ [21780] MockERC20::transfer(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d], 10200999999999999990 [1.02e19])
    │   │   │   │   │   └─ ← [Return] true
    │   │   │   │   └─ ← [Stop]
    │   │   │   ├─ [1880] MockERC20::transfer(FlashLoanProvider: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9], 10000000000000000000 [1e19])
    │   │   │   │   └─ ← [Return] true
    │   │   │   └─ ← [Stop]
    │   │   ├─ [824] MockERC20::balanceOf(FlashLoanProvider: [0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9]) [staticcall]
    │   │   │   └─ ← [Return] 50000000000000000000000 [5e22]
    │   │   └─ ← [Stop]
    │   └─ ← [Stop]
    ├─ [50418] FlashLoanAttacker::collect()
    │   ├─ [824] MockERC20::balanceOf(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d]) [staticcall]
    │   │   └─ ← [Return] 9900990099009900990 [9.9e18]
    │   ├─ [21780] MockERC20::transfer(0x000000000000000000000000000000000000bEEF, 9900990099009900990 [9.9e18])
    │   │   └─ ← [Return] true
    │   ├─ [824] MockERC20::balanceOf(FlashLoanAttacker: [0x29ced945BB6A5acc52d2A29C7c7e8E5f84Cf299d]) [staticcall]
    │   │   └─ ← [Return] 200999999999999990 [2.009e17]
    │   ├─ [23780] MockERC20::transfer(0x000000000000000000000000000000000000bEEF, 200999999999999990 [2.009e17])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [824] MockERC20::balanceOf(0x000000000000000000000000000000000000bEEF) [staticcall]
    │   └─ ← [Return] 200999999999999990 [2.009e17]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 5.41ms (2.74ms CPU time)

Ran 1 test suite in 32.04ms (5.41ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-31/Assignment/code3/security-hard$ slither .
'forge clean' running (wd: /home/mrinnnmoy/projects/learningCS/WEB3/Week-31/Assignment/code3/security-hard)
'forge config --json' running
'forge build --build-info --deny never --skip ./test/** ./script/** --force' running (wd: /home/mrinnnmoy/projects/learningCS/WEB3/Week-31/Assignment/code3/security-hard)
INFO:Detectors:
Detector: unchecked-transfer
FlashLoanAttacker.attack(uint256,uint256) (src/FlashLoanAttacker.sol#39-47) ignores return value by tokenA.transferFrom(msg.sender,address(this),collateralAmount) (src/FlashLoanAttacker.sol#41)
FlashLoanAttacker.onFlashLoan(uint256,bytes) (src/FlashLoanAttacker.sol#49-65) ignores return value by tokenB.transfer(address(provider),amount) (src/FlashLoanAttacker.sol#64)
FlashLoanAttacker.collect() (src/FlashLoanAttacker.sol#67-70) ignores return value by tokenA.transfer(owner,tokenA.balanceOf(address(this))) (src/FlashLoanAttacker.sol#68)
FlashLoanAttacker.collect() (src/FlashLoanAttacker.sol#67-70) ignores return value by tokenB.transfer(owner,tokenB.balanceOf(address(this))) (src/FlashLoanAttacker.sol#69)
FlashLoanProvider.flashLoan(uint256,address,bytes) (src/FlashLoanProvider.sol#19-26) ignores return value by token.transfer(borrower,amount) (src/FlashLoanProvider.sol#21)
GuardedLendingPool.depositCollateral(uint256) (src/GuardedLendingPool.sol#21-24) ignores return value by collateralToken.transferFrom(msg.sender,address(this),amount) (src/GuardedLendingPool.sol#22)
GuardedLendingPool.borrow(uint256) (src/GuardedLendingPool.sol#26-32) ignores return value by borrowToken.transfer(msg.sender,amount) (src/GuardedLendingPool.sol#31)
SimplePool.addLiquidity(uint256,uint256) (src/SimplePool.sol#19-24) ignores return value by tokenA.transferFrom(msg.sender,address(this),amountA) (src/SimplePool.sol#20)
SimplePool.addLiquidity(uint256,uint256) (src/SimplePool.sol#19-24) ignores return value by tokenB.transferFrom(msg.sender,address(this),amountB) (src/SimplePool.sol#21)
SimplePool.swapAForB(uint256) (src/SimplePool.sol#26-32) ignores return value by tokenA.transferFrom(msg.sender,address(this),amountAIn) (src/SimplePool.sol#27)
SimplePool.swapAForB(uint256) (src/SimplePool.sol#26-32) ignores return value by tokenB.transfer(msg.sender,amountBOut) (src/SimplePool.sol#31)
SimplePool.swapBForA(uint256) (src/SimplePool.sol#34-40) ignores return value by tokenB.transferFrom(msg.sender,address(this),amountBIn) (src/SimplePool.sol#35)
SimplePool.swapBForA(uint256) (src/SimplePool.sol#34-40) ignores return value by tokenA.transfer(msg.sender,amountAOut) (src/SimplePool.sol#39)
VulnerableLendingPool.depositCollateral(uint256) (src/VulnerableLendingPool.sol#22-25) ignores return value by collateralToken.transferFrom(msg.sender,address(this),amount) (src/VulnerableLendingPool.sol#23)
VulnerableLendingPool.borrow(uint256) (src/VulnerableLendingPool.sol#27-32) ignores return value by borrowToken.transfer(msg.sender,amount) (src/VulnerableLendingPool.sol#31)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unchecked-transfer
INFO:Detectors:
Detector: unused-return
FlashLoanAttacker.attack(uint256,uint256) (src/FlashLoanAttacker.sol#39-47) ignores return value by tokenA.approve(address(lendingPool),collateralAmount) (src/FlashLoanAttacker.sol#42)
FlashLoanAttacker.onFlashLoan(uint256,bytes) (src/FlashLoanAttacker.sol#49-65) ignores return value by tokenB.approve(address(pool),amount) (src/FlashLoanAttacker.sol#52)
FlashLoanAttacker.onFlashLoan(uint256,bytes) (src/FlashLoanAttacker.sol#49-65) ignores return value by pool.swapBForA(amount) (src/FlashLoanAttacker.sol#53)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#unused-return
INFO:Detectors:
Detector: missing-zero-check
TrustedOracle.constructor(address,uint256)._owner (src/TrustedOracle.sol#13) lacks a zero-check on :
                - owner = _owner (src/TrustedOracle.sol#14)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-zero-address-validation
INFO:Detectors:
Detector: reentrancy-benign
Reentrancy in SimplePool.addLiquidity(uint256,uint256) (src/SimplePool.sol#19-24):
        External calls:
        - tokenA.transferFrom(msg.sender,address(this),amountA) (src/SimplePool.sol#20)
        - tokenB.transferFrom(msg.sender,address(this),amountB) (src/SimplePool.sol#21)
        State variables written after the call(s):
        - reserveA += amountA (src/SimplePool.sol#22)
        - reserveB += amountB (src/SimplePool.sol#23)
Reentrancy in GuardedLendingPool.depositCollateral(uint256) (src/GuardedLendingPool.sol#21-24):
        External calls:
        - collateralToken.transferFrom(msg.sender,address(this),amount) (src/GuardedLendingPool.sol#22)
        State variables written after the call(s):
        - collateralDeposited[msg.sender] += amount (src/GuardedLendingPool.sol#23)
Reentrancy in VulnerableLendingPool.depositCollateral(uint256) (src/VulnerableLendingPool.sol#22-25):
        External calls:
        - collateralToken.transferFrom(msg.sender,address(this),amount) (src/VulnerableLendingPool.sol#23)
        State variables written after the call(s):
        - collateralDeposited[msg.sender] += amount (src/VulnerableLendingPool.sol#24)
Reentrancy in SimplePool.swapAForB(uint256) (src/SimplePool.sol#26-32):
        External calls:
        - tokenA.transferFrom(msg.sender,address(this),amountAIn) (src/SimplePool.sol#27)
        State variables written after the call(s):
        - reserveA += amountAIn (src/SimplePool.sol#29)
        - reserveB -= amountBOut (src/SimplePool.sol#30)
Reentrancy in SimplePool.swapBForA(uint256) (src/SimplePool.sol#34-40):
        External calls:
        - tokenB.transferFrom(msg.sender,address(this),amountBIn) (src/SimplePool.sol#35)
        State variables written after the call(s):
        - reserveA -= amountAOut (src/SimplePool.sol#38)
        - reserveB += amountBIn (src/SimplePool.sol#37)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#reentrancy-vulnerabilities-3
INFO:Slither:. analyzed (9 contracts with 102 detectors), 24 result(s) found
```