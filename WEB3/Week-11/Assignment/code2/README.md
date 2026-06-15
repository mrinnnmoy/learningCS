# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir signer-writable-flags && cd signer-writable-flags
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module" and the "start" script.
   Confirm the rest matches the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

5. Run it.

   Run:
     npx tsx index.ts

   You should see three accounts printed (payer, receiver, System
   Program), each with a different signer/writable combination and
   matching plain-English label, with no type errors.

6. Add a second SystemProgram.transfer instruction to the same
   message, this time sending a small amount from payer to a THIRD,
   freshly generated Keypair. Re-run the script and confirm a fourth
   account now appears in the printed list, still correctly
   categorized, with no changes to the categorization function
   itself.
```