# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Make sure anvil is still running from Week 27 (or restart it in its
   own terminal: anvil — a fresh anvil restart resets all balances and
   deployments, which is fine, nothing from Week 27 needs to persist
   into this week).

2. Scaffold.

   Run:
     forge init simple-vault --no-git
     cd simple-vault

3. Set the same solc pin as every previous week, under
   [profile.default] in foundry.toml:
     solc = "0.8.36"

4. Replace src/Counter.sol with src/SimpleVault.sol, and add
   script/Deploy.s.sol, both from the Solution below.

5. Build.

   Run:
     forge build

6. Deploy to your local anvil chain, using one of anvil's own printed
   default accounts as the deployer (anvil prints these on startup;
   the first one shown below is always the same well-known default):

   Terminal 1:
    anvil

   Terminal 2:
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Copy the deployed address — Manual Test Cases below call it <ADDRESS>.
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code1/simple-vault$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
vault: contract SimpleVault 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  SimpleVault deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 578022

Estimated amount required: 0.001156044000578022 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x86529ac5ce29ccd2b099c39d8be94497cb022d1975cff5b6238772a33c3b4ef9
Contract: SimpleVault
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000444633000444633 ETH (444633 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000444633000444633 ETH (444633 gas * avg 1.000000001 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code1/simple-vault/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code1/simple-vault/cache/Deploy.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code1/simple-vault$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "deposit()" \
  --value 1ether \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

blockHash            0x4b97af23c3a2fb91b387203e84ccf4754a8526dab7785634354e5d86be3c7003
blockNumber          2
contractAddress      
cumulativeGasUsed    45171
effectiveGasPrice    878705276
from                 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
gasUsed              45171
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4","0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"],"data":"0x0000000000000000000000000000000000000000000000000de0b6b3a7640000","blockHash":"0x4b97af23c3a2fb91b387203e84ccf4754a8526dab7785634354e5d86be3c7003","blockNumber":"0x2","blockTimestamp":"0x6a74982e","transactionHash":"0x397b846247ee1e7c74da2b50cff976b066d4dc861c207c4f2a0c0d3748248b7b","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000840000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000040000000000000000000000000000001000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x397b846247ee1e7c74da2b50cff976b066d4dc861c207c4f2a0c0d3748248b7b
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code1/simple-vault$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(address)(uint256)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  --rpc-url http://127.0.0.1:8545
1000000000000000000 [1e18]
```