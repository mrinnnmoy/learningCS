# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, same anvil chain from Easy still running.

   Run:
     forge init cross-contract --no-git
     cd cross-contract

2. Set the same solc pin as every previous week, under
   [profile.default] in foundry.toml:
     solc = "0.8.36"

3. Create all five src/ files and script/Deploy.s.sol from the
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

   The script logs four addresses: Logger, PaymentSplitter, MathLib,
   Delegator. Note all four — Manual Test Cases below refer to them by
   name.
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code2/cross-contract$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==
  Logger deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  PaymentSplitter deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  MathLib deployed at: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  Delegator deployed at: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1603197

Estimated amount required: 0.003206394001603197 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0xefbb7dda8d2016524ad134ee87bc980b0dc04ea7d2b87e35f2c62f1290d391ce
Contract: Delegator
Contract Address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
Block: 2
Paid: 0.000235481936845743 ETH (268701 gas * 0.876371643 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0xf28037029569bfef5c38e7fe452264cb9f7916a678d5f0152282be661c8fd696
Contract: MathLib
Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Block: 2
Paid: 0.000562273911547299 ETH (641593 gas * 0.876371643 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0xbad5984e306d6842b23bb3ed3f2b0f2645f0835ea0bab6ab4cc9eb825aa8ca68
Contract: Logger
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000164597000164597 ETH (164597 gas * 1.000000001 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x470f62ec658655e666fc6d099d3c9e50462fbf4ae99a5654b4cd2310a01aa8b5
Contract: PaymentSplitter
Contract Address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Block: 2
Paid: 0.000138763809580977 ETH (158339 gas * 0.876371643 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001101116658138616 ETH (1233230 gas * avg 0.907278732 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code2/cross-contract/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-28/Assignment/code2/cross-contract/cache/Deploy.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code2/cross-contract$ cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "split()" --value 1ether --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x0f288b11221673bb1d06e692db7b4bbf8531d01c703f9e09bec45dc0733ba475
blockNumber          4
contractAddress      
cumulativeGasUsed    55207
effectiveGasPrice    677800830
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              55207
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0x3e1894d7e5ba3dfb240ddf6d3390755ada5392a7ebcb4b2b1aff09d6ee9912b1","0x000000000000000000000000e7f1725e7734ce288f8367e1bb143e90bb3f0512"],"data":"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e73706c6974206578656375746564000000000000000000000000000000000000","blockHash":"0x0f288b11221673bb1d06e692db7b4bbf8531d01c703f9e09bec45dc0733ba475","blockNumber":"0x4","blockTimestamp":"0x6a749deb","transactionHash":"0xfbb730cdabb323f05fb1f870efc4af7b7fca1c6f2b17fec6e370ecdd2dd151d0","transactionIndex":"0x0","logIndex":"0x0","removed":false},{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0xb20b10d17e0e2505af41fd37a6a1b46824a76d7d940afce430c7ee4aba19a959"],"data":"0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000006f05b59d3b20000","blockHash":"0x0f288b11221673bb1d06e692db7b4bbf8531d01c703f9e09bec45dc0733ba475","blockNumber":"0x4","blockTimestamp":"0x6a749deb","transactionHash":"0xfbb730cdabb323f05fb1f870efc4af7b7fca1c6f2b17fec6e370ecdd2dd151d0","transactionIndex":"0x0","logIndex":"0x1","removed":false}]
logsBloom            0x00000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000200000000000000000000000000000000000000000000080000000000040001000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000200000000000000100000000000000002000000000000000000000000000000000000000020000040000000000000000000401000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000
root                 
status               1 (success)
transactionHash      0xfbb730cdabb323f05fb1f870efc4af7b7fca1c6f2b17fec6e370ecdd2dd151d0
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-28/Assignment/code2/cross-contract$ cast balance 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545
10000500000000000000000
```
