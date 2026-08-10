# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. Foundry side — scaffold and deploy the multisig to anvil (running
   from the Tutorial pattern established since Week 27):

     forge init multisig-contract --no-git
     cd multisig-contract

   Set solc = "0.8.36" under [profile.default] in foundry.toml,
   create src/SimpleMultisig.sol and script/DeployMultisig.s.sol from
   the Solution below, then:

     forge build
     forge script script/DeployMultisig.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Note the deployed address.

2. TypeScript side — scaffold, copy Medium's own finiteField.ts and
   shamir.ts unchanged, and create src/compareGasCosts.ts from the
   Solution below (filling in the real deployed multisig address).

     cd ../comparison-script
     npm init -y
     npm install ethers@6.17.0
     npm install -D typescript tsx @types/node

3. Run the full comparison.

     npx tsx src/compareGasCosts.ts
```

---

# Resource.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code3/multisig-contract$ forge script script/DeployMultisig.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
[⠒] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
multisig: contract SimpleMultisig 0x5FbDB2315678afecb367f032d93F642f64180aa3

== Logs ==
  SimpleMultisig deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3

## Setting up 1 EVM.

==========================

Chain 31337

Estimated gas price: 2.000000001 gwei

Estimated total gas used for script: 1652885

Estimated amount required: 0.003305770001652885 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0xb20f31248f73e0cf27fbe407d2de834cd7c6a47f260f0338f7282a0d4192c40f
Block: 2
Paid: 0.000018642286516055 ETH (21055 gas * 0.885409001 gwei)


##### anvil-hardhat
✅  [Success] Hash: 0x79bc2e4a66f8c8e58447920573fb40c6b43e44761fb97d3928d003466286f15d
Contract: SimpleMultisig
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.00124908000124908 ETH (1249080 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.001267722287765135 ETH (1270135 gas * avg 0.942704501 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-38/Assignment/code3/multisig-contract/broadcast/DeployMultisig.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-38/Assignment/code3/multisig-contract/cache/DeployMultisig.s.sol/31337/run-latest.json
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-38/Assignment/code3/comparison-script$ npx tsx src/compareGasCosts.ts
========================================
WEEK 38 — MULTISIG VS MPC-STYLE
========================================
RPC: http://127.0.0.1:8545
Chain ID: 31337
Multisig: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Recipient: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

========================================
MULTISIG FLOW
========================================
Owner 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Owner 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Owner 0 nonce: 2
Owner 1 nonce: 0

--- 1. SUBMIT ---
submit tx: 0xbc9af70ce04ce96a0266c0e9a6600c4b74ed3c91b29ffc6c7f274d58d8055f8d
submit gas: 101411
created multisig txId: 0

--- 2. CONFIRM — OWNER 0 ---
confirm 0 tx: 0x378aaa2ac1b1acdf33e6c8b4ab8a2253c35132b631834cd039c187488c72b554
confirm 0 gas: 74860

--- 3. CONFIRM — OWNER 1 ---
confirm 1 tx: 0xbff4eb895690473ecd2b6ad2334b7fb166601606e57a49e99f379813c92d3ce2
confirm 1 gas: 57760

--- 4. EXECUTE ---
execute tx: 0x7267eb89fe91e6cde1d43900261ff05c7a53517d0bfbfc31eb3552d3276b3a76
execute gas: 67875

Multisig txId: 0
Multisig total gas: 301906

========================================
MPC-STYLE / RECONSTRUCT-THEN-SIGN
========================================
Original wallet: 0x421b5af6CD29cf68DB56E3697E93Ff0879E81b44
Generated 3 Shamir shares.
Reconstructed wallet: 0x421b5af6CD29cf68DB56E3697E93Ff0879E81b44
Key reconstruction verified.

Funding reconstructed wallet...
Funding tx: 0xe6b211236a7637a36fa3074234584e82806fd45b755972a432abed3b540f98a2

MPC-style transaction: 0xd9adcbaa0247f4a7779c76cef330e6507ba050c1642be0d9509d99609d4e1d6b
MPC-style gas: 21000
MPC-style from: 0x421b5af6CD29cf68DB56E3697E93Ff0879E81b44
MPC-style to: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
MPC-style logs: 0

========================================
FINAL COMPARISON
========================================
Multisig flow — 4 separate transactions: 301906 gas
MPC-style flow — 1 ordinary transaction: 21000 gas
Ratio: 14.4 x more gas for the multisig flow

On-chain footprint:
  Multisig:
    submit → confirm → confirm → execute
  MPC-style:
    one ordinary EOA transaction

Important limitation:
  The MPC-style side reconstructs the complete
  private key in one place before signing.
  This demonstrates the on-chain footprint
  comparison, NOT production MPC signing.
```
