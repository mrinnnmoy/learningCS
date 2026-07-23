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
1. Scaffold and install OpenZeppelin, same as Easy.

   Run:
     forge init art-collection --no-git
     cd art-collection
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set the same solc pin as every previous week, under
   [profile.default] in foundry.toml:
     solc = "0.8.36"

3. Create src/ArtCollection.sol and script/Deploy.s.sol from the
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
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Copy the deployed address — Manual Test Cases below call it <ADDRESS>.
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
collection: contract ArtCollection 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  ArtCollection deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 3214733

Estimated amount required: 0.006429466003214733 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0xcea55c3e8fa72d4c200ff83e1fa4066b3a3567c67583bcdbcb5c3603b02f9992
Contract: ArtCollection
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.002472872002472872 ETH (2472872 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.002472872002472872 ETH (2472872 gas * avg 1.000000001 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection/cache/Deploy.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "mint(address,uint256,string)" \
       0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1 "ipfs://bafybeigdyrzt.../1.json" \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0xa35e67b066760205ca273d7cb1730c57b6a54c677eff75edc6e4d8d3eaaf168c
blockNumber          2
contractAddress      
cumulativeGasUsed    99658
effectiveGasPrice    895607268
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              99658
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8","0x0000000000000000000000000000000000000000000000000000000000000001"],"data":"0x","blockHash":"0xa35e67b066760205ca273d7cb1730c57b6a54c677eff75edc6e4d8d3eaaf168c","blockNumber":"0x2","blockTimestamp":"0x6a758a00","transactionHash":"0x677b4b19a391c0e6d1300d206fa296a404894db2d69a5373c28e45aad75049f9","transactionIndex":"0x0","logIndex":"0x0","removed":false},{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0xf8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0xa35e67b066760205ca273d7cb1730c57b6a54c677eff75edc6e4d8d3eaaf168c","blockNumber":"0x2","blockTimestamp":"0x6a758a00","transactionHash":"0x677b4b19a391c0e6d1300d206fa296a404894db2d69a5373c28e45aad75049f9","transactionIndex":"0x0","logIndex":"0x1","removed":false}]
logsBloom            0x00000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000008000000000000000000040000000000000000000000000840020000000000000000000800000000000000000000000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000002000000000000000000000000000008000000042000000000000000000000000000000000000000000000000000060000000000000000000200000000000000001000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x677b4b19a391c0e6d1300d206fa296a404894db2d69a5373c28e45aad75049f9
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "ownerOf(uint256)(address)" 1 --rpc-url http://127.0.0.1:8545
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code2/art-collection$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "tokenURI(uint256)(string)" 1 --rpc-url http://127.0.0.1:8545
"ipfs://bafybeigdyrzt.../1.json"
```