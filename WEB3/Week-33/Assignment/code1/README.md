# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts-upgradeable
forge install OpenZeppelin/openzeppelin-foundry-upgrades
forge build
```

---

# How to Build.

```
1. Scaffold and install both new dependencies (Tutorial above).

     forge init upgrade-easy --no-git
     cd upgrade-easy
     forge install OpenZeppelin/openzeppelin-contracts-upgradeable
     forge install OpenZeppelin/openzeppelin-foundry-upgrades
     echo '@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/' >> remappings.txt
     echo 'openzeppelin-foundry-upgrades/=lib/openzeppelin-foundry-upgrades/src/' >> remappings.txt

2. Set foundry.toml exactly as the Tutorial shows (solc pin plus ffi,
   ast, build_info, extra_output).

3. Create all three src/ files and both test/ files from the Solution
   below.

4. Build and run, remembering the Tutorial's own `forge clean`
   reminder:

     forge clean
     forge test -vv --force

   You should see 2 tests, all passing.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-33/Assignment/code1/upgrade-easy$ forge test -vv --force
[⠒] Compiling...
[⠢] Compiling 60 files with Solc 0.8.36
[⠢] Solc 0.8.36 finished in 3.99s
Compiler run successful with warnings:
Warning (3628): This contract has a payable fallback function, but no receive ether function. Consider adding a receive ether function.
 --> src/NaiveProxy.sol:5:1:
  |
5 | contract NaiveProxy {
  | ^ (Relevant source part starts here and spans across multiple lines).
Note: The payable fallback function is defined here.
  --> src/NaiveProxy.sol:12:5:
   |
12 |     fallback() external payable {
   |     ^ (Relevant source part starts here and spans across multiple lines).


Ran 1 test for test/NaiveProxyCollision.t.sol:NaiveProxyCollisionTest
[PASS] testExploit_SetOwnerCorruptsProxysOwnImplementationSlot() (gas: 341808)
Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 20.05ms (2.37ms CPU time)

Ran 1 test for test/TransparentProxySafety.t.sol:TransparentProxySafetyTest
[PASS] testFix_RealProxyStorageNeverCollidesWithImplementationSlot() (gas: 14134701)
Logs:
  npm warn exec The following package was not found and will be installed: @openzeppelin/upgrades-core@1.46.0

Suite result: ok. 1 passed; 0 failed; 0 skipped; finished in 3.89s (3.87s CPU time)

Ran 2 test suites in 3.91s (3.91s CPU time): 2 tests passed, 0 failed, 0 skipped (2 total tests)
```