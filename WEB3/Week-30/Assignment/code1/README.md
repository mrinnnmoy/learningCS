# For someone cloning.

Simply reinstall the dependencies.

```
cd counter-foundry
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Foundry side, same pattern as every previous week.

   Run:
     mkdir week-30 && cd week-30
     forge init counter-foundry --no-git
     cd counter-foundry

   Set solc = "0.8.36" under [profile.default] in foundry.toml, then
   create src/Counter.sol and test/Counter.t.sol from the Solution
   below, removing forge init's own example files first.

     forge build
     forge test -vv

   You should see 4 tests, all passing.

2. Hardhat side, from the Tutorial above, run from week-30/:

     cd ..
     mkdir counter-hardhat && cd counter-hardhat
     npx hardhat --init
     (choose: TypeScript, Ethers + Mocha toolbox, defaults otherwise —
      this creates a new project folder; rename it to counter-hardhat
      if the interactive prompt doesn't already ask for that name)
     cd counter-hardhat

   Create contracts/Counter.sol and test/Counter.ts from the Solution
   below, removing the sample project's own example contract/test
   first.

     npx hardhat compile
     npx hardhat test

   You should see 4 passing tests here too.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code1/counter-foundry$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/Counter.t.sol:CounterTest
[PASS] testDecrementRevertsAtZero() (gas: 10528)
[PASS] testInitialCountIsZero() (gas: 7897)
[PASS] testOwnerCanIncrementBy() (gas: 31108)
[PASS] testStrangerCannotIncrementBy() (gas: 12504)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 1.41ms (897.20µs CPU time)

Ran 1 test suite in 82.68ms (1.41ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code1/counter-hardhat$ npx hardhat test
No contracts to compile

Running Solidity tests


Running Mocha tests


  Counter
    ✔ starts at zero (825ms)
    ✔ lets the owner incrementBy
    ✔ reverts incrementBy for a non-owner
    ✔ reverts decrement at zero


  4 passing (915ms)


4 passing (4 mocha)
```