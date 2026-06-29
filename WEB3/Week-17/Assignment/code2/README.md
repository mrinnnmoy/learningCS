# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir transfer-and-burn && cd transfer-and-burn
     npm init -y
     npm install @solana/spl-token @solana/web3.js
     npm install -D typescript tsx @types/node

2. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

3. Create tsconfig.json and index.ts from the Solution section below,
   pasting Easy's mint address into MINT_ADDRESS.

4. Run it.

   Run:
     npx tsx index.ts

   You should see the vault owner PDA, the vault ATA's address, a
   transfer signature with both balances afterward, then a burn
   signature with your balance and the mint's supply afterward.

5. Re-run npx tsx index.ts a second time, unchanged.
```

---

# Resources.

```
Mint created: HwDybmxqmcJzANH8sSgvwXh6otxFMsFLp315mQi3aQDN
Your ATA: 93tQ12Tx8ERvmomfBYMCgTfnFqGjrRNtDhDFzvJXthy5

Minted. Signature: 2DhHzHDMm8U4tvj7pLxa9yqsCiSbPnLUV9Vf3Qw5fUVEgG7kDPXqmQmqEDftox8F1UPQaDgR7qsWHgRyiyCy9PNB
```
