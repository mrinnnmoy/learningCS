# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir compliance-interest-token && cd compliance-interest-token
     npm init -y
     npm install @solana/spl-token @solana/web3.js
     npm install -D typescript tsx @types/node

2. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

3. Create tsconfig.json and index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see the mint address, "Frozen" reported for a
   brand-new ATA before any explicit freeze call, a caught mint
   failure, a thaw signature, a successful mint, and both a raw and
   interest-adjusted balance figure.

5. Verify with the CLI.

   Run:
     spl-token display <MINT_ADDRESS> --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --url devnet

   Confirm DefaultAccountState and InterestBearingConfig both appear.

6. Write MIGRATION.md, covering at minimum: that there is no
   in-place conversion instruction, that a brand-new Token-2022 mint
   must be created (with whichever extensions are actually wanted),
   that every existing holder's balance must be independently
   re-issued or swapped on the new mint, and that every downstream
   integration (wallets, exchanges, price feeds, other programs)
   needs to separately learn about and adopt the new mint address.
```

---

# `npx tsx index.ts` Output.

```
Compliance-gated, interest-bearing mint created: 2TBDYuEaM7SznxBauk6ZYt9uLFLVHM1HFgDR7udLpAqY
```