# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir leader-schedule && cd leader-schedule
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

   You should see the current slot and leader, a boolean confirming
   the leader is a known validator, the active validator count, and
   the top-10 stake share percentage, with no type errors.

6. Re-run the script a minute or two later and compare the printed
   slot leader — it should very likely be a different pubkey than
   before, since leaders rotate slot-by-slot, not epoch-by-epoch.
```