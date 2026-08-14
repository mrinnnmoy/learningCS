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

     forge init data-model-easy --no-git
     cd data-model-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all four src/ files and the one test file from the
   Solution below.

4. Build, run, and check the gas report specifically.

     forge build
     forge test -vv

   You should see 2 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code1/data-model-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/StorageCosts.t.sol:StorageCostsTest
[PASS] testFix_DenormalizedReadCostsLessThanNormalized() (gas: 1213877)
Logs:
  Normalized getUserSummary gas: 2926
  Denormalized getUserSummary gas: 2829

[PASS] testFix_PackedWriteCostsLessGasThanUnpacked() (gas: 542945)
Logs:
  Unpacked create() gas: 90530
  Packed create() gas: 47031

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.17ms (753.82µs CPU time)

Ran 1 test suite in 72.81ms (1.17ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code1/data-model-easy$ forge test --match-test testFix_DenormalizedReadCostsLessThanNormalized -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/StorageCosts.t.sol:StorageCostsTest
[PASS] testFix_DenormalizedReadCostsLessThanNormalized() (gas: 1213877)
Logs:
  Normalized getUserSummary gas: 2926
  Denormalized getUserSummary gas: 2829

Traces:
  [1213877] StorageCostsTest::testFix_DenormalizedReadCostsLessThanNormalized()
    ├─ [499128] → new NormalizedRegistry@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 2493 bytes of code
    ├─ [471903] → new DenormalizedRegistry@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 2357 bytes of code
    ├─ [0] VM::deal(0x00000000000000000000000000000000000000A1, 2000000000000000000 [2e18])
    │   └─ ← [Return]
    ├─ [0] VM::startPrank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [45718] NormalizedRegistry::register("Alice")
    │   └─ ← [Stop]
    ├─ [22565] NormalizedRegistry::deposit{value: 1000000000000000000}()
    │   └─ ← [Stop]
    ├─ [45522] DenormalizedRegistry::register("Alice")
    │   └─ ← [Stop]
    ├─ [22543] DenormalizedRegistry::deposit{value: 1000000000000000000}()
    │   └─ ← [Stop]
    ├─ [0] VM::stopPrank()
    │   └─ ← [Return]
    ├─ [2032] NormalizedRegistry::getUserSummary(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] "Alice", 1000000000000000000 [1e18]
    ├─ [1935] DenormalizedRegistry::getUserSummary(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] "Alice", 1000000000000000000 [1e18]
    ├─ [2032] NormalizedRegistry::getUserSummary(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return] "Alice", 1000000000000000000 [1e18]
    ├─ [1935] DenormalizedRegistry::getUserSummary(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return] "Alice", 1000000000000000000 [1e18]
    ├─ [0] VM::assertEq("Alice", "Alice") [staticcall]
    │   └─ ← [Return]
    ├─ [0] VM::assertEq("Alice", "Alice") [staticcall]
    │   └─ ← [Return]
    ├─ [0] console::log("Normalized getUserSummary gas:", 2926) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("Denormalized getUserSummary gas:", 2829) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 927.73µs (433.82µs CPU time)

Ran 1 test suite in 10.05ms (927.73µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code1/data-model-easy$ forge test --match-test testFix_PackedWriteCostsLessGasThanUnpacked -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/StorageCosts.t.sol:StorageCostsTest
[PASS] testFix_PackedWriteCostsLessGasThanUnpacked() (gas: 542945)
Logs:
  Unpacked create() gas: 90530
  Packed create() gas: 47031

Traces:
  [542945] StorageCostsTest::testFix_PackedWriteCostsLessGasThanUnpacked()
    ├─ [129975] → new UnpackedStorage@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 649 bytes of code
    ├─ [205849] → new PackedStorage@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 1028 bytes of code
    ├─ [89465] UnpackedStorage::create(1, 100, 5000000000000000000 [5e18])
    │   └─ ← [Stop]
    ├─ [45954] PackedStorage::create(1, 100, 5000000000000000000 [5e18])
    │   └─ ← [Stop]
    ├─ [0] console::log("Unpacked create() gas:", 90530 [9.053e4]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("Packed create() gas:", 47031 [4.703e4]) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 726.88µs (246.86µs CPU time)

Ran 1 test suite in 8.54ms (726.88µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```