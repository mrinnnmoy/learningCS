# For someone cloning.

Simply reinstall the dependencies.

```
cd counter-project
forge install foundry-rs/forge-std
forge build
```

---

# How to Build.

```
1. From the same wallet-adapter/ project as Easy, still running
   npm run dev against the same anvil deployment.

2. Add an <input id="amountInput"> and <button id="incrementByBtn">
   to index.html.

3. Add the incrementBy handler from the Solution below to src/main.ts.
```

---

# Resources.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-32/Assignment/code2/counter-project$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
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

Estimated gas price: 2.656690898 gwei

Estimated total gas used for script: 401547

Estimated amount required: 0.001066786260019206 ETH

==========================

##### anvil-hardhat
✅  [Success] Hash: 0x5fef3b2839ee82eb27ac2b84f97d754bd8b935e3d3be0e412431c97d562717d9
Contract: Counter
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 4
Paid: 0.000554492205179742 ETH (308883 gas * 1.795152874 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000554492205179742 ETH (308883 gas * avg 1.795152874 gwei)
                                                        

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-32/Assignment/code2/counter-project/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-32/Assignment/code2/counter-project/cache/Deploy.s.sol/31337/run-latest.json
```

---