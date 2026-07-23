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
1. Make sure anvil is still running (restart it fresh if not — a
   restart resets balances and deployments, fine, nothing carries
   over between weeks).

2. Scaffold and install OpenZeppelin, per the Tutorial above.

   Run:
     forge init game-token --no-git
     cd game-token
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

3. Set the same solc pin as every previous week, under
   [profile.default] in foundry.toml:
     solc = "0.8.36"

4. Create src/GameToken.sol and script/Deploy.s.sol from the Solution
   below, removing forge init's own example files first.

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
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code1/game-token$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
token: contract GameToken 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  GameToken deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1557346

Estimated amount required: 0.003114692001557346 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x6fcb12146ca0c616280c6e59055a0a59b69b1faa92c1ef1573dd2664e3c2180f
Contract: GameToken
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.001197959001197959 ETH (1197959 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001197959001197959 ETH (1197959 gas * avg 1.000000001 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code1/game-token/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-29/Assignment/code1/game-token/cache/Deploy.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code1/game-token$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "mint(address,uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 1000000000000000000000 \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x56c3bc6d5b17efa3bf0998ec027c763aaf56edba5b0e7bf5e4b273842404319b
blockNumber          2
contractAddress
cumulativeGasUsed    71566
effectiveGasPrice    884982993
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              71566
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef","0x0000000000000000000000000000000000000000000000000000000000000000","0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"],"data":"0x00000000000000000000000000000000000000000000003635c9adc5dea00000","blockHash":"0x56c3bc6d5b17efa3bf0998ec027c763aaf56edba5b0e7bf5e4b273842404319b","blockNumber":"0x2","blockTimestamp":"0x6a7583d4","transactionHash":"0x28748f06e2d5c6dca6b6dad0c5856a02a66d96c56fa23bb3290acd03b8d3295d","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000840020000000000000000000800000000000000000000000010000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000042000000000000000000000000000000000000000000000000000020000000000000000000000000000000000001000000000000000000000000000000
root
status               1 (success)
transactionHash      0x28748f06e2d5c6dca6b6dad0c5856a02a66d96c56fa23bb3290acd03b8d3295d
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-29/Assignment/code1/game-token$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "balanceOf(address)(uint256)" 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
       --rpc-url http://127.0.0.1:8545
1000000000000000000000 [1e21]
```
