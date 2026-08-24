# For someone cloning.

Simply reinstall the dependencies.

```
cd mev-hard
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin (needed for LiquidityPool's own
   ERC20 base, Week 29's own pattern).

     forge init mev-hard --no-git
     cd mev-hard
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Copy MockERC20.sol and LiquidityPool.sol from Week 34 unchanged.
    
    Also create the one test file from the Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code3/mev-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/JITLiquidity.t.sol:JITLiquidityTest
[PASS] testExploit_JITLiquidityCapturesMostOfTheFeeInstead() (gas: 3217598)
Logs:
  JIT LP deposited (combined): 200000000000000000000000
  JIT LP withdrew (combined): 200003909241793896676129
  With JIT present - honestLP redeemed: 1004950495049504949491 995088597368434015271

[PASS] testFix_BaselineHonestLPCapturesTheFullFee() (gas: 3120472)
Logs:
  Baseline (no JIT) - honestLP redeemed: 1499999999999999998500 667334000667334000000

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 3.84ms (3.43ms CPU time)

Ran 1 test suite in 15.42ms (3.84ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code3/mev-hard$ forge test --match-test testExploit_JITLiquidityCapturesMostOfTheFeeInstead -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/JITLiquidity.t.sol:JITLiquidityTest
[PASS] testExploit_JITLiquidityCapturesMostOfTheFeeInstead() (gas: 3217598)
Logs:
  JIT LP deposited (combined): 200000000000000000000000
  JIT LP withdrew (combined): 200003909241793896676129
  With JIT present - honestLP redeemed: 1004950495049504949491 995088597368434015271

Traces:
  [3456398] JITLiquidityTest::testExploit_JITLiquidityCapturesMostOfTheFeeInstead()
    ├─ [549486] → new MockERC20@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 2510 bytes of code
    ├─ [549486] → new MockERC20@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 2510 bytes of code
    ├─ [1518048] → new LiquidityPool@0xF62849F9A0B5Bf2913b396098F7c7019b51A820a
    │   └─ ← [Return] 7351 bytes of code
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000A1, 1000000000000000000000 [1e21])
    │   └─ ← [Stop]
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000A1, 1000000000000000000000 [1e21])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 1000000000000000000000 [1e21])
    │   └─ ← [Return] true
    ├─ [23129] MockERC20::approve(LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 1000000000000000000000 [1e21])
    │   └─ ← [Return] true
    ├─ [216081] LiquidityPool::addLiquidity(1000000000000000000000 [1e21], 1000000000000000000000 [1e21], 0)
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000A1, LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 1000000000000000000000 [1e21])
    │   │   └─ ← [Return] true
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000A1, LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 1000000000000000000000 [1e21])
    │   │   └─ ← [Return] true
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x000000000000000000000000000000000000dEaD, amount: 1000)
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x00000000000000000000000000000000000000A1, amount: 999999999999999999000 [9.999e20])
    │   ├─ emit Mint(provider: 0x00000000000000000000000000000000000000A1, amount0: 1000000000000000000000 [1e21], amount1: 1000000000000000000000 [1e21], liquidity: 999999999999999999000 [9.999e20])
    │   └─ ← [Return] 999999999999999999000 [9.999e20]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [895] LiquidityPool::balanceOf(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 999999999999999999000 [9.999e20]
    ├─ [391] LiquidityPool::MINIMUM_LIQUIDITY() [staticcall]
    │   └─ ← [Return] 1000
    ├─ [522] LiquidityPool::totalSupply() [staticcall]
    │   └─ ← [Return] 1000000000000000000000 [1e21]
    ├─ [23429] MockERC20::mint(0x00000000000000000000000000000000000000B1, 100000000000000000000000 [1e23])
    │   └─ ← [Stop]
    ├─ [23429] MockERC20::mint(0x00000000000000000000000000000000000000B1, 100000000000000000000000 [1e23])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000000 [1e23])
    │   └─ ← [Return] true
    ├─ [23129] MockERC20::approve(LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000000 [1e23])
    │   └─ ← [Return] true
    ├─ [37474] LiquidityPool::addLiquidity(100000000000000000000000 [1e23], 100000000000000000000000 [1e23], 0)
    │   ├─ [2683] MockERC20::transferFrom(0x00000000000000000000000000000000000000B1, LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000000 [1e23])
    │   │   └─ ← [Return] true
    │   ├─ [2683] MockERC20::transferFrom(0x00000000000000000000000000000000000000B1, LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000000 [1e23])
    │   │   └─ ← [Return] true
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x00000000000000000000000000000000000000B1, amount: 100000000000000000000000 [1e23])
    │   ├─ emit Mint(provider: 0x00000000000000000000000000000000000000B1, amount0: 100000000000000000000000 [1e23], amount1: 100000000000000000000000 [1e23], liquidity: 100000000000000000000000 [1e23])
    │   └─ ← [Return] 100000000000000000000000 [1e23]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [23429] MockERC20::mint(0x00000000000000000000000000000000000000C1, 500000000000000000000 [5e20])
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 500000000000000000000 [5e20])
    │   └─ ← [Return] true
    ├─ [31674] LiquidityPool::swap(500000000000000000000 [5e20], 0, 0, 1)
    │   ├─ [2683] MockERC20::transferFrom(0x00000000000000000000000000000000000000C1, LiquidityPool: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 500000000000000000000 [5e20])
    │   │   └─ ← [Return] true
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000C1, 496051665788164357108 [4.96e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Return] 496051665788164357108 [4.96e20]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [53490] LiquidityPool::removeLiquidity(100000000000000000000000 [1e23], 0, 0)
    │   ├─ emit Transfer(from: 0x00000000000000000000000000000000000000B1, to: 0x0000000000000000000000000000000000000000, amount: 100000000000000000000000 [1e23])
    │   ├─ [21780] MockERC20::transfer(0x00000000000000000000000000000000000000B1, 100495049504950495049504 [1.004e23])
    │   │   └─ ← [Return] true
    │   ├─ [21780] MockERC20::transfer(0x00000000000000000000000000000000000000B1, 99508859736843401626625 [9.95e22])
    │   │   └─ ← [Return] true
    │   ├─ emit Burn(provider: 0x00000000000000000000000000000000000000B1, amount0: 100495049504950495049504 [1.004e23], amount1: 99508859736843401626625 [9.95e22], liquidity: 100000000000000000000000 [1e23])
    │   └─ ← [Return] 100495049504950495049504 [1.004e23], 99508859736843401626625 [9.95e22]
    ├─ [0] console::log("JIT LP deposited (combined):", 200000000000000000000000 [2e23]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("JIT LP withdrew (combined):", 200003909241793896676129 [2e23]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [895] LiquidityPool::balanceOf(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 999999999999999999000 [9.999e20]
    ├─ [53490] LiquidityPool::removeLiquidity(999999999999999999000 [9.999e20], 0, 0)
    │   ├─ emit Transfer(from: 0x00000000000000000000000000000000000000A1, to: 0x0000000000000000000000000000000000000000, amount: 999999999999999999000 [9.999e20])
    │   ├─ [21780] MockERC20::transfer(0x00000000000000000000000000000000000000A1, 1004950495049504949491 [1.004e21])
    │   │   └─ ← [Return] true
    │   ├─ [21780] MockERC20::transfer(0x00000000000000000000000000000000000000A1, 995088597368434015271 [9.95e20])
    │   │   └─ ← [Return] true
    │   ├─ emit Burn(provider: 0x00000000000000000000000000000000000000A1, amount0: 1004950495049504949491 [1.004e21], amount1: 995088597368434015271 [9.95e20], liquidity: 999999999999999999000 [9.999e20])
    │   └─ ← [Return] 1004950495049504949491 [1.004e21], 995088597368434015271 [9.95e20]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [0] console::log("With JIT present - honestLP redeemed:", 1004950495049504949491 [1.004e21], 995088597368434015271 [9.95e20]) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.55ms (1.56ms CPU time)

Ran 1 test suite in 11.99ms (2.55ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```