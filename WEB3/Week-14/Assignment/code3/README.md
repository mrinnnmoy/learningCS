# How to Build.

```
1. Confirm your wallet still has enough devnet SOL for a second
   deployment (Concept 8's cost note applies again here — this is a
   separate program from Easy's, and needs its own deployment).

   Run:
     solana balance --url devnet

2. Create the program crate.

   Run:
     cargo new vault-program --lib
     cd vault-program

3. Replace Cargo.toml and src/lib.rs with the versions in the
   Solution section below.

4. Build and deploy it, exactly as in Easy Steps 4–5.

   Run:
     cargo build-sbf
     solana program deploy target/deploy/vault_program.so --url devnet

   Note the printed Program Id.

5. Set up the TypeScript client, alongside the program folder.

   Run:
     cd ..
     mkdir vault-client && cd vault-client
     npm init -y
     npm install @solana/web3.js
     npm install -D typescript tsx @types/node

6. Open package.json and add "type": "module". Confirm the rest
   matches the Solution section below.

7. Create tsconfig.json and index.ts from the Solution section below,
   pasting your Step 4 program ID into the PROGRAM_ID constant.

8. Run it.

   Run:
     npx tsx index.ts

   You should see your depositor address, the derived vault PDA, a
   deposit signature and resulting balance, then a withdrawal
   signature and updated balance.
```

---

# Note.

```
Program Id: 7ctYkBSot9txEVoMiPedXrE8S7SCUkCLGe8CQWS8RT75

Signature: 2yQ1pdnkz9aZ2V6nVSDuTXG6Xj5BMRCfpVbcLzuDcCnndu6uz3SXhjqBS6gq7LAHdaKG84yhALCrRXHpg8kxAHNB
```