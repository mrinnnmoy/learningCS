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

     forge init bridge-medium --no-git
     cd bridge-easy
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set solc = "0.8.36" under [profile.default] in foundry.toml.

3. Create both src/ files and the one test file from the Solution
   below.

4. Build and run.

     forge build
     forge test -vv

   You should see 3 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-36/Assignment/code2/bridge-medium$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 3 tests for test/BurnAndMintMultisig.t.sol:BurnAndMintMultisigTest
[PASS] testFix_ExactlyThresholdDistinctSignaturesSucceeds() (gas: 121110)
[PASS] testFix_FewerThanThresholdSignaturesReverts() (gas: 31681)
[PASS] testFix_RepeatedMessageRevertsEvenWithFreshSignatures() (gas: 129565)
Suite result: ok. 3 passed; 0 failed; 0 skipped; finished in 2.69ms (2.82ms CPU time)

Ran 1 test suite in 10.51ms (2.69ms CPU time): 3 tests passed, 0 failed, 0 skipped (3 total tests)
```
