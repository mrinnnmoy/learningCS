# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir spl-token-basics && cd spl-token-basics
     npm init -y
     npm install @solana/spl-token @solana/web3.js
     npm install -D typescript tsx @types/node

2. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

3. Create tsconfig.json and index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see the new mint's address, your ATA's address, a mint
   transaction signature, and both raw and human-readable supply and
   balance figures, with no errors.

5. Note the printed mint address — Medium and Hard both reuse it.

6. Verify independently with the spl-token CLI.

   Run:
     spl-token supply <MINT_ADDRESS> --url devnet
     spl-token balance <MINT_ADDRESS> --url devnet

   Both should match what index.ts printed.
```

---

# Resources.

```
Mint created: HwDybmxqmcJzANH8sSgvwXh6otxFMsFLp315mQi3aQDN
Your ATA: 93tQ12Tx8ERvmomfBYMCgTfnFqGjrRNtDhDFzvJXthy5

Minted. Signature: 2DhHzHDMm8U4tvj7pLxa9yqsCiSbPnLUV9Vf3Qw5fUVEgG7kDPXqmQmqEDftox8F1UPQaDgR7qsWHgRyiyCy9PNB
```
