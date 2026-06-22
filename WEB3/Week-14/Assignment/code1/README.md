# How to Build.

```
1. Confirm your Solana CLI toolchain works and your wallet is funded.

   Run:
     solana --version
     cargo build-sbf --version
     solana config get
     solana balance --url devnet

   If your wallet needs funding, do so ONCE, manually:
     solana airdrop 2 --url devnet
   Nothing in this assignment's code requests an airdrop for you.

2. Create the program crate.

   Run:
     cargo new counter-program --lib
     cd counter-program

3. Replace Cargo.toml and src/lib.rs with the versions in the
   Solution section below.

4. Build it for Solana's runtime (not a plain `cargo build`).

   Run:
     cargo build-sbf

   This produces target/deploy/counter_program.so and
   target/deploy/counter_program-keypair.json.

5. Deploy it to devnet.

   Run:
     solana program deploy target/deploy/counter_program.so --url devnet

   Note the "Program Id: ..." line — you'll need it in Step 8.

6. Set up the TypeScript client, alongside (not inside) the program
   folder.

   Run:
     cd ..
     mkdir counter-client && cd counter-client
     npm init -y
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

7. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

8. Create tsconfig.json and index.ts from the Solution section below,
   pasting your Step 5 program ID into the PROGRAM_ID constant.

9. Run it.

   Run:
     npx tsx index.ts

   You should see your wallet address, the derived counter PDA, an
   Initialize signature, count 0, an Increment signature, and count 1.

10. Run npx tsx index.ts a SECOND time without changing anything.
```

---

# Note.

```
Program Id: GDtX89xvjSbaV5PY38zT3xXDTvEbL8hEUuuKyVZpckGp

Signature: 3RWWBmnzhVf3CoRXFsVpvTcH8ZZ29y9viFPMpYq8HCRUean6KEPab9mG76L9wE9ekk5Ev5wJJZEmijrVJu8Jj6NE
```