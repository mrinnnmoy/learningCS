# How to Build.

```
1. Locate Week 15's counter-anchor project and confirm it's still
   deployed and reachable.

   Run:
     solana program show <YOUR_COUNTER_ANCHOR_PROGRAM_ID> --url devnet

2. Create this assignment's project folder.

   Run:
     mkdir client-calling-styles && cd client-calling-styles
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

   You should see the counter PDA, a starting count, then three
   increments via three different methods, ending three higher than
   where it started.
```