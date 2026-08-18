# For someone cloning.

Simply reinstall the dependencies.

```
cd governence-easy
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build
```

---

# How to Build.

```
1. Scaffold and install OpenZeppelin.

     forge init governance-easy --no-git
     cd governance-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv --gas-report
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code1/governance-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/MultisigComparison.t.sol:MultisigComparisonTest
[PASS] testFix_BothReachTheIdenticalTwoOfThreeThreshold() (gas: 2345931)
Logs:
  OnChainMultisig total gas (4 transactions): 207798
  OffChainMultisig total gas (1 transaction): 45548

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.01ms (1.29ms CPU time)

Ran 1 test suite in 12.01ms (2.01ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code1/governance-easy$ forge test -vv --gas-report
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/MultisigComparison.t.sol:MultisigComparisonTest
[PASS] testFix_BothReachTheIdenticalTwoOfThreeThreshold() (gas: 2778327)
Logs:
  OnChainMultisig total gas (4 transactions): 327858
  OffChainMultisig total gas (1 transaction): 77028

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 4.74ms (3.16ms CPU time)

╭----------------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/OffChainMultisig.sol:OffChainMultisig Contract |                 |       |        |       |         |
+=========================================================================================================+
| Deployment Cost                                    | Deployment Size |       |        |       |         |
|----------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                            1067904 |            5539 |       |        |       |         |
|----------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                                    |                 |       |        |       |         |
|----------------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                                      | Min             | Avg   | Median | Max   | # Calls |
|----------------------------------------------------+-----------------+-------+--------+-------+---------|
| executeWithSignatures                              |           74382 | 74382 |  74382 | 74382 |       1 |
╰----------------------------------------------------+-----------------+-------+--------+-------+---------╯

╭--------------------------------------------------+-----------------+-------+--------+-------+---------╮
| src/OnChainMultisig.sol:OnChainMultisig Contract |                 |       |        |       |         |
+=======================================================================================================+
| Deployment Cost                                  | Deployment Size |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                          1207365 |            6184 |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
|                                                  |                 |       |        |       |         |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                                    | Min             | Avg   | Median | Max   | # Calls |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| confirm                                          |           56222 | 64772 |  64772 | 73322 |       2 |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| execute                                          |           91720 | 91720 |  91720 | 91720 |       1 |
|--------------------------------------------------+-----------------+-------+--------+-------+---------|
| submit                                           |           99263 | 99263 |  99263 | 99263 |       1 |
╰--------------------------------------------------+-----------------+-------+--------+-------+---------╯


Ran 1 test suite in 8.38ms (4.74ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-42/Assignment/code1/governance-easy$ forge test --match-test testFix_BothReachTheIdenticalTwoOfThreeThreshold -vvvv
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/MultisigComparison.t.sol:MultisigComparisonTest
[PASS] testFix_BothReachTheIdenticalTwoOfThreeThreshold() (gas: 2345931)
Logs:
  OnChainMultisig total gas (4 transactions): 207798
  OffChainMultisig total gas (1 transaction): 45548

Traces:
  [2345931] MultisigComparisonTest::testFix_BothReachTheIdenticalTwoOfThreeThreshold()
    ├─ [1063025] → new OnChainMultisig@0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
    │   └─ ← [Return] 4517 bytes of code
    ├─ [0] VM::deal(OnChainMultisig: [0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f], 1000000000000000000 [1e18])
    │   └─ ← [Return]
    ├─ [0] VM::prank(0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf)
    │   └─ ← [Return]
    ├─ [75579] OnChainMultisig::submit(0x000000000000000000000000000000000000cafE, 1000000000000000000 [1e18], 0x)
    │   └─ ← [Return] 0
    ├─ [0] VM::prank(0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf)
    │   └─ ← [Return]
    ├─ [44130] OnChainMultisig::confirm(0)
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF)
    │   └─ ← [Return]
    ├─ [24230] OnChainMultisig::confirm(0)
    │   └─ ← [Stop]
    ├─ [0] VM::prank(0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf)
    │   └─ ← [Return]
    ├─ [56528] OnChainMultisig::execute(0)
    │   ├─ [0] 0x000000000000000000000000000000000000cafE::fallback{value: 1000000000000000000}()
    │   │   └─ ← [Stop]
    │   └─ ← [Stop]
    ├─ [933888] → new OffChainMultisig@0x2e234DAe75C793f67A35089C9d99245E1C58470b
    │   └─ ← [Return] 3872 bytes of code
    ├─ [0] VM::deal(OffChainMultisig: [0x2e234DAe75C793f67A35089C9d99245E1C58470b], 1000000000000000000 [1e18])
    │   └─ ← [Return]
    ├─ [0] VM::sign("<pk>", 0xd2eaef525a2327e0f2db8db6bdd4ab688a05319801efc8733b5e37d2d1f5cc3b) [staticcall]
    │   └─ ← [Return] 27, 0x3b28549cc3124c7ce0fa4affc77fb2761fb2346e4bc6f3833f584539c6c2caf8, 0x5c0e2abb467b1d0a504c4504db7a50f15204975e9f08e3876ba5fe9f10e8b4a6
    ├─ [0] VM::sign("<pk>", 0xd2eaef525a2327e0f2db8db6bdd4ab688a05319801efc8733b5e37d2d1f5cc3b) [staticcall]
    │   └─ ← [Return] 28, 0x2e6053ec911a962cc73e1683d06390535de01152107dbb3db6ed143e521be875, 0x31e3c7255e93ffa28fd66cc007e386d1c81aceb3509747b19aacae810f7c6e58
    ├─ [42902] OffChainMultisig::executeWithSignatures(0x000000000000000000000000000000000000cafE, 1000000000000000000 [1e18], 0x, 0, [0x3b28549cc3124c7ce0fa4affc77fb2761fb2346e4bc6f3833f584539c6c2caf85c0e2abb467b1d0a504c4504db7a50f15204975e9f08e3876ba5fe9f10e8b4a61b, 0x2e6053ec911a962cc73e1683d06390535de01152107dbb3db6ed143e521be87531e3c7255e93ffa28fd66cc007e386d1c81aceb3509747b19aacae810f7c6e581c])
    │   ├─ [3000] PRECOMPILES::ecrecover(0xd2eaef525a2327e0f2db8db6bdd4ab688a05319801efc8733b5e37d2d1f5cc3b, 27, 26757715921992087327112422865088858715275751375139007150690476701328051718904, 41637812850846503419688533253412356041202797608050212626703132628742002226342) [staticcall]
    │   │   └─ ← [Return] 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
    │   ├─ [3000] PRECOMPILES::ecrecover(0xd2eaef525a2327e0f2db8db6bdd4ab688a05319801efc8733b5e37d2d1f5cc3b, 28, 20976587575824395218506164317160936175532741051232483090220538433474536401013, 22565778319286022778820248961510855587608437709322394291110721217746882555480) [staticcall]
    │   │   └─ ← [Return] 0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF
    │   ├─ [0] 0x000000000000000000000000000000000000cafE::fallback{value: 1000000000000000000}()
    │   │   └─ ← [Stop]
    │   └─ ← [Stop]
    ├─ [0] console::log("OnChainMultisig total gas (4 transactions):", 207798 [2.077e5]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("OffChainMultisig total gas (1 transaction):", 45548 [4.554e4]) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 2.43ms (1.38ms CPU time)

Ran 1 test suite in 9.42ms (2.43ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```
