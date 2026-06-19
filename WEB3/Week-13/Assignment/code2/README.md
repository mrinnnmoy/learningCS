# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir canonical-bump && cd canonical-bump
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

   Read the downward search loop closely before running — it's
   expected to fail (catch) for most bump values it tries, that's
   normal, only roughly half of all bumps land off-curve at all.

5. Run it.

   Run:
     npx tsx index.ts

   You should see your wallet address, the canonical PDA and bump,
   and then an alternate valid PDA at a lower bump, confirmed as
   different from the canonical one.

6. Change the seed prefix from "user-profile" to "vault" (keeping
   your own wallet pubkey as the second seed), and re-run. Confirm
   the canonical PDA is completely different from Step 5's, even
   though the owner seed didn't change at all.
```