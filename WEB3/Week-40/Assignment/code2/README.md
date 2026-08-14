# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init data-model-medium --no-git
     cd data-model-medium

2. Set the solc pin as `solc = "0/8.36"`.

3. Create src/Marketplace.sol and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv --gas-report
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code2/data-model-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/Pagination.t.sol:PaginationTest
[PASS] testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage() (gas: 111873)
[PASS] testFix_PaginatedReadCostsFarLessThanUnboundedRead() (gas: 2056611)
Logs:
  getAllListings() gas, 200 listings: 1962106
  getListings(0, 20) gas: 89300

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 8.00ms (3.67ms CPU time)

Ran 1 test suite in 79.62ms (8.00ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code2/data-model-medium$ forge test -vv --gas-report
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/Pagination.t.sol:PaginationTest
[PASS] testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage() (gas: 111873)
[PASS] testFix_PaginatedReadCostsFarLessThanUnboundedRead() (gas: 2185611)
Logs:
  getAllListings() gas, 200 listings: 1962106
  getListings(0, 20) gas: 215800

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 17.40ms (5.60ms CPU time)

╭------------------------------------------+-----------------+---------+---------+---------+---------╮
| src/Marketplace.sol:Marketplace Contract |                 |         |         |         |         |
+====================================================================================================+
| Deployment Cost                          | Deployment Size |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
|                                   918370 |            4035 |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
|                                          |                 |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| Function Name                            | Min             | Avg     | Median  | Max     | # Calls |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| createListing                            |           98107 |   98192 |   98107 |  115207 |     400 |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| getAllListings                           |         1633908 | 1633908 | 1633908 | 1633908 |       1 |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| getListings                              |           89884 |  132998 |  132998 |  176113 |       2 |
╰------------------------------------------+-----------------+---------+---------+---------+---------╯


Ran 1 test suite in 21.24ms (17.40ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code2/data-model-medium$ forge test --match-test testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/Pagination.t.sol:PaginationTest
[PASS] testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage() (gas: 111873)
Traces:
  [111873] PaginationTest::testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage()
    ├─ [89884] Marketplace::getListings(190, 20) [staticcall]
    │   └─ ← [Return] [Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000[1e18], title: "Listing" }), Listing({ seller: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496, price: 1000000000000000000 [1e18], title: "Listing" })]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 6.31ms (413.14µs CPU time)

Ran 1 test suite in 78.44ms (6.31ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
