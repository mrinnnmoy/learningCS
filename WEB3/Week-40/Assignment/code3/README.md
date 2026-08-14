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

     forge init data-model-hard --no-git
     cd data-model-hard

2. Set the solc pin as `solc = "0.8.36".

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, all passing.

5. Fill in DATA_MODEL_DESIGN.md from its own starting template —
   write real, specific reasoning about THIS design, not a generic
   restatement of Concept 3's own README table.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code3/data-model-hard$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/SchemaVersioning.t.sol:SchemaVersioningTest
[PASS] testFix_SetBioLazilyMigratesOnlyTheCallingUser() (gas: 155920)
[PASS] testFix_V2CorrectlyReadsNeverMigratedV1DataViaFallback() (gas: 34846)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.18ms (492.36µs CPU time)

Ran 1 test suite in 8.47ms (1.18ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-40/Assignment/code3/data-model-hard$ forge test --match-test testFix_SetBioLazilyMigratesOnlyTheCallingUser -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/SchemaVersioning.t.sol:SchemaVersioningTest
[PASS] testFix_SetBioLazilyMigratesOnlyTheCallingUser() (gas: 155920)
Traces:
  [155920] SchemaVersioningTest::testFix_SetBioLazilyMigratesOnlyTheCallingUser()
    ├─ [0] VM::prank(0x00000000000000000000000000000000000000A1)
    │   └─ ← [Return]
    ├─ [100744] UserRegistryV2::setBio("Solidity enjoyer")
    │   ├─ [5899] UserRegistryV1::usersV1(0x00000000000000000000000000000000000000A1) [staticcall]
    │   │   └─ ← [Return] "Alice", 1
    │   └─ ← [Stop]
    ├─ [3397] UserRegistryV2::getUser(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] "Alice", 1, "Solidity enjoyer"
    ├─ [0] VM::assertEq("Alice", "Alice") [staticcall]
    │   └─ ← [Return]
    ├─ [0] VM::assertEq("Solidity enjoyer", "Solidity enjoyer") [staticcall]
    │   └─ ← [Return]
    ├─ [3255] UserRegistryV2::usersV2(0x00000000000000000000000000000000000000A1) [staticcall]
    │   └─ ← [Return] "Alice", 1, 2, "Solidity enjoyer"
    ├─ [18375] UserRegistryV2::getUser(0x00000000000000000000000000000000000000B1) [staticcall]
    │   ├─ [5899] UserRegistryV1::usersV1(0x00000000000000000000000000000000000000B1) [staticcall]
    │   │   └─ ← [Return] "Bob", 1
    │   └─ ← [Return] "Bob", 1, ""
    ├─ [0] VM::assertEq("Bob", "Bob") [staticcall]
    │   └─ ← [Return]
    ├─ [0] VM::assertEq("", "") [staticcall]
    │   └─ ← [Return]
    ├─ [2897] UserRegistryV2::usersV2(0x00000000000000000000000000000000000000B1) [staticcall]
    │   └─ ← [Return] "", 0, 0, ""
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 931.54µs (257.11µs CPU time)

Ran 1 test suite in 8.46ms (931.54µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```