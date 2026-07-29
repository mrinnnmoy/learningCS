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
1. Complete the Tutorial.md above (Vite scaffolded, ethers installed,
   MetaMask pointed at Anvil Local, Account 1 imported).

2. Deploy Counter to anvil, exactly Week 27's own Easy assignment:

     forge init counter-project --no-git
     cd counter-project

   Set solc = "0.8.36" under [profile.default] in foundry.toml, add
   src/Counter.sol (the exact contract from Week 27's Easy) and
   script/Deploy.s.sol, then:

     forge build

    Terminal 1 (keep running till the dev server is built):
      anvil

    Terminal 2 (simultaneously):
     forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
       --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
       --broadcast

   Note the deployed address.

3. Back in wallet-adapter/, create src/counter.ts, exporting the
   deployed address and the ABI (copy the `abi` field straight out of
   counter-project/out/Counter.sol/Counter.json — don't hand-type it).

4. Create index.html and src/main.ts from the Solution below.

5. Run the dev server:

     npm run dev

   Open the printed local URL in a browser with MetaMask installed
   and pointed at Anvil Local.
```

---

# Resources.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-32/Assignment/code1/counter-project$ forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 \
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
✅  [Success] Hash: 0x14b057a38205ed923c114588db337ddac22d4b3cd895bce0493d0345fe3cf822
Contract: Counter
Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block: 1
Paid: 0.000308883000308883 ETH (308883 gas * 1.000000001 gwei)

✅ Sequence #1 on anvil-hardhat | Total Paid: 0.000308883000308883 ETH (308883 gas * avg 1.000000001 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-32/Assignment/code1/counter-project/broadcast/Deploy.s.sol/31337/run-latest.json

Sensitive values saved to: /home/mrinnnmoy/projects/learningCS/WEB3/Week-32/Assignment/code1/counter-project/cache/Deploy.s.sol/31337/run-latest.json
```

---

# Output.

```html
Counter Current count: 1 Connected address:
0x70997970C51812dc3A010C7d01b50e0d17dc79C8 Connect Wallet Increment Confirmed in
block 2
```
