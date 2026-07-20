# How to Build.

```
1. Scaffold, exactly as in Easy (same anvil instance, still running,
   is reused here).

   Run:
     forge init task-registry --no-git
     cd task-registry

2. Set the same solc pin in foundry.toml as Easy's.

3. Create src/Ownable.sol, src/TaskRegistry.sol, and
   script/Deploy.s.sol from the Solution below, removing forge init's
   own example files first.

4. Build and deploy to the same local anvil chain Easy used:

   Run:
     forge build

     In terminal 1 : anvil

     In terminal 2 (simultaneously) :
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Copy the deployed address — the Manual Test Cases below refer to it
   as <ADDRESS>.
```

---

# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-27/Assignment/code2/task-registry$ forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
registry: contract TaskRegistry 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  TaskRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1505563

Estimated amount required: 0.003011126001505563 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x7db4d433422b9f2e6da736379792cac5ee30e30d0974be727f2b7e6c3243a952
Contract: TaskRegistry
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.001158126001158126 ETH (1158126 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001158126001158126 ETH (1158126 gas * avg 1.000000001 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code2/task-registry/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code2/task-registry/cache/Deploy.s.sol/31337/run-latest.json
```