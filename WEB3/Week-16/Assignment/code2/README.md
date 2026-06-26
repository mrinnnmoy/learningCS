# How to Build.

```
1. Run Easy's assignment first (or at least once, previously), so the
   counter has a real, non-zero, known history to observe here.

2. Create this assignment's project folder.

   Run:
     mkdir account-data-at-scale && cd account-data-at-scale
     npm init -y
     npm install @coral-xyz/anchor @solana/web3.js
     npm install -D typescript tsx @types/node

3. Copy Week 15's target/idl/counter_anchor.json into this folder.

4. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

5. Create tsconfig.json and index.ts from the Solution section below.

6. Run it.

   Run:
     npx tsx index.ts

   You should see a single fetch, an .all() listing including your
   own counter, and a .fetchMultiple() result pairing a real count
   with a null.
```