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
1. Scaffold and install OpenZeppelin (Week 29's own pattern — only
   needed here for the ERC20 base; ECDSA isn't used until Medium).

     forge init bridge-easy --no-git
     cd bridge-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create all three src/ files and the one test file from the
   Solution below.

4. Build and run.

     forge build
     forge test -vv

   You should see 2 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-36/Assignment/code1/bridge-easy$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 2 tests for test/LockAndMint.t.sol:LockAndMintTest
[PASS] testFix_OnlyRelayerCanMintOrUnlock() (gas: 19159)
[PASS] testFullRoundTrip_LockMintBurnUnlock() (gas: 135087)
Suite result: ok. 2 passed; 0 failed; 0 skipped; finished in 1.84ms (609.87µs CPU time)

Ran 1 test suite in 9.86ms (1.84ms CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```