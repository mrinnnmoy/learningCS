# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir pda-limits && cd pda-limits
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

5. Run it.

   Run:
     npx tsx index.ts

   You should see your wallet address, three distinct PDAs (vault,
   user-profile, counter) confirmed as pairwise different, and a
   result for the deliberate 33-byte-seed test, with no type errors.

6. Add a fourth account type, ["achievements", owner], using the same
   derivePda helper with no changes to the helper itself. Re-run and
   confirm it's also distinct from all three original PDAs.
```