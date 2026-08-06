# How to build.

```
1. From the bridge-relayer/ project scaffolded in the Tutorial, add
   a tsconfig.json (a standard, minimal Node/ESM one works fine here)
   and create src/config.ts with Easy's own real deployed addresses
   and the two contracts' ABIs (copy straight out of
   bridge-easy/out/LockBox.sol/LockBox.json and
   bridge-easy/out/WrappedToken.sol/WrappedToken.json — don't hand-type
   them, exactly Week 32's own advice).

2. Create src/relayer.ts from the Solution below.

3. Run it as its own long-running process, in its own terminal —
   leave it running for the rest of this assignment's own Manual Test
   Cases:

     npx tsx src/relayer.ts
```

# Resources.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code2/bridge-relayer$ npx tsx src/relayer.ts
[relayer] started — watching Chain A, minting on Chain B
[relayer] nothing new and confirmed yet (current=2, safe=-1)
[relayer] nothing new and confirmed yet (current=2, safe=-1)
[relayer] nothing new and confirmed yet (current=2, safe=-1)
...
[relayer] nothing new and confirmed yet (current=3, safe=0)
[relayer] nothing new and confirmed yet (current=3, safe=0)
[relayer] scanning blocks 1-1: found 0 Locked event(s)
[relayer] nothing new and confirmed yet (current=4, safe=1)
[relayer] nothing new and confirmed yet (current=4, safe=1)
[relayer] nothing new and confirmed yet (current=4, safe=1)
...
[relayer] nothing new and confirmed yet (current=4, safe=1)
[relayer] nothing new and confirmed yet (current=4, safe=1)
[relayer] scanning blocks 2-4: found 1 Locked event(s)
[relayer] relaying: user=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 amount=100000000000000000000 nonce=0
[relayer] minted on Chain B — tx 0xd66c1f3d842c2952ad074a5b52e46923fd999e638be102ccd4630cd287fd4fa7, block 2
[relayer] nothing new and confirmed yet (current=7, safe=4)
[relayer] nothing new and confirmed yet (current=7, safe=4)
...
[relayer] nothing new and confirmed yet (current=7, safe=4)
```

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code2/bridge-relayer$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "approve(address,uint256)" 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 100000000000000000000 \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x2415f3c7c4efc847decaad7171d6cf53129d07a57c8a31a214ffabcecf9df9e6
blockNumber          3
contractAddress      
cumulativeGasUsed    44773
effectiveGasPrice    774213137
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              44773
logs                 []
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x1939ba92618be23903c130964ca296787fdb62bd764fc452954f65b169f0e20f
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code2/bridge-relayer$ cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "lock(uint256)" 100000000000000000000 \
       --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x4eedf294bd1d30bc08a7ba38b3dfbe066171c8ff6ebf678b166f2aa2c3e7da41
blockNumber          4
contractAddress      
cumulativeGasUsed    79209
effectiveGasPrice    677725361
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              79209
logs                 [{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0x44cebfefa4561bee5b61d675ccfd8dc9969fff9cc15e7a4eccccd62af94f9c11","0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266","0x0000000000000000000000000000000000000000000000000000000000000000"],"data":"0x0000000000000000000000000000000000000000000000056bc75e2d631000000000000000000000000000000000000000000000000000000000000000007a69","blockHash":"0x4eedf294bd1d30bc08a7ba38b3dfbe066171c8ff6ebf678b166f2aa2c3e7da41","blockNumber":"0x4","blockTimestamp":"0x6a869248","transactionHash":"0xa6690e872ef8bce233697c6571c34a364a604dd2f0ed3d07f108fe8f755e3c2b","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000100000800000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000001000000000002000000000000000000020000000000000000000080000000000000000004000000000800000000000000000
root                 
status               1 (success)
transactionHash      0xa6690e872ef8bce233697c6571c34a364a604dd2f0ed3d07f108fe8f755e3c2b
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

```
<!-- Important Note -->
// Just in case, if the relayer doesn't immediately react to an unconfirmed Locked event; it waits until three additional blocks exist.
// In that case, when you need to demonstrate the 3-confirmation behavior, manually advance Anvil:
// cast rpc anvil_mine 3 --rpc-url http://127.0.0.1:8545

mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-37/Assignment/code2/bridge-relayer$ cast call \
  0x5FbDB2315678afecb367f032d93F642f64180aa3 \
  "balanceOf(address)(uint256)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
  --rpc-url http://127.0.0.1:8546
100000000000000000000 [1e20]
```