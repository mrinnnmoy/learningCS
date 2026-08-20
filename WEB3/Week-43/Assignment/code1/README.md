# For someone cloning.

Simply reinstall the dependencies.

```
cd l2-easy
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Scaffold, reusing Week 27's own Counter.sol directly.

     forge init l2-easy --no-git
     cd l2-easy

2. Set solc = "0.8.36" under [profile.default] in foundry.toml, and
   add Base Sepolia as a named RPC endpoint:

     [rpc_endpoints]
     sepolia = "https://ethereum-sepolia-rpc.publicnode.com"
     base_sepolia = "https://sepolia.base.org"

3. Create src/Counter.sol (Week 27's own, unchanged) and
   script/Deploy.s.sol from the Solution below.

4. Deploy to Base Sepolia, reusing the SAME deployerKey wallet already
   used throughout this course (an L2 account is just an ordinary
   Ethereum address — the identical key controls it on any
   EVM-equivalent chain):

     cast balance $(cast wallet address --account deployerKey) --rpc-url base_sepolia

   If the balance is low, Base Sepolia has real, currently-reliable
   faucets with no mainnet-balance requirement — the Base Sepolia
   Faucet itself, Bware Labs, or Coinbase's own Developer Platform
   faucet (up to 0.1 ETH/24h) are all good current options. L2 ETH
   is NOT automatically available just because a Sepolia L1 balance
   exists, it has to be bridged (Medium's own assignment) or
   faucet-funded independently first.

     forge script script/Deploy.s.sol --rpc-url base_sepolia --account deployerKey --broadcast
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ forge script script/Deploy.s.sol --rpc-url base_sepolia --account deployerKey --broadcast
Enter keystore password:
[⠊] Compiling...
[⠘] Compiling 17 files with Solc 0.8.36
[⠃] Solc 0.8.36 finished in 690.83ms
Compiler run successful!
Script ran successfully.

== Return ==
counter: contract Counter 0xef7EC7E600A1e8486915C8E0A87184A36073357c

== Logs ==
  Counter deployed on chain ID: 84532
  Counter deployed at: 0xef7EC7E600A1e8486915C8E0A87184A36073357c

## Setting up 1 EVM.

==========================

Chain 84532

Estimated gas price: 0.011 gwei

Estimated total gas used for script: 401547

Estimated amount required: 0.000004417017 ETH

==========================

##### base-sepolia
✅  [Success] Hash: 0x57223cb24c7bf087648fa657cf49ff888a5907160a17088c82a7ba91872fb9c5
Contract: Counter
Contract Address: 0xef7EC7E600A1e8486915C8E0A87184A36073357c
Block: 46018451
Paid: 0.000001853298 ETH (308883 gas * 0.006 gwei)

✅ Sequence #1 on base-sepolia | Total Paid: 0.000001853298 ETH (308883 gas * avg 0.006 gwei)
                                                                                                                                    

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy/broadcast/Deploy.s.sol/84532/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy/cache/Deploy.s.sol/84532/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ cast send 0xef7EC7E600A1e8486915C8E0A87184A36073357c "increment()" --rpc-url base_sepolia --account deployerKey
Enter keystore password:

blockHash            0x0000000000000000000000000000000000000000000000000000000000000000
blockNumber          46018534
contractAddress      
cumulativeGasUsed    2006588
effectiveGasPrice    6000000
from                 0xBe1A491A93822eB244F111Ce83baA0B2C617c305
gasUsed              45253
logs                 [{"address":"0xef7ec7e600a1e8486915c8e0a87184a36073357c","topics":["0xe0f448a944ad156cccd5f27c087eb07776cb4d0d63ddaa317967069a485c8303","0x000000000000000000000000be1a491a93822eb244f111ce83baa0b2c617c305"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0x0000000000000000000000000000000000000000000000000000000000000000","blockNumber":"0x2be2fe6","blockTimestamp":"0x6a8fbeac","transactionHash":"0x70c9e84ea29148b1d51a4aa8b15760f1e1e03450330213e8129011cf06b502be","transactionIndex":"0xd","logIndex":"0x54","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000020000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000004000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000020000000000400000000000
root                 
status               1 (success)
transactionHash      0x70c9e84ea29148b1d51a4aa8b15760f1e1e03450330213e8129011cf06b502be
transactionIndex     13
type                 2
blobGasPrice         
blobGasUsed          44600
to                   0xef7EC7E600A1e8486915C8E0A87184A36073357c
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ cast call 0xef7EC7E600A1e8486915C8E0A87184A36073357c "getCount()(uint256)" --rpc-url base_sepolia
1
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ cast gas-price --rpc-url base_sepolia
6000000
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ cast gas-price --rpc-url sepolia
959732019
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-43/Assignment/code1/l2-easy$ cast receipt 0x70c9e84ea29148b1d51a4aa8b15760f1e1e03450330213e8129011cf06b502be --rpc-url base_sepolia

blockHash            0x492de1e15f4a6cb0589147c5e99e67ff923bea54028479984efd11b4ecbe76e3
blockNumber          46018534
contractAddress      
cumulativeGasUsed    2006588
effectiveGasPrice    6000000
from                 0xBe1A491A93822eB244F111Ce83baA0B2C617c305
gasUsed              45253
logs                 [{"address":"0xef7ec7e600a1e8486915c8e0a87184a36073357c","topics":["0xe0f448a944ad156cccd5f27c087eb07776cb4d0d63ddaa317967069a485c8303","0x000000000000000000000000be1a491a93822eb244f111ce83baa0b2c617c305"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0x492de1e15f4a6cb0589147c5e99e67ff923bea54028479984efd11b4ecbe76e3","blockNumber":"0x2be2fe6","blockTimestamp":"0x6a8fbeac","transactionHash":"0x70c9e84ea29148b1d51a4aa8b15760f1e1e03450330213e8129011cf06b502be","transactionIndex":"0xd","logIndex":"0x54","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000020000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000004000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000020000000000400000000000
root                 
status               1 (success)
transactionHash      0x70c9e84ea29148b1d51a4aa8b15760f1e1e03450330213e8129011cf06b502be
transactionIndex     13
type                 2
blobGasPrice         
blobGasUsed          44600
to                   0xef7EC7E600A1e8486915C8E0A87184A36073357c
daFootprintGasScalar 446
l1BaseFeeScalar      1101
l1BlobBaseFee        64247941
l1BlobBaseFeeScalar  659851
l1Fee                6083778767
l1GasPrice           1046986805
l1GasUsed            1600
```