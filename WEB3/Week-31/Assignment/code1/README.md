# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold.

   Run:
     forge init security-easy --no-git
     cd security-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml, same
   as every previous week.

3. Create all four src/ files and both test/ files from the Solution
   below, removing forge init's own example files first.

4. Build and run.

     forge build
     forge test -vv

   You should see 4 tests, all passing — including two exploit PoCs
   that pass specifically BECAUSE the attack they demonstrate succeeds
   against the vulnerable contract, and two more confirming the fixed
   contract resists the identical attack.
```