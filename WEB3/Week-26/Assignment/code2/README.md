# How to Build.

```
1. Scaffold the project (same pattern as Easy).

   Run:
     mkdir fee-inspector && cd fee-inspector
     npm init -y
     npm install ethers
     npm install -D typescript tsx @types/node

2. Create tsconfig.json and index.ts from the Solution section below.

3. Run it.

   Run:
     npx tsx index.ts

   You should see the latest block's base fee and fullness
   percentage, the network's current suggested fee data, an
   estimated total cost for a plain transfer, and five consecutive
   blocks' base fees printed in sequence.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-26/Assignment/code2$ npx tsx index.ts
Latest block: 11415621
  Base fee: 1101417668 wei (1.101417668 gwei)
  Fullness: 23821712 / 60000000 gas (39.7%)
  Below 50% full — base fee should FALL next block (Concept 4).

Current suggested fee data:
  maxFeePerGas:         2.203835336 gwei
  maxPriorityFeePerGas: 0.001 gwei

Estimated cost of a plain ETH transfer (21000 gas):
  ~0.000046280542056 ETH (an upper bound — the actual charge uses the real base fee at inclusion time, never more than maxFeePerGas)

Base fee across the 5 most recent blocks (Concept 4's adjustment, in action):
  Block 11415621: 1.101417668 gwei
  Block 11415620: 0.979052062 gwei
  Block 11415619: 1.028951141 gwei
  Block 11415618: 1.035011378 gwei
  Block 11415617: 1.063320792 gwei
```