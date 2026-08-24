# For someone cloning.

Simply reinstall the dependencies.

```
cd mev-medium
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init mev-medium --no-git
     cd mev-medium

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Copy MockERC20.sol and create both src/ file and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code2/mev-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/BatchAuction.t.sol:BatchAuctionTest
[PASS] testFix_SubmissionOrderDoesNotAffectTheClearingPrice() (gas: 4551455)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.13ms (700.94µs CPU time)

Ran 1 test suite in 9.71ms (1.13ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-45/Assignment/code2/mev-medium$ forge test --match-test testFix_SubmissionOrderDoesNotAffectTheClearingPrice -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/BatchAuction.t.sol:BatchAuctionTest
[PASS] testFix_SubmissionOrderDoesNotAffectTheClearingPrice() (gas: 4551455)
Traces:
  [4869855] BatchAuctionTest::testFix_SubmissionOrderDoesNotAffectTheClearingPrice()
    ├─ [549486] → new MockERC20@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 2510 bytes of code
    ├─ [549486] → new MockERC20@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 2510 bytes of code
    ├─ [656015] → new BatchAuction@0xF62849F9A0B5Bf2913b396098F7c7019b51A820a
    │   └─ ← [Return] 3273 bytes of code
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000A1, 100000000000000000000 [1e20])
    │   └─ ← [Stop]
    ├─ [23429] MockERC20::mint(0x00000000000000000000000000000000000000B1, 50000000000000000000 [5e19])
    │   └─ ← [Stop]
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000C1, 120000000000000000000 [1.2e20])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000 [1e20])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 50000000000000000000 [5e19])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 120000000000000000000 [1.2e20])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [114794] BatchAuction::submitBuyIntent(100000000000000000000 [1e20])
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000A1, BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 100000000000000000000 [1e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [70994] BatchAuction::submitBuyIntent(50000000000000000000 [5e19])
    │   ├─ [2683] MockERC20::transferFrom(0x00000000000000000000000000000000000000B1, BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 50000000000000000000 [5e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [72950] BatchAuction::submitSellIntent(120000000000000000000 [1.2e20])
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000C1, BatchAuction: [0xF62849F9A0B5Bf2913b396098F7c7019b51A820a], 120000000000000000000 [1.2e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [105144] BatchAuction::settleBatch()
    │   ├─ emit BatchSettled(clearingPriceNumerator: 120000000000000000000 [1.2e20], clearingPriceDenominator: 150000000000000000000 [1.5e20])
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000A1, 80000000000000000000 [8e19])
    │   │   └─ ← [Return] true
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000B1, 40000000000000000000 [4e19])
    │   │   └─ ← [Return] true
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000C1, 150000000000000000000 [1.5e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [824] MockERC20::balanceOf(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 80000000000000000000 [8e19]
    ├─ [549486] → new MockERC20@0x5991A2dF15A8F6A256D3Ec51E99254Cd3fb576A9
    │   └─ ← [Return] 2510 bytes of code
    ├─ [549486] → new MockERC20@0xc7183455a4C133Ae270771860664b6B7ec320bB1
    │   └─ ← [Return] 2510 bytes of code
    ├─ [656015] → new BatchAuction@0xa0Cb889707d426A7A386870A03bc70d1b0697598
    │   └─ ← [Return] 3273 bytes of code
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000A1, 100000000000000000000 [1e20])
    │   └─ ← [Stop]
    ├─ [23429] MockERC20::mint(0x00000000000000000000000000000000000000B1, 50000000000000000000 [5e19])
    │   └─ ← [Stop]
    ├─ [45329] MockERC20::mint(0x00000000000000000000000000000000000000C1, 120000000000000000000 [1.2e20])
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 100000000000000000000 [1e20])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 50000000000000000000 [5e19])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [23129] MockERC20::approve(BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 120000000000000000000 [1.2e20])
    │   └─ ← [Return] true
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000C1)
    │   └─ ← [Return]
    ├─ [94850] BatchAuction::submitSellIntent(120000000000000000000 [1.2e20])
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000C1, BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 120000000000000000000 [1.2e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000B1)
    │   └─ ← [Return]
    ├─ [92894] BatchAuction::submitBuyIntent(50000000000000000000 [5e19])
    │   ├─ [24583] MockERC20::transferFrom(0x00000000000000000000000000000000000000B1, BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 50000000000000000000 [5e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [70994] BatchAuction::submitBuyIntent(100000000000000000000 [1e20])
    │   ├─ [2683] MockERC20::transferFrom(0x00000000000000000000000000000000000000A1, BatchAuction: [0xa0Cb889707d426A7A386870A03bc70d1b0697598], 100000000000000000000 [1e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [105144] BatchAuction::settleBatch()
    │   ├─ emit BatchSettled(clearingPriceNumerator: 120000000000000000000 [1.2e20], clearingPriceDenominator: 150000000000000000000 [1.5e20])
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000C1, 150000000000000000000 [1.5e20])
    │   │   └─ ← [Return] true
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000B1, 40000000000000000000 [4e19])
    │   │   └─ ← [Return] true
    │   ├─ [23780] MockERC20::transfer(0x00000000000000000000000000000000000000A1, 80000000000000000000 [8e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [824] MockERC20::balanceOf(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] 80000000000000000000 [8e19]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.33ms (2.58ms CPU time)

Ran 1 test suite in 80.03ms (3.33ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```