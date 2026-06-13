# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir fees-rent-compute && cd fees-rent-compute
     npm init -y

2. Install @solana/web3.js and the TypeScript tooling.

   Run:
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

3. Open package.json and add "type": "module" and the "start" script.
   Confirm the rest matches the Solution section below.

4. Create tsconfig.json and index.ts with the contents from the
   Solution section below.

   Read through index.ts once before running — note that
   simulateTransaction is used at the end, not sendTransaction. This
   assignment never actually broadcasts a transfer to the network, it
   only asks the cluster to price and dry-run one. Also note
   confirmTransaction takes an object ({ signature, blockhash,
   lastValidBlockHeight }), not a bare signature string, this is the
   current, non-deprecated form.

5. Run it.

   Run:
     npx tsx index.ts

   You should see an airdrop confirmation and balance, a base fee in
   lamports, two rent-exemption minimums, and a compute units figure,
   with no errors and no deprecation warnings. If the airdrop step
   fails with a rate-limit error, wait a minute and re-run, devnet's
   faucet is shared across every student running this exact
   assignment.

6. Re-run the script once more, end to end, with a freshly generated
   payer each time (the default, since Keypair.generate() is called
   fresh on every run) and compare the base fee and rent-exemption
   numbers between the two runs.
```