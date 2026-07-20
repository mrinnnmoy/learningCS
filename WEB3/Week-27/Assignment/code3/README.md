# How to Build.

```
1. Scaffold, copying Medium's contracts in rather than rewriting them.

   Run:
     forge init task-registry-live --no-git
     cd task-registry-live
     cp ../../code2/task-registry/src/Ownable.sol src/Ownable.sol
     cp ../../code2/task-registry/src/TaskRegistry.sol src/TaskRegistry.sol
     rm src/Counter.sol script/Counter.s.sol 2>/dev/null
     mkdir -p deployments

   (Adjust the ../../code2/task-registry path to wherever Medium's
   project actually lives.)

2. Set the solc pin (same as Easy/Medium) and add a Sepolia RPC
   endpoint to foundry.toml:

     [profile.default]
     solc = "0.8.36"

     [rpc_endpoints]
     sepolia = "${SEPOLIA_RPC_URL}"

   Export the RPC URL in your shell:

     export SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"

3. Create your own first real wallet for this course. Foundry stores
   it encrypted, not as a raw private key in a file.

   If you don't already have a wallet:

     cast wallet new

   Then import it into Foundry's encrypted keystore:

     cast wallet import deployerKey --interactive

   (Enter either the private key you just generated with
   `cast wallet new`, or one you already control, then choose a
   password to encrypt it locally.)

4. Fund that wallet with Sepolia ETH from any public faucet (search
   "Sepolia faucet" for a current one). A small amount of test ETH is
   sufficient for this assignment.

   Check the balance:

     cast balance $(cast wallet address --account deployerKey) \
       --rpc-url sepolia

5. Create script/Deploy.s.sol from the Solution below.

6. Build and deploy.

   Build:

     forge build

   If deployments/sepolia.txt already exists, reuse that deployment:

     test -f deployments/sepolia.txt && \
       echo "Already deployed:" && \
       cat deployments/sepolia.txt

   If nothing is printed, deploy:

     forge script script/Deploy.s.sol \
       --rpc-url sepolia \
       --account deployerKey \
       --broadcast

   (Foundry prompts for your keystore password.)

   Save the deployed address:

     echo "<DEPLOYED_ADDRESS>" > deployments/sepolia.txt

   Replace <DEPLOYED_ADDRESS> with the address printed by the deploy
   script.

7. Create a task and read it back for real (replace <ADDRESS> with
   your deployed contract's address):

     cast send <ADDRESS> "createTask(string)" "Ship Week 27" \
       --rpc-url sepolia \
       --account deployerKey

     cast call <ADDRESS> \
       "getTask(uint256)((uint256,string,address,uint8))" \
       0 \
       --rpc-url sepolia
```

---

# For someone cloning.

Simply reinstall the dependencies.

```
forge install foundry-rs/forge-std
forge build
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-27/Assignment/code3/task-registry-live$ forge script script/Deploy.s.sol \
  --rpc-url sepolia \
  --account deployerKey \
  --broadcast
Enter keystore password:
[⠊] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Return ==
registry: contract TaskRegistry 0xef7EC7E600A1e8486915C8E0A87184A36073357c

== Logs ==
  TaskRegistry deployed at: 0xef7EC7E600A1e8486915C8E0A87184A36073357c
  Save this address into deployments/sepolia.txt

## Setting up 1 EVM.

==========================

Chain 11155111

Estimated gas price: 2.252098618 gwei

Estimated total gas used for script: 1505563

Estimated amount required: 0.003390676351611934 ETH

==========================

##### sepolia
✅  [Success] Hash: 0xb7636fc10adb25c0bf8bb46b4243d9580b2f56a2eee38abc55b6766750219c6c
Contract: TaskRegistry
Contract Address: 0xef7EC7E600A1e8486915C8E0A87184A36073357c
Block: 11422139
Paid: 0.001264106368522098 ETH (1158126 gas * 1.091510223 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.001264106368522098 ETH (1158126 gas * avg 1.091510223 gwei)
                                                                                                                                     

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code3/task-registry-live/broadcast/Deploy.s.sol/11155111/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code3/task-registry-live/cache/Deploy.s.sol/11155111/run-latest.json
```