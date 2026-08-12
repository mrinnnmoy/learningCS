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

     forge init centralized-medium --no-git
     cd centralized-medium
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all three src/ files and both test files from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 5 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code2/centralized-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/Blacklist.t.sol:BlacklistTest
[PASS] testExploit_BlacklistedSenderCannotTransferEvenToAnHonestRecipient() (gas: 41770)
[PASS] testFix_OrdinaryTransferSucceedsWhenNeitherPartyIsBlacklisted() (gas: 50179)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.03ms (340.35µs CPU time)

Ran 3 tests for test/RateLimiting.t.sol:RateLimitingTest
[PASS] testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit() (gas: 104443)
[PASS] testFix_LimitResetsInANewWindow() (gas: 104487)
[PASS] testFix_WithdrawalBeyondDailyLimitReverts() (gas: 76298)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 1.32ms (318.96µs CPU time)

Ran 2 test suites in 13.28ms (2.35ms CPU time): 5 tests passed, 0 failed, 0 skipped (5 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-39/Assignment/code2/centralized-medium$ forge test --match-test testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/RateLimiting.t.sol:RateLimitingTest
[PASS] testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit() (gas: 104443)
Traces:
  [124343] RateLimitingTest::testFix_BoundaryStraddlingEdgeCaseMovesNearlyDoubleTheLimit()
    ├─ [0] VM::startPrank(0x000000000000000000000000000000000000cafE)
    │   └─ ← [Return]
    ├─ [62818] RateLimitedVault::withdraw(100000000000000000000 [1e20])
    │   ├─ [28556] MockERC20::transfer(0x000000000000000000000000000000000000cafE, 100000000000000000000 [1e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::warp(86402 [8.64e4])
    │   └─ ← [Return]
    ├─ [45118] RateLimitedVault::withdraw(100000000000000000000 [1e20])
    │   ├─ [1856] MockERC20::transfer(0x000000000000000000000000000000000000cafE, 100000000000000000000 [1e20])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [823] MockERC20::balanceOf(0x000000000000000000000000000000000000cafE) [staticcall]
    │   └─ ← [Return] 200000000000000000000 [2e20]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 595.06µs (122.25µs CPU time)

Ran 1 test suite in 21.93ms (595.06µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```