# For someone cloning.

```
cd devops-easy
forge install forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, reusing Week 27's own Counter.sol directly.

     forge init devops-easy --no-git
     cd devops-easy

2. Set foundry.toml with all three profiles from the Solution below.

    Also don't forget to set the env variables.

     export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
     export MAINNET_RPC_URL="https://ethereum-rpc.publicnode.com"
    
    And do verify it.

     echo "$SEPOLIA_RPC_URL"
     echo "$MAINNET_RPC_URL"

3. Confirm the profile switch works.

     FOUNDRY_PROFILE=devnet forge config --json | grep eth_rpc_url
     FOUNDRY_PROFILE=sepolia forge config --json | grep eth_rpc_url
     FOUNDRY_PROFILE=mainnet forge config --json | grep eth_rpc_url

4. Run the real reproducible-build check.

     forge clean && forge build
     shasum -a 256 out/Counter.sol/Counter.json > build1.hash

     forge clean && forge build
     shasum -a 256 out/Counter.sol/Counter.json > build2.hash

     diff build1.hash build2.hash
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ forge clean && forge build
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.36
[⠢] Solc 0.8.36 finished in 22.74ms
Compiler run successful!
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ shasum -a 256 out/Counter.sol/Counter.json > build1.hash
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ cat build1.hash
00203ef09e07eac36c81ef46a62de4bc7e873b48a5d665d3a8f865c9b257f142  out/Counter.sol/Counter.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ forge clean && forge build
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.36
[⠢] Solc 0.8.36 finished in 43.89ms
Compiler run successful!
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ shasum -a 256 out/Counter.sol/Counter.json > build2.hash
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ cat build2.hash
00203ef09e07eac36c81ef46a62de4bc7e873b48a5d665d3a8f865c9b257f142  out/Counter.sol/Counter.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ diff build1.hash build2.hash
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code1/devops-easy$ 
```