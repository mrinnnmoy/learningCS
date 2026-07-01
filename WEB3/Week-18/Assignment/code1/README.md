# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir transfer-fee-token && cd transfer-fee-token
     npm init -y
     npm install @solana/spl-token @solana/web3.js
     npm install -D typescript tsx @types/node

2. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

3. Create tsconfig.json and index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see the mint address, a mint confirmation, a transfer
   signature, the withheld fee amount, a harvest signature, and a
   withdraw signature, with no errors.

5. Verify with the CLI.

   Run:
     spl-token display <MINT_ADDRESS> --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --url devnet

   Confirm it reports the TransferFeeConfig extension with the same
   1% / 1 token max fee you configured.
```

---

# `npx tsx index.ts` Output.

```
Token-2022 mint created (1% transfer fee): 6UyoEVQqqzDmWYSDJUhVCtLozDh97AYE9ttCwEHjdhiB
Minted 1000 tokens to your ATA.

Transferred 100 tokens (fee withheld). Signature: 3FtLe7Eqx8QBFC1KNobaqrt6udJ3MLecehAsfw4P5cUx1s2SKJmnve1fo8G4CBo8pTY9sJ7HE7XPpyLjRdHVkFMM
Withheld fee sitting in vault: 1000000

Harvested withheld fees to mint. Signature: QPp6ivMhaegidSrR1zHGXoFCVdKiMvjtf3Gfa42WpEYX11uTx16FonnfGVceBCeH9vdAyHVqjQNdpJcMrieSsyv
Withdrew harvested fees to your ATA. Signature: 6R86eJ9JpcDNonmqhoE4x9NmMknbsd3FcFyzYSeRxm7ayBfTVqd9S3a46YoVhN6ngmZ6TSG7Xwh9qx8wkqrUchC
```