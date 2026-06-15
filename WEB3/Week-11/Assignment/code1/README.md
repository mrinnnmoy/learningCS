# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir account-anatomy && cd account-anatomy
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module" and the "start" script
   from the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

5. Run it.

   Run:
     npx tsx index.ts

   You should see three account summaries printed, the wallet, the
   System Program, and the Token Program, with visibly different
   owner and executable values across the three, and no type errors.

6. Change the THIRD describeAccount call to point at your own
   airdropped wallet's address a second time (instead of the Token
   Program), so the script prints the same wallet twice. Confirm
   both printouts are identical — an account's structure doesn't
   change just because you asked for it twice.
```