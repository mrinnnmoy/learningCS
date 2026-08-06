# How to Build.

```
1. Extend src/relayer.ts with the Solution below's own second poll
   loop (bidirectional relaying), and restart the relayer process.

2. For the reorg simulation, work directly against Chain A's own RPC
   endpoint with cast — no contract or script changes needed, this
   test case exercises the relayer's own EXISTING confirmations logic
   against a genuinely different chain-state scenario.

3. For the replay attempt, use cast send directly against the live
   Chain B deployment, copying the exact parameters an earlier,
   successful relay used.
```

# Resources.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ npx tsx src/relayer.ts
[relayer] started — watching Chain A ↔ Chain B
[relayer] confirmations required: 3
[relayer] polling interval: 5000ms
[relayer] LockBox: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
[relayer] WrappedToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
[relayer] relayer address on Chain A: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
[relayer] relayer address on Chain B: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
[relayer] Chain A: scanning blocks 1-4: found 1 Locked event(s)
[relayer] Chain A Locked event: user=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 amount=100000000000000000000 nonce=0 sourceChainId=31337 block=4
[relayer] relaying nonce 0 from Chain A → Chain B...
[relayer] failed to relay nonce 0: execution reverted (unknown custom error)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: scanning blocks 5-5: found 0 Locked event(s)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: scanning blocks 6-6: found 0 Locked event(s)
...
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
[relayer] Chain A: nothing new and confirmed yet (current=7, safe=4)
[relayer] Chain B: nothing new and confirmed yet (current=2, safe=-1)
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ cast rpc evm_snapshot --rpc-url http://127.0.0.1:8545
0x0
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ cast send \
  0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "approve(address,uint256)" \
  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  50000000000000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x1894c942f2077d1244b7ab108be5aaf35fee8cde436b60e7c0557bd969ab2650
blockNumber          8
contractAddress      
cumulativeGasUsed    44773
effectiveGasPrice    397569855
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              44773
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x0cd908ddaa27f73f0742fd5b22b725c6bac14fcd3487d276b7fc0542eaaa2623
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ cast send \
  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "lock(uint256)" \
  50000000000000000000 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0xef1adacaad45252a5eb0f34d1d4cea1948a309b1aa95ad55e22dd25952721e91
blockNumber          9
contractAddress      
cumulativeGasUsed    45009
effectiveGasPrice    348021960
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              45009
logs                 [{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0x44cebfefa4561bee5b61d675ccfd8dc9969fff9cc15e7a4eccccd62af94f9c11","0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266","0x0000000000000000000000000000000000000000000000000000000000000001"],"data":"0x000000000000000000000000000000000000000000000002b5e3af16b18800000000000000000000000000000000000000000000000000000000000000007a69","blockHash":"0xef1adacaad45252a5eb0f34d1d4cea1948a309b1aa95ad55e22dd25952721e91","blockNumber":"0x9","blockTimestamp":"0x6a869a9b","transactionHash":"0x5eff0cd761d532ce714df8e8dbcc7f9bb79f9c51989caecf351137e9629f8aca","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000040000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000100000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000001000000000002000000000000000000040000000000000000000080000000000000000004000000000800000000000000000
root                 
status               1 (success)
transactionHash      0x5eff0cd761d532ce714df8e8dbcc7f9bb79f9c51989caecf351137e9629f8aca
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ cast rpc evm_revert 0x0 --rpc-url http://127.0.0.1:8545
true
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code3/bridge-relayer$ cast send \
  0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "mint(address,uint256,uint256)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  100000000000000000000 \
  0 \
  --rpc-url http://127.0.0.1:8546 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted: custom error 0x57eee766, data: "0x57eee766": AlreadyProcessed
```