# For someone cloning.

Simply reinstall the dependencies.

```
cd gas-easy
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init gas-easy --no-git
     cd gas-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all three src/ files and both test files from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv --gas-report
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code1/gas-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/ErrorGas.t.sol:ErrorGasTest
[PASS] testFix_CustomErrorsCostLessThanRequireStrings() (gas: 329486)
Logs:
  RequireStringDemo deployment gas: 198744
  CustomErrorDemo deployment gas: 119726

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.99ms (1.18ms CPU time)

Ran 1 test for test/LoopGas.t.sol:LoopGasTest
[PASS] testFix_UncheckedLoopCostsLessThanCheckedLoop() (gas: 381431)
Logs:
  sumChecked gas (100 elements): 292285
  sumUnchecked gas (100 elements): 84188

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.01ms (651.94µs CPU time)

Ran 2 test suites in 24.30ms (6.00ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code1/gas-easy$ forge test -vv --gas-report
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/ErrorGas.t.sol:ErrorGasTest
[PASS] testFix_CustomErrorsCostLessThanRequireStrings() (gas: 504346)
Logs:
  RequireStringDemo deployment gas: 264150
  CustomErrorDemo deployment gas: 179296

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 1.58ms (1.02ms CPU time)

Ran 1 test for test/LoopGas.t.sol:LoopGasTest
[PASS] testFix_UncheckedLoopCostsLessThanCheckedLoop() (gas: 590431)
Logs:
  sumChecked gas (100 elements): 292285
  sumUnchecked gas (100 elements): 290688

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.36ms (860.39µs CPU time)

╭--------------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/CustomErrorDemo.sol:CustomErrorDemo Contract |                 |       |        |       |         |
+=======================================================================================================+
| Deployment Cost                                  | Deployment Size |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                           147103 |             465 |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                                  |                 |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                                    | Min             | Avg   | Median | Max   | # Calls |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| setValue                                         |           21648 | 21648 |  21648 | 21648 |       1 |
╰--------------------------------------------------+-----------------+-------+--------+-------+---------╯

╭------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/LoopGasDemo.sol:LoopGasDemo Contract |                 |       |        |       |         |
+===============================================================================================+
| Deployment Cost                          | Deployment Size |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                   210656 |             759 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
|                                          |                 |       |        |       |         |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                            | Min             | Avg   | Median | Max   | # Calls |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| sumChecked                               |           31176 | 31176 |  31176 | 31176 |       1 |
|------------------------------------------+-----------------+-------+--------+-------+---------|
| sumUnchecked                             |           29910 | 29910 |  29910 | 29910 |       1 |
╰------------------------------------------+-----------------+-------+--------+-------+---------╯

╭------------------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/RequireStringDemo.sol:RequireStringDemo Contract |                 |       |        |       |         |
+===========================================================================================================+
| Deployment Cost                                      | Deployment Size |       |        |       |         |
|------------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                               231812 |             859 |       |        |       |         |
|------------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                                      |                 |       |        |       |         |
|------------------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                                        | Min             | Avg   | Median | Max   | # Calls |
|------------------------------------------------------+-----------------+-------+--------+-------+---------|
| setValue                                             |           21933 | 21933 |  21933 | 21933 |       1 |
╰------------------------------------------------------+-----------------+-------+--------+-------+---------╯


Ran 2 test suites in 6.03ms (3.94ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-46/Assignment/code1/gas-easy$ forge test --match-test testFix_CustomErrorsCostLessThanRequireStrings -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/ErrorGas.t.sol:ErrorGasTest
[PASS] testFix_CustomErrorsCostLessThanRequireStrings() (gas: 329486)
Logs:
  RequireStringDemo deployment gas: 198744
  CustomErrorDemo deployment gas: 119726

Traces:
  [329486] ErrorGasTest::testFix_CustomErrorsCostLessThanRequireStrings()
    ├─ [166406] → new RequireStringDemo@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 831 bytes of code
    ├─ [87533] → new CustomErrorDemo@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 437 bytes of code
    ├─ [0] console::log("RequireStringDemo deployment gas:", 198744 [1.987e5]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("CustomErrorDemo deployment gas:", 119726 [1.197e5]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::expectRevert(value must be greater than zero, this is a long descriptive error message)
    │   └─ ← [Return]
    ├─ [741] RequireStringDemo::setValue(0)
    │   └─ ← [Revert] value must be greater than zero, this is a long descriptive error message
    ├─ [0] VM::expectRevert(ValueTooLow())
    │   └─ ← [Return]
    ├─ [456] CustomErrorDemo::setValue(0)
    │   └─ ← [Revert] ValueTooLow()
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 566.37µs (199.90µs CPU time)

Ran 1 test suite in 13.04ms (566.37µs CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
