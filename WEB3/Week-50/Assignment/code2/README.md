# For someone cloning.

```
cd devops-medium
forge install forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, reusing Week 27's own Counter.sol and Deploy.s.sol.

     forge init devops-medium --no-git
     cd devops-medium

2. Create .github/workflows/ci-cd.yml from the Solution below.

3. In a REAL GitHub repository this project is pushed to: Settings →
   Secrets and variables → Actions → New repository secret, add
   SEPOLIA_RPC_URL and DEPLOYER_PRIVATE_KEY (reusing the SAME
   deployerKey address already used throughout this course is fine —
   confirm it's still funded via `cast balance` first, the same
   discipline every previous week's own live deployment has used).

4. Push to main — confirm ONLY the test job runs, in the repository's
   own Actions tab.

5. Push a real tag — confirm BOTH jobs run this time:

     git tag v1.0.0
     git push origin v1.0.0
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code2/devops-medium$ forge build
[⠊] Compiling...
[⠘] Compiling 17 files with Solc 0.8.36
[⠃] Solc 0.8.36 finished in 723.47ms
Compiler run successful!
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code2/devops-medium$ forge test -vvv
[⠊] Compiling...
No files changed, compilation skipped
No tests found in project! Forge looks for functions that start with `test`
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code2/devops-medium$ forge script script/Deploy.s.sol
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.
Gas used: 297994

== Return ==
counter: contract Counter 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496

== Logs ==
  Counter deployed at: 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496

If you wish to simulate on-chain transactions pass a RPC URL.
```