# How to Build.

```
1. Complete the Tutorial section above first (Foundry installed,
   forge --version confirmed, anvil running in its own terminal).

2. Scaffold the project.

   Run:
     forge init counter --no-git
     cd counter

3. Set the solc pin in foundry.toml (add under [profile.default]):
     solc = "0.8.36"

4. Replace src/Counter.sol with the Solution below, and add
   script/Deploy.s.sol from the Solution too:
     rm src/Counter.sol
     (then create src/Counter.sol and script/Deploy.s.sol from Solution)

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

   Copy the deployed address the script logs — the Manual Test Cases
   below refer to it as <ADDRESS>.
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
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-27/Assignment/code1/counter$ forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
[⠊] Compiling...
No files changed, compilation skipped
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

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code1/counter/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-27/Assignment/code1/counter/cache/Deploy.s.sol/31337/run-latest.json
```
