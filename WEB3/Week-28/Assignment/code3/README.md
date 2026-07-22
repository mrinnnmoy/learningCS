# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, same anvil chain still running.

   Run:
     forge init reentrancy-case-study --no-git
     cd reentrancy-case-study

2. Set the same solc pin as every previous week.
    [profile.default] in foundry.toml:
        solc = "0.8.36"

3. Create all four src/ files and both script/ files from the
   Solution below, removing forge init's own example files first.

4. Build.

   Run:
     forge build

5. Deploy to your local anvil chain, using one of anvil's own printed
   default accounts as the deployer (anvil prints these on startup;
   the first one shown below is always the same well-known default):

   Terminal 1:
    anvil

   Terminal 2:
     forge script script/DeployVulnerable.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Note the two addresses it logs: VulnerableVault and
   ReentrancyAttacker (call them <VAULT> and <ATTACKER>).

5. Deploy the guarded pairing separately (same command shape,
   different script), noting <GUARDED_VAULT> and <ATTACKER2>:

     forge script script/DeployGuarded.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study$ forge script script/DeployVulnerable.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==
  VulnerableVault deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  ReentrancyAttacker deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1003425

Estimated amount required: 0.002006850001003425 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0xc7ef6f3adc72ebd85f8a72bab0e5f39e5f0e2d3f4b8d68b12d1123eab00116da
Contract: ReentrancyAttacker
Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Block: 2
Paid: 0.00038467140985612 ETH (438232 gas * 0.877780285 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0xa530711e9b181e5148aab159d4a0781c3d5121bfa653d4569da1bf1a97263794
Contract: VulnerableVault
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000333634000333634 ETH (333634 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000718305410189754 ETH (771866 gas * avg 0.938890143 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study/broadcast/DeployVulnerable.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study/cache/DeployVulnerable.s.sol/31337/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study$ forge script script/DeployGuarded.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==
  GuardedVault deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  ReentrancyAttacker (vs. guarded) deployed at: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 1.755560569 gwei

Estimated total gas used for script: 1005172

Estimated amount required: 0.001764640328262868 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x3a312b8f6ec112b99d7330ef1e696bc3ba41e3e2198c3e17acab6bf1db2ade1a
Contract: ReentrancyAttacker
Contract Address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Block: 4
Paid: 0.000296686743395872 ETH (438232 gas * 0.677008396 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x0dca1610e6e14884813cbf1c0c869bd80e440dd6cd2968fac748a0196cee68c4
Contract: GuardedVault
Contract Address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Block: 3
Paid: 0.00025835625278141 ETH (334978 gas * 0.771263345 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000555042996177282 ETH (773210 gas * avg 0.72413587 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study/broadcast/DeployGuarded.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study/cache/DeployGuarded.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "deposit()" --value 5ether --rpc-url http://127.0.0.1:8545 \
       --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

blockHash            0xbea424ff9fd04207af6c8569ca900b5b59cb84a8758d6a0b2ea8aee749b383a1
blockNumber          5
contractAddress      
cumulativeGasUsed    43623
effectiveGasPrice    594854737
from                 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
gasUsed              43623
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x4054f3338b40df26bac6ae9e8cafb10d287fd5eb643a1ee89bfde1e2b974d56d
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code3/reentrancy-case-study$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "vaultBalance()(uint256)" --rpc-url http://127.0.0.1:8545
5000000000000000000 [5e18]
```
