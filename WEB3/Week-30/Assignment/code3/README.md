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
1. Retrieve the raw private key behind Week 27's deployerKey keystore
   ONCE, so it can be stored in Hardhat's own separate encrypted
   keystore too — this is the same real wallet, just two different
   tools' own secret-storage mechanisms, not a new identity:

     cast wallet private-key --account deployerKey

   (Enter the Foundry keystore password when prompted. Copy the
   printed key immediately, in full — same caution as every previous
   week — and treat your terminal history as sensitive afterward.)

2. Foundry side: confirm funding, add the fork-reading script, and set
   a mainnet RPC endpoint alongside the existing Sepolia one in
   counter-foundry/foundry.toml:

     [rpc_endpoints]
     sepolia = "${SEPOLIA_RPC_URL}"
     mainnet = "${MAINNET_RPC_URL}"

   Run:
     export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
     
     export MAINNET_RPC_URL="https://ethereum-rpc.publicnode.com"
     
     cast balance $(cast wallet address --account deployerKey) --rpc-url sepolia

   If the balance looks too low, request more from the same faucet
   used in Week 27 before continuing. Create script/ReadUSDC.s.sol
   from the Solution below, then:

     forge script script/ReadUSDC.s.sol --fork-url mainnet

3. Foundry side: deploy and verify to Sepolia (deployments/sepolia.txt
   guard, same pattern as Week 27/29's Hard):

     mkdir -p deployments

     test -f deployments/sepolia.txt && echo "Already deployed" || \
       forge script script/Deploy.s.sol --rpc-url sepolia --account deployerKey --broadcast

     echo "<FOUNDRY_SEPOLIA_ADDRESS>" > deployments/sepolia.txt

     // To get an etherscan-api-key go to it's official website and obtain one.
     // Better to keep the api-key as an environment variable.

     export ETHERSCAN_API_KEY="your_actual_api_key"

     forge verify-contract <FOUNDRY_SEPOLIA_ADDRESS> src/Counter.sol:Counter \
       --chain sepolia --etherscan-api-key "$ETHERSCAN_API_KEY"

4. Hardhat side: store the same real secrets in Hardhat's own
   encrypted keystore (a SEPARATE store from Foundry's — this is
   expected, not a mistake):

     // Enter : https://ethereum-sepolia-rpc.publicnode.com
     npx hardhat keystore set SEPOLIA_RPC_URL

     // paste the key retrieved in step 1
     npx hardhat keystore set SEPOLIA_PRIVATE_KEY

     // Enter the api-key obtained from Etherscan
     npx hardhat keystore set ETHERSCAN_API_KEY

   Add a sepolia network entry and the mainnet fork network to
   hardhat.config.ts:

     import { configVariable } from "hardhat/config";

     networks: {
       sepolia: {
         type: "http",
         chainType: "l1",
         url: configVariable("SEPOLIA_RPC_URL"),
         accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
       },
       hardhatMainnet: {
         type: "edr-simulated",
         chainType: "l1",
         forking: { url: "https://ethereum-rpc.publicnode.com" },
       },
     },
     verify: {
       etherscan: { apiKey: configVariable("ETHERSCAN_API_KEY") },
     },

5. Hardhat side: run the fork-reading script, then deploy and verify
   to Sepolia in one step:

    <!-- Create the scripts directory first & build read-usdc.ts file -->
     mkdir -p scripts

     npx hardhat run scripts/read-usdc.ts --network hardhatMainnet
     
     npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
```

---

# Resource.

## counter-foundry.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry$ test -f deployments/sepolia.txt && echo "Already deployed" || forge script script/Deploy.s.sol --rpc-url sepolia --account deployerKey --broadcast
Enter keystore password:
[⠊] Compiling...
No files changed, compilation skipped
Warning: Detected artifacts built from source files that no longer exist. Run `forge clean` to make sure builds are in sync with project files.
 - /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry/script/Counter.s.sol
Script ran successfully.

== Return ==
counter: contract Counter 0xe22F630A1AB30a145EAf7B2fA92d49687e796268

== Logs ==
  Counter deployed at: 0xe22F630A1AB30a145EAf7B2fA92d49687e796268

## Setting up 1 EVM.

==========================

Chain 11155111

Estimated gas price: 2.109227066 gwei

Estimated total gas used for script: 401547

Estimated amount required: 0.000846953800671102 ETH

==========================

##### sepolia
✅  [Success] Hash: 0x9659effeb5f186495b59d6d410514376e11a7ccd185852a2cb69df185567d12b
Contract: Counter
Contract Address: 0xe22F630A1AB30a145EAf7B2fA92d49687e796268
Block: 11444545
Paid: 0.000339322341030564 ETH (308883 gas * 1.098546508 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.000339322341030564 ETH (308883 gas * avg 1.098546508 gwei)
                                                                                                                                     

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry/broadcast/Deploy.s.sol/11155111/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry/cache/Deploy.s.sol/11155111/run-latest.json
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry$ forge verify-contract 0xe22F630A1AB30a145EAf7B2fA92d49687e796268 src/Counter.sol:Counter \
  --chain sepolia \
  --etherscan-api-key "$ETHERSCAN_API_KEY"
Start verifying contract `0xe22F630A1AB30a145EAf7B2fA92d49687e796268` deployed on sepolia
ETHERSCAN_API_KEY is set, defaulting to Etherscan verifier. Unset it or pass `--verifier sourcify` (or another provider) to override.

Submitting verification for [src/Counter.sol:Counter] 0xe22F630A1AB30a145EAf7B2fA92d49687e796268.
Submitted contract for verification:
        Response: `OK`
        GUID: `v9sesd7j3jrjwqgvtswsrkanku8heeteaaygu2pgrfhezwk8a1`
        URL: https://sepolia.etherscan.io/address/0xe22f630a1ab30a145eaf7b2fa92d49687e796268
```

## counter-hardhat.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-hardhat$ npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia --verify
[hardhat-keystore] Enter the password: ***********
✔ Confirm deploy to network sepolia (11155111)? … yes

Hardhat Ignition 🚀

Deploying [ CounterModule ]

Batch #1
  Executed CounterModule#Counter

[ CounterModule ] successfully deployed 🚀

Deployed Addresses

CounterModule#Counter - 0x354d675748afEff040efA06966735AedfBDd7c56

Verifying deployed contracts


Verifying contract "contracts/Counter.sol:Counter" for network sepolia...

=== Etherscan ===

📤 Submitted source code for verification on Etherscan:

  contracts/Counter.sol:Counter
  Address: 0x354d675748afEff040efA06966735AedfBDd7c56

⏳ Waiting for verification result...


✅ Contract verified successfully on Etherscan!

  contracts/Counter.sol:Counter
  Explorer: https://sepolia.etherscan.io/address/0x354d675748afEff040efA06966735AedfBDd7c56#code

=== Blockscout ===

📤 Submitted source code for verification on Blockscout:

  contracts/Counter.sol:Counter
  Address: 0x354d675748afEff040efA06966735AedfBDd7c56

⏳ Waiting for verification result...


✅ Contract verified successfully on Blockscout!

  contracts/Counter.sol:Counter
  Explorer: https://eth-sepolia.blockscout.com/address/0x354d675748afEff040efA06966735AedfBDd7c56#code

=== Sourcify ===

The contract at 0x354d675748afEff040efA06966735AedfBDd7c56 has already been verified on Sourcify.

If you need to verify a partially verified contract, please use the --force flag.

Explorer: https://sourcify.dev/server/repo-ui/11155111/0x354d675748afEff040efA06966735AedfBDd7c56
```

---

# Output.

## counter-foundry.


```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry$ forge script script/ReadUSDC.s.sol --fork-url mainnet
[⠊] Compiling...
[⠃] Compiling 1 files with Solc 0.8.36
[⠊] Solc 0.8.36 finished in 723.81ms
Compiler run successful!
Warning: Detected artifacts built from source files that no longer exist. Run `forge clean` to make sure builds are in sync with project files.
 - /home/mrinnnmoy/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-foundry/script/Counter.s.sol
Script ran successfully.

== Logs ==
  Real USDC totalSupply, read via a local mainnet fork: 49529071808446519
```

## counter-hardhat.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-30/Assignment/code3/counter-hardhat$ npx hardhat run scripts/read-usdc.ts --network hardhatMainnet


Real USDC totalSupply, read via a local mainnet fork: 49529205571510632
```