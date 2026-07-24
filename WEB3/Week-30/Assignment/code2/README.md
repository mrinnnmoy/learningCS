# For someone cloning.

Simply reinstall the dependencies.

```
cd counter-foundry
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Foundry: from counter-foundry/, add the deploy script, and make
   sure anvil is running in its own terminal (fresh restart is fine).

   Create script/Deploy.s.sol from the Solution below, then:
     forge build
     
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Note the deployed address — Manual Test Cases below call it
   <FOUNDRY_ADDRESS>.

2. Hardhat: from counter-hardhat/, start Hardhat's own local network
   in a separate terminal:

     npx hardhat node

   Create ignition/modules/Counter.ts from the Solution below, then,
   in your original terminal:

     npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost

   Note the deployed address — Manual Test Cases below call it
   <HARDHAT_ADDRESS>.

3. Gas reports, from each project's own root:

     (in counter-foundry/) forge test --gas-report
     (in counter-hardhat/) npx hardhat test --gas-stats
```

---

# Resource.

## counter-foundry.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Warning: Detected artifacts built from source files that no longer exist. Run `forge clean` to make sure buildsare in sync with project files.
 - /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry/script/Counter.s.sol
Script ran successfully.

== Return ==
counter: contract Counter 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  Counter deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 401547

Estimated amount required: 0.000803094000401547 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x2edb1bc920bf8f7e4d9ea1dbc3fdc535f198d534acca9def24948608b6b4a7db
Contract: Counter
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000308883000308883 ETH (308883 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000308883000308883 ETH (308883 gas * avg 1.000000001 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry/cache/Deploy.s.sol/31337/run-latest.json
```

## counter-hardhat.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-hardhat$ npx hardhat ignition deploy ignition/modules/Counter.ts --network localhost

Hardhat Ignition 🚀

Deploying [ CounterModule ]

Batch #1
  Executed CounterModule#Counter

[ CounterModule ] successfully deployed 🚀

Deployed Addresses

CounterModule#Counter - 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

---

# Output.

## counter-foundry.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry$ cast send 0x5FbDB2315678afecb367f032d93F642f64180aa3 "increment()" --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x52aa44aab3754478149a0e640471382b626a9083c6bdfe29c670b776fb84877e
blockNumber          2
contractAddress      
cumulativeGasUsed    45253
effectiveGasPrice    877574026
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              45253
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0xe0f448a944ad156cccd5f27c087eb07776cb4d0d63ddaa317967069a485c8303","0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0x52aa44aab3754478149a0e640471382b626a9083c6bdfe29c670b776fb84877e","blockNumber":"0x2","blockTimestamp":"0x6a762288","transactionHash":"0x557b7b3ed6b26f738f9cb698b625548f3cfa0ea5ec9e4a62661a79954cf74e1b","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000040000000000000000100000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000004000000040000000200000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x557b7b3ed6b26f738f9cb698b625548f3cfa0ea5ec9e4a62661a79954cf74e1b
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry$ cast call 0x5FbDB2315678afecb367f032d93F642f64180aa3 "getCount()(uint256)" --rpc-url http://127.0.0.1:8545
1
```

## counter-hardhat.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-hardhat$ cast send 0x5FbDB2315678afecb
367f032d93F642f64180aa3 "increment()" \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb4
78cbed5efcae784d7bf4f2ff80 \
  --gas-limit 100000

blockHash            0x5b729123cfe23f905beac9337d4308f13752cd7a79e2ecc23b090a0f6434ada8
blockNumber          2
contractAddress      
cumulativeGasUsed    45022
effectiveGasPrice    1766366435
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              45022
logs                 [{"address":"0x5fbdb2315678afecb367f032d93f642f64180aa3","topics":["0xe0f448a944ad156cccd5f27c087eb07776cb4d0d63ddaa317967069a485c8303","0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"],"data":"0x0000000000000000000000000000000000000000000000000000000000000001","blockHash":"0x5b729123cfe23f905beac9337d4308f13752cd7a79e2ecc23b090a0f6434ada8","blockNumber":"0x2","transactionHash":"0x1f692dfcabffe3ffa5d862141b5e58d9f7fb6d569f0e4254ad0aa68abc2347bb","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000040000000000000000100000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000004000000040000000200000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
root                 
status               1 (success)
transactionHash      0x1f692dfcabffe3ffa5d862141b5e58d9f7fb6d569f0e4254ad0aa68abc2347bb
transactionIndex     0
type                 2
blobGasPrice         
blobGasUsed          
to                   0x5FbDB2315678afecb367f032d93F642f64180aa3
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-hardhat$ cast rpc eth_call '{"to":"0x5FbDB2315678afecb367f032d93F642f64180aa3","data":"0xa87d942c"}' latest
"0x0000000000000000000000000000000000000000000000000000000000000001"
```

---

# Gas Report.

## counter-foundry

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-foundry$ forge test --gas-report
[⠊] Compiling...
No files changed, compilation skipped

Ran 4 tests for test/Counter.t.sol:CounterTest
[PASS] testDecrementRevertsAtZero() (gas: 31592)
[PASS] testInitialCountIsZero() (gas: 7897)
[PASS] testOwnerCanIncrementBy() (gas: 54312)
[PASS] testStrangerCannotIncrementBy() (gas: 33708)
Suite result: ok. 4 passed; 0 failed; 0 skipped; finished in 1.68ms (1.34ms CPU time)

╭----------------------------------+-----------------+-------+--------+-------+---------╮
| src/Counter.sol:Counter Contract |                 |       |        |       |         |
+=======================================================================================+
| Deployment Cost                  | Deployment Size |       |        |       |         |
|----------------------------------+-----------------+-------+--------+-------+---------|
|                           308883 |            1282 |       |        |       |         |
|----------------------------------+-----------------+-------+--------+-------+---------|
|                                  |                 |       |        |       |         |
|----------------------------------+-----------------+-------+--------+-------+---------|
| Function Name                    | Min             | Avg   | Median | Max   | # Calls |
|----------------------------------+-----------------+-------+--------+-------+---------|
| decrement                        |           23363 | 23363 |  23363 | 23363 |       1 |
|----------------------------------+-----------------+-------+--------+-------+---------|
| getCount                         |            2475 |  2475 |   2475 |  2475 |       2 |
|----------------------------------+-----------------+-------+--------+-------+---------|
| incrementBy                      |           21849 | 33723 |  33723 | 45597 |       2 |
╰----------------------------------+-----------------+-------+--------+-------+---------╯


Ran 1 test suite in 4.91ms (1.68ms CPU time): 4 tests passed, 0 failed, 0 skipped (4 total tests)
```

## counter-hardhat

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code2/counter-hardhat$ npx hardhat test --gas-stats

Compiled 1 Solidity file with solc 0.8.36 (evm target: Check solc 0.8.36's doc for its default evm version)

Running Solidity tests


Running Mocha tests


  Counter
    ✔ starts at zero (760ms)
    ✔ lets the owner incrementBy
    ✔ reverts incrementBy for a non-owner
    ✔ reverts decrement at zero


  4 passing (850ms)


4 passing (4 mocha)

╔═══════════════════════════════════════════════════════════════════╗
║                       Gas Usage Statistics            ║
╚═══════════════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════════════╗
║ contracts/Counter.sol:Counter            ║
╟───────────────┬────────┬─────────┬────────┬────────┬──────────────╢
║ Function name │ Min    │ Average │ Median │ Max    │ #calls       ║
╟───────────────┼────────┼─────────┼────────┼────────┼──────────────╢
║ getCount      │ 23539  │ 23539   │ 23539  │ 23539  │ 2            ║
║ incrementBy   │ 45597  │ 45597   │ 45597  │ 45597  │ 1            ║
╟───────────────┼────────┼─────────┼────────┼────────┼──────────────╢
║ Deployment    │ Min    │ Average │ Median │ Max    │ #deployments ║
╟───────────────┼────────┼─────────┼────────┼────────┼──────────────╢
║               │ 308883 │ 308883  │ 308883 │ 308883 │ 4            ║
╟───────────────┼────────┼─────────┴────────┴────────┴──────────────╢
║ Bytecode size │ 1185   │            ║
╚═══════════════╧════════╧══════════════════════════════════════════╝


WARNING: hre.network.connect() is deprecated and will be removed in a future version. Use hre.network.create() or hre.network.getOrCreate() instead.
```