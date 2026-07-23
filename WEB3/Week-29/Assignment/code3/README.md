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
1. Scaffold and install OpenZeppelin, same as Easy/Medium.

   Run:
     forge init live-art-collection --no-git
     cd live-art-collection
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

2. Set the solc pin and Sepolia RPC endpoint, same as Week 27's Hard:

     [profile.default]
     solc = "0.8.36"

     [rpc_endpoints]
     sepolia = "${SEPOLIA_RPC_URL}"

   Run (if not already set in this shell session):
     export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"

3. Confirm the deployerKey keystore from Week 27 is still there AND
   still funded — do not assume it is:

     cast wallet list
     cast balance $(cast wallet address --account deployerKey) --rpc-url sepolia

   If the balance looks too low for a deployment plus a couple of
   transactions, request more from the same faucet used in Week 27
   before continuing.

4. Create src/LiveArtCollection.sol and script/Deploy.s.sol from the
   Solution below.

5. Build and deploy.

   Build:

     forge build

   Deploy, but only if deployments/sepolia.txt doesn't already exist
   (same guard as Week 27's Hard):

     test -f deployments/sepolia.txt && echo "Already deployed, see deployments/sepolia.txt" || \
       forge script script/Deploy.s.sol --rpc-url sepolia --account deployerKey --broadcast

6. The script logs both the deployed address and the current block
   number — save both, comma-separated, into deployments/sepolia.txt.

    mkdir -p deployments
    
    echo "change-this-to-the-deployed-address,change-this-to-the-current-block" > deployments/sepolia.txt

```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection$ forge script script/Deploy.s.sol \
  --rpc-url sepolia \
  --account deployerKey \
  --broadcast
Enter keystore password:
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
collection: contract LiveArtCollection 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8

== Logs ==
  LiveArtCollection deployed at: 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8
  Deployed in block: 11437101
  Save both, comma-separated, into deployments/sepolia.txt

## Setting up 1 EVM.

==========================

Chain 11155111

Estimated gas price: 2.11155596 gwei

Estimated total gas used for script: 3904940

Estimated amount required: 0.0082454993304424 ETH

==========================

##### sepolia
✅  [Success] Hash: 0x6967f8716e27c1036be9f3e7da848fc9f59ab800970e907c2a5f4f3c526de183
Contract: LiveArtCollection
Contract Address: 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8
Block: 11437103
Paid: 0.0033361718787822 ETH (3003800 gas * 1.110650469 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.0033361718787822 ETH (3003800 gas * avg 1.110650469 gwei)
                                                                                                                                     

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection/broadcast/Deploy.s.sol/11155111/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection/cache/Deploy.s.sol/11155111/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection$ cast send 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8 \
  "mint(address,uint256,string)" \
  $(cast wallet address --account deployerKey) \
  1 \
  "ipfs://bafybeigdyrzt.../1.json" \
  --rpc-url sepolia \
  --account deployerKey
Enter keystore password:

blockHash            0x5df26ec80baa83edad2bbc27003ab2e809bbbaeda4d21a29bcc7ee7b09bc23ab
blockNumber          11437120
contractAddress      
cumulativeGasUsed    11749920
effectiveGasPrice    1083032694
from                 0xBe1A491A93822eB244F111Ce83baA0B2C617c305
gasUsed              171435
logs                 [{"address":"0xaa59dace7822fc4c9a3332d76cb48d014c2bb4e8","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x000000000000000000000000be1a491a93822eb244f111ce83baa0b2c617c305","0x0000000000000000000000000000000000000000000000000000000000000001"],"data":"0x","blockHash":"0x5df26ec80baa83edad2bbc27003ab2e809bbbaeda4d21a29bcc7ee7b09bc23ab","blockNumber":"0xae8440","blockTimestamp":"0x6a759758","transactionHash":"0xba05b473b5bbe2e53bad08a5abef37d4e6b634ba41ddb6b557d59c4d7b788c5c","transactionIndex":"0x51","logIndex":"0x145","removed":false},{"address":"0xaa59dace7822fc4c9a3332d76cb48d014c2bb4e8","topics":["0xf8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0x5df26ec80baa83edad2bbc27003ab2e809bbbaeda4d21a29bcc7ee7b09bc23ab","blockNumber":"0xae8440","blockTimestamp":"0x6a759758","transactionHash":"0xba05b473b5bbe2e53bad08a5abef37d4e6b634ba41ddb6b557d59c4d7b788c5c","transactionIndex":"0x51","logIndex":"0x146","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000008000000000000000000040000000080000000000000000000020002000000000000000800000001000000000000000010000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000008000000002000000000000000000000000000002000000000000000000000060000000000000000000200000000000000000000000000000000000400000000000
root                 
status               1 (success)
transactionHash      0xba05b473b5bbe2e53bad08a5abef37d4e6b634ba41ddb6b557d59c4d7b788c5c
transactionIndex     81
type                 2
blobGasPrice         
blobGasUsed          
to                   0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection$ cast call 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8 \
  "totalSupply()(uint256)" \
  --rpc-url sepolia
1
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code3/live-art-collection$ cast call 0xAa59dAce7822FC4C9A3332d76CB48d014C2bb4e8 \
  "tokenOfOwnerByIndex(address,uint256)(uint256)" \
  $(cast wallet address --account deployerKey) 0 \
  --rpc-url sepolia
Enter keystore password:
1
```