# For someone cloning.

Simply reinstall the dependencies.

```
cd l2-hard
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init l2-hard --no-git
     cd l2-hard

2. Set the same solc pin as Easy.

3. Create src/BatchPoster.sol and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv --gas-report

5. Check the real, current blob base fee directly, to ground the
   comparison in a real, live number rather than a stale historical
   one:

     cast rpc eth_blobBaseFee --rpc-url sepolia

6. Fill in ROLLUP_DESIGN.md with a real, argued recommendation.
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code3/l2-hard$ forge test -vv --gas-report
[⠊] Compiling...
No files changed, compilation skipped

Ran 1 test for test/DataAvailabilityCost.t.sol:DataAvailabilityCostTest
[PASS] testFix_MeasuresRealCalldataCostForARealisticBatchSize() (gas: 32319892)
Logs:
  Real intrinsic calldata gas (top-level tx formula): 797648
  Internal test-call gas (a DIFFERENT, cheaper cost model - see comment above): 2045398

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 139.30ms (138.92ms CPU time)

╭------------------------------------------+-----------------+---------+---------+---------+---------╮
| src/BatchPoster.sol:BatchPoster Contract |                 |         |         |         |         |
+====================================================================================================+
| Deployment Cost                          | Deployment Size |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
|                                   183491 |             632 |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
|                                          |                 |         |         |         |         |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| Function Name                            | Min             | Avg     | Median  | Max     | # Calls |
|------------------------------------------+-----------------+---------+---------+---------+---------|
| postBatch                                |         2016170 | 2016170 | 2016170 | 2016170 |       1 |
╰------------------------------------------+-----------------+---------+---------+---------+---------╯


Ran 1 test suite in 141.59ms (139.30ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code3/l2-hard$ cast rpc eth_blobBaseFee --rpc-url sepolia
"0x342bbf2"
```
