# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir freeze-and-multisig && cd freeze-and-multisig
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

   You should see: a freeze signature, a caught, printed transfer
   failure, a thaw signature, a successful transfer, a new multisig
   address, a second mint address, and a mint signature authorized
   through that multisig.

5. Verify the frozen-then-thawed account independently with the CLI.

   Run:
     spl-token account-info --address <VAULT_ATA_ADDRESS> --url devnet

   Confirm its State field reads Initialized (not Frozen) at this
   point, matching the script's final, thawed state.
```

---

# Resources.

```
Mint created: HwDybmxqmcJzANH8sSgvwXh6otxFMsFLp315mQi3aQDN
Your Vault-ATA-Address: 93tQ12Tx8ERvmomfBYMCgTfnFqGjrRNtDhDFzvJXthy5

Minted. Signature: 2DhHzHDMm8U4tvj7pLxa9yqsCiSbPnLUV9Vf3Qw5fUVEgG7kDPXqmQmqEDftox8F1UPQaDgR7qsWHgRyiyCy9PNB
```
