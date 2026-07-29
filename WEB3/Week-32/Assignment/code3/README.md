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
1. Confirm the exact Sepolia Counter address to use (see Requirements
   above) before changing anything.

2. Update src/counter.ts's COUNTER_ADDRESS to that real address.

3. Add a network status banner and "Switch to Sepolia" button to
   index.html, and the chain-detection/switching logic from the
   Solution below to src/main.ts.

4. Point readOnlyProvider at Sepolia too, matching the network the
   deployed contract actually lives on — the same public endpoint
   every previous week's Hard has used:

     const readOnlyProvider = new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");

5. Run the dev server, open it with MetaMask connected to whatever
   network it currently happens to be on — the whole point of this
   assignment is confirming the detection/switch flow handles that
   correctly regardless of the starting state.
```

---

# Resources.

```
Counter contract : 0xe22F630A1AB30a145EAf7B2fA92d49687e796268
```

---