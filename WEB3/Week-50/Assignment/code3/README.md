# For someone cloning.

```
cd vault-contract
forge install forge-std
forge install OpenZeppelin/openzeppelin-contracts
forge build

cd ../monitoring
npm install
```

---

# How to Build.

```
1. Deploy GoodVault to anvil, reusing Week 39's own contract file
   unchanged.

     forge init vault-contract --no-git
     cd vault-contract
     forge install OpenZeppelin/openzeppelin-contracts
     echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' >> remappings.txt

   Copy GoodVault.sol from Week 39, create script/Deploy.s.sol, then:

     forge build
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

2. Scaffold the monitoring project.

     cd ../monitoring
     npm init -y
     npm install ethers@6.17.0
     npm install -D typescript tsx @types/node

3. Create src/monitor.ts from the Solution below, filling in the real
   deployed GoodVault address from step 1.

4. Run the monitor in its own terminal.

     npx tsx src/monitor.ts

5. From a SEPARATE terminal, trigger a real pause:

     cast send <GOODVAULT_ADDRESS> "pause()" --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

6. Fill in INCIDENT_RESPONSE_PLAN.md and KEY_MANAGEMENT_NOTES.md from
   their own starting templates.
```

---


# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code3/vault-contract$ forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
token: contract MockERC20 0x5FbDB2315678afecb367f032d93F642f64180aa3
vault: contract GoodVault 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

== Logs ==
  MockERC20 deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  GoodVault deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  GoodVault owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1811124

Estimated amount required: 0.003622248001811124 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x2647b358431dd39875f655fa81026d30f594094ad9431f1c6494eee1c3a28007
Contract: MockERC20
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000589987000589987 ETH (589987 gas * 1.000000001 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x67348de88ed4fbbf454d3c557a8c99bf5221564705a5cfad421dfded34cc59bf
Contract: GoodVault
Contract Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Block: 2
Paid: 0.00070673666216016 ETH (803186 gas * 0.87991656 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001296723662750147 ETH (1393173 gas * avg 0.93995828 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-50/Assignment/code3/vault-contract/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-50/Assignment/code3/vault-contract/cache/Deploy.s.sol/31337/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code3/monitoring$ cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "pause()" --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0xacff7c12b964162e5aec2bce7521fbea80b63c0c68fb6feec2909393aa7f56ad
blockNumber          3
contractAddress      
cumulativeGasUsed    28228
effectiveGasPrice    775816463
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              28228
logs                 [{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258"],"data":"0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266","blockHash":"0xacff7c12b964162e5aec2bce7521fbea80b63c0c68fb6feec2909393aa7f56ad","blockNumber":"0x3","blockTimestamp":"0x6a98f532","transactionHash":"0xe011443340b0bdc0fe770b6a6b769c59a85cfd1f771b72ce384b2fc3873faa33","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000
root                 
status               1 (success)
transactionHash      0xe011443340b0bdc0fe770b6a6b769c59a85cfd1f771b72ce384b2fc3873faa33
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code3/monitoring$ npx tsx src/monitor.ts
[monitor] watching GoodVault at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 for security-relevant events...

🚨🚨🚨 SECURITY ALERT 🚨🚨🚨
Time: 2026-09-03T04:19:01.837Z
Contract PAUSED by 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266. This is either a deliberate emergency response or a compromised admin key.
Action: see INCIDENT_RESPONSE_PLAN.md immediately.

```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code3/monitoring$ cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "unpause()" \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

blockHash            0x343302adfea8a590f668f754d6caf9335cdd68d68bd321eb92a2188b17cd0876
blockNumber          4
contractAddress      
cumulativeGasUsed    28158
effectiveGasPrice    679021904
from                 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
gasUsed              28158
logs                 [{"address":"0xe7f1725e7734ce288f8367e1bb143e90bb3f0512","topics":["0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa"],"data":"0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266","blockHash":"0x343302adfea8a590f668f754d6caf9335cdd68d68bd321eb92a2188b17cd0876","blockNumber":"0x4","blockTimestamp":"0x6a98f57c","transactionHash":"0x437f6d3fda75b63db4b5c974c54ba4ee6e287d57bfa5938f962b9110952ad633","transactionIndex":"0x0","logIndex":"0x0","removed":false}]
logsBloom            0x00000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000400
root                 
status               1 (success)
transactionHash      0x437f6d3fda75b63db4b5c974c54ba4ee6e287d57bfa5938f962b9110952ad633
transactionIndex     0
type                 2
blobGasPrice         1
blobGasUsed          
to                   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-50/Assignment/code3/monitoring$ npx tsx src/monitor.ts
[monitor] watching GoodVault at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 for security-relevant events...

🚨🚨🚨 SECURITY ALERT 🚨🚨🚨
Time: 2026-09-03T04:19:01.837Z
Contract PAUSED by 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266. This is either a deliberate emergency response or a compromised admin key.
Action: see INCIDENT_RESPONSE_PLAN.md immediately.


🚨🚨🚨 SECURITY ALERT 🚨🚨🚨
Time: 2026-09-03T04:20:14.137Z
Contract UNPAUSED by 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266. Confirm this was expected before assuming normal operation resumed.
Action: see INCIDENT_RESPONSE_PLAN.md immediately.


```