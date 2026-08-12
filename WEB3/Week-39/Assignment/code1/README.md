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

     forge init centralized-easy --no-git
     cd centralized-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all three src/ files and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code1/centralized-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/CircuitBreaker.t.sol:CircuitBreakerTest
[PASS] testExploit_BadVaultTrapsUserFundsWhilePaused() (gas: 819290)
[PASS] testFix_GoodVaultEmergencyWithdrawWorksWhilePaused() (gas: 781025)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.57ms (685.98µs CPU time)

Ran 1 test suite in 12.90ms (1.57ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code1/centralized-easy$ forge test --match-test testFix_GoodVaultEmergencyWithdrawWorksWhilePaused -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/CircuitBreaker.t.sol:CircuitBreakerTest
[PASS] testFix_GoodVaultEmergencyWithdrawWorksWhilePaused() (gas: 781025)
Traces:
  [823625] CircuitBreakerTest::testFix_GoodVaultEmergencyWithdrawWorksWhilePaused()
    ├─ [689880] → new GoodVault@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: CircuitBreakerTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   └─ ← [Return] 3323 bytes of code
    ├─ [23139] GoodVault::setWhitelisted(0x000000000000000000000000000000000000cafE, true)
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x000000000000000000000000000000000000cafE)
    │   └─ ← [Return]
    ├─ [55554] GoodVault::deposit(50000000000000000000 [5e19])
    │   ├─ [28775] MockERC20::transferFrom(0x000000000000000000000000000000000000cafE, GoodVault: [0x2e234DAe75C793f67A35089C9d99245E1C58470b], 50000000000000000000 [5e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [803] GoodVault::balances(0x000000000000000000000000000000000000cafE) [staticcall]
    │   └─ ← [Return] 50000000000000000000 [5e19]
    ├─ [2364] GoodVault::pause()
    │   ├─ emit Paused(account: CircuitBreakerTest: [0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x000000000000000000000000000000000000cafE)
    │   └─ ← [Return]
    ├─ [3295] GoodVault::emergencyWithdraw()
    │   ├─ [1858] MockERC20::transfer(0x000000000000000000000000000000000000cafE, 50000000000000000000 [5e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [802] MockERC20::balanceOf(0x000000000000000000000000000000000000cafE) [staticcall]
    │   └─ ← [Return] 100000000000000000000 [1e20]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 864.39µs (262.50µs CPU time)

Ran 1 test suite in 9.20ms (864.39µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```