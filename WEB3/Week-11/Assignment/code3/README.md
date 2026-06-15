# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir sysvars-and-rent && cd sysvars-and-rent
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module" and the "start" script.
   Confirm the rest matches the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

   Read decodeClockSysvar closely before running anything — every
   offset (0, 8, 16, 24, 32) is exactly 8 bytes apart, because all
   five of Clock's fields are 8-byte (u64/i64) values with no gaps,
   no length prefixes, and no schema describing them, unlike every
   Borsh-encoded account you'll meet from Week 14 onward.

5. Run it.

   Run:
     npx tsx index.ts

   You should see the decoded Clock sysvar fields, the drift between
   on-chain and local time (a small number of seconds), and five
   rent-exemption figures increasing with account size, with no
   type errors.

6. Add a sixth size, 5_000_000 (5 MB), to the sizesToCheck array.
   Re-run the script and confirm its rent-exemption figure sits
   between the 10_000-byte and MAX_ACCOUNT_SIZE_BYTES figures, in
   correct proportion to its size.
```