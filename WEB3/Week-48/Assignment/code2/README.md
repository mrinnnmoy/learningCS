# For someone cloning.

Simply reinstall the dependencies.

```
cd restaking-medium
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin (Week 29's own pattern).

     forge init restaking-medium --no-git
     cd restaking-medium
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create src/LiquidRestakingToken.sol and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code2/restaking-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/LiquidRestakingToken.t.sol:LiquidRestakingTokenTest
[PASS] testFix_SharesMintedProportionallyAtTheCurrentRate() (gas: 123218)
[PASS] testFix_SlashDropsTheExchangeRateForEveryHolderProportionally() (gas: 135687)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.69ms (571.57µs CPU time)

Ran 1 test suite in 76.16ms (1.69ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-48/Assignment/code2/restaking-medium$ forge test --match-test testFix_SlashDropsTheExchangeRateForEveryHolderProportionally -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/LiquidRestakingToken.t.sol:LiquidRestakingTokenTest
[PASS] testFix_SlashDropsTheExchangeRateForEveryHolderProportionally() (gas: 135687)
Traces:
  [135687] LiquidRestakingTokenTest::testFix_SlashDropsTheExchangeRateForEveryHolderProportionally()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [69471] LiquidRestakingToken::deposit{value: 100000000000000000000}()
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x00000000000000000000000000000000000000A1, amount: 100000000000000000000 [1e20])
    │   └─ ← [Return] 100000000000000000000 [1e20]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [26321] LiquidRestakingToken::deposit{value: 100000000000000000000}()
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x00000000000000000000000000000000000000B1, amount: 100000000000000000000 [1e20])
    │   └─ ← [Return] 100000000000000000000 [1e20]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [3376] LiquidRestakingToken::slash(0xd2b15cc2d5fbf3843d501a01776af848b636a440e5870e9739ef1046d43e8205, 40000000000000000000 [4e19])
    │   └─ ← [Stop]
    ├─ [500] LiquidRestakingToken::totalSupply() [staticcall]
    │   └─ ← [Return] 200000000000000000000 [2e20]
    ├─ [470] LiquidRestakingToken::totalRestaked() [staticcall]
    │   └─ ← [Return] 160000000000000000000 [1.6e20]
    ├─ [500] LiquidRestakingToken::totalSupply() [staticcall]
    │   └─ ← [Return] 200000000000000000000 [2e20]
    ├─ [470] LiquidRestakingToken::totalRestaked() [staticcall]
    │   └─ ← [Return] 160000000000000000000 [1.6e20]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 934.46µs (213.25µs CPU time)

Ran 1 test suite in 10.43ms (934.46µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```