# How to Build.

```
1. Copy Week 27's own Counter.sol and its own Easy test file
   unchanged into solidity/.

     forge init landscape-easy/solidity --no-git
     cd landscape-easy/solidity

2. Build and run — this half is real, verified Foundry work.

     forge build
     forge test -vv

3. Create move/counter.move from Concept 1's own real Move code.

4. Write COMPARISON.md from the Solution below's own starting
   template, filling in real, specific answers.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-51/Assignment/code1/solidity$ forge test -vv
[⠊] Compiling...
No files changed, compilation skipped

Ran 5 tests for test/Counter.t.sol:CounterTest
[PASS] test_DecrementAndUnderflow() (gas: 25645)
[PASS] test_Increment() (gas: 35771)
[PASS] test_InitialOwnerAndCount() (gas: 9084)
[PASS] test_NonOwnerCannotIncrementBy() (gas: 12504)
[PASS] test_OwnerCanIncrementBy() (gas: 31064)
Suite result: ok. 5 passed; 0 failed; 0 skipped; finished in 1.74ms (1.27ms CPU time)

Ran 1 test suite in 81.80ms (1.74ms CPU time): 5 tests passed, 0 failed, 0 skipped (5 total tests)
```