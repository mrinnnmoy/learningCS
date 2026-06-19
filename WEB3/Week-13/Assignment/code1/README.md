# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir pda-basics && cd pda-basics
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

   You should see the two derivations printed as identical, the PDA
   reported as NOT on-curve, and your own wallet reported as ON-curve,
   with no type errors and no network activity at all.

6. Change the seed string from "demo-seed" to anything else, and
   re-run. Confirm the PDA and bump both changed completely, even
   though only one character of the input changed.
```