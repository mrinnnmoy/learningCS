# For someone cloning.

Simply reinstall the dependencies.

```
cd gas-medium
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init gas-medium --no-git
     cd gas-medium

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and both test files from the Solution
   below.

4. Build, run and record a real gas snapshot.

     forge build
     forge test -vv
     forge snapshot

   Inspect the resulting .gas-snapshot file directly — a real, plain
   text record of every test's own exact gas cost.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code2/gas-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/CalldataVsMemory.t.sol:CalldataVsMemoryTest
[PASS] testFix_CalldataCostsLessThanMemoryForReadOnlyArrays() (gas: 405372)
Logs:
  sumMemory gas (100 elements): 314893
  sumCalldata gas (100 elements): 85476

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.28ms (978.74µs CPU time)

Ran 2 tests for test/YulBasics.t.sol:YulBasicsTest
[PASS] testFix_EfficientHashMatchesAbiEncodePacked() (gas: 7245)
[PASS] testFix_YulAndSolidityIncrementCostNearlyIdenticalGas() (gas: 62951)
Logs:
  incrementYul gas: 27329
  incrementSolidity gas: 27406

Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 2.55ms (1.25ms CPU time)

Ran 2 test suites in 17.21ms (4.83ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code2/gas-medium$ forge snapshot
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/YulBasics.t.sol:YulBasicsTest
[PASS] testFix_EfficientHashMatchesAbiEncodePacked() (gas: 7245)
[PASS] testFix_YulAndSolidityIncrementCostNearlyIdenticalGas() (gas: 62951)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 784.50µs (284.32µs CPU time)

Ran 1 test for test/CalldataVsMemory.t.sol:CalldataVsMemoryTest
[PASS] testFix_CalldataCostsLessThanMemoryForReadOnlyArrays() (gas: 405372)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.32ms (627.57µs CPU time)

Ran 2 test suites in 10.06ms (2.11ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code2/gas-medium$ forge test --match-test testFix_YulAndSolidityIncrementCostNearlyIdenticalGas -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/YulBasics.t.sol:YulBasicsTest
[PASS] testFix_YulAndSolidityIncrementCostNearlyIdenticalGas() (gas: 62951)
Logs:
  incrementYul gas: 27329
  incrementSolidity gas: 27406

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 882.01µs (283.12µs CPU time)

Ran 1 test suite in 11.67ms (882.01µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code2/gas-medium$ forge test --match-test testFix_CalldataCostsLessThanMemoryForReadOnlyArrays -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/CalldataVsMemory.t.sol:CalldataVsMemoryTest
[PASS] testFix_CalldataCostsLessThanMemoryForReadOnlyArrays() (gas: 405372)
Logs:
  sumMemory gas (100 elements): 314893
  sumCalldata gas (100 elements): 85476

Traces:
  [405372] CalldataVsMemoryTest::testFix_CalldataCostsLessThanMemoryForReadOnlyArrays()
    ├─ [53784] CalldataVsMemory::sumMemory([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]) [staticcall]
    │   └─ ← [Return] 4950
    ├─ [31198] CalldataVsMemory::sumCalldata([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]) [staticcall]
    │   └─ ← [Return] 4950
    ├─ [0] console::log("sumMemory gas (100 elements):", 314893 [3.148e5]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("sumCalldata gas (100 elements):", 85476 [8.547e4]) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.15ms (995.24µs CPU time)

Ran 1 test suite in 11.80ms (2.15ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
