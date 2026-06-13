# How to build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir cluster-explorer && cd cluster-explorer
     npm init -y

2. Install @solana/web3.js as a real dependency, and TypeScript's
   tooling as dev dependencies.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module" and the "start" script
   shown in the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

5. Run it.

   Run:
     npx tsx index.ts

   You should see the cluster's version, current epoch info, node
   count, and two slot readings 2 seconds apart, with the second
   slot number visibly higher than the first, and no type errors. If
   a request times out or errors, simply re-run it — this hits
   Solana's public devnet RPC endpoint, which is occasionally
   rate-limited or briefly unavailable (Week 24 covers dedicated RPC
   providers for anything beyond casual, light querying like this).

6. Re-run the script two or three times, a few seconds apart, and
   compare the absolute slot number printed each time.
```