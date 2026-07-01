# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir soulbound-credential && cd soulbound-credential
     npm init -y
     npm install @solana/spl-token @solana/spl-token-metadata @solana/web3.js
     npm install -D typescript tsx @types/node

2. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

3. Create tsconfig.json and index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see the mint address, a mint-to-self confirmation, a
   caught, printed transfer failure, then a successful revoke
   (burn-via-permanent-delegate) signature.

5. Verify with the CLI.

   Run:
     spl-token display <MINT_ADDRESS> --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --url devnet

   Confirm it reports NonTransferable and PermanentDelegate among the
   listed extensions.
```

---

# `npx tsx index.ts` Output.

```
Soulbound credential mint created: 6B3ph85dUEv117514rv1KfK1Lk8xqWVSmga18EgNDqDV
Minted 1 credential to your ATA: FZeRERyf6nqhBnTkQ7EWcrbZkqhoHXb9T7zYwFtjyGRY
```