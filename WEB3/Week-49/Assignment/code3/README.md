# For someone cloning.

Simply reinstall the dependencies.

```
cd verify-hard
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

     forge init verify-hard --no-git
     cd verify-hard

2. Set the same solc pin as Easy/Medium.

3. Copy UnoptimizedVault.sol and OptimizedVault.sol from Week 46,
   unchanged. Create SPEC.md, both test/ files, and the CI workflow
   file from the Solution below.

4. Build and run the differential fuzz test.

     forge build
     forge test --match-path test/DifferentialVault.t.sol -vv

5. Run the Halmos symbolic proof separately (Tutorial above).

     halmos --contract HalmosProofTest --function check_withdrawNeverExceedsDeposit
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code3/verify-hard$ forge test --match-path test/DifferentialVault.t.sol -vv
[⠆] Compiling...
No files changed, compilation skipped

Ran 1 test for test/DifferentialVault.t.sol:DifferentialVaultTest
[PASS] testFuzz_BothVaultsAgreeAfterEveryOperation(uint96,uint96) (runs: 256, μ: 235215, ~: 236600)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 10.96ms (10.04ms CPU time)

Ran 1 test suite in 74.93ms (10.96ms CPU time): 1 tests passed, 0 failed, 0 skipped (1 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code3/verify-hard$ source .venv/bin/activate
(.venv) mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code3/verify-hard$ forge clean
forge build --ast
[⠊] Compiling...
[⠔] Compiling 23 files with Solc 0.8.36
[⠘] Solc 0.8.36 finished in 2.38s
Compiler run successful!
warning[unsafe-typecast]: typecasts that can truncate values should be checked
   ╭▸ src/OptimizedVault.sol:45:21
   │
45 │         d.amount -= uint128(amount);
   │                     ━━━━━━━━━━━━━━━
   │
   ├ note: consider disabling this lint if you're certain the cast is safe
   │       
   │       // casting to 'uint128' is safe because [explain why]
   │       // forge-lint: disable-next-line(unsafe-typecast)
   │       
   │       
   ╰ help: https://book.getfoundry.sh/reference/forge/forge-lint#unsafe-typecast

(.venv) mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code3/verify-hard$ halmos \
  --contract HalmosProofTest \
  --function check_withdrawNeverExceedsDeposit
[⠢] Compiling...
[⠑] Compiling 23 files with Solc 0.8.36
[⠒] Solc 0.8.36 finished in 2.43s
Compiler run successful!
warning[unsafe-typecast]: typecasts that can truncate values should be checked
   ╭▸ src/OptimizedVault.sol:45:21
   │
45 │         d.amount -= uint128(amount);
   │                     ━━━━━━━━━━━━━━━
   │
   ├ note: consider disabling this lint if you're certain the cast is safe
   │       
   │       // casting to 'uint128' is safe because [explain why]
   │       // forge-lint: disable-next-line(unsafe-typecast)
   │       
   │       
   ╰ help: https://book.getfoundry.sh/reference/forge/forge-lint#unsafe-typecast


Running 1 tests for test/HalmosProof.t.sol:HalmosProofTest
[PASS] check_withdrawNeverExceedsDeposit(uint128,uint128) (paths: 6, time: 0.10s, bounds: [])
Symbolic test result: 1 passed; 0 failed; time: 0.12s
(.venv) mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-49/Assignment/code3/verify-hard$ deactivate
```