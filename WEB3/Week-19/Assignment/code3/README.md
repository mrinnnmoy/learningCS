# How to Build.

```
1. Confirm your wallet has enough devnet SOL for another deployment.

2. Scaffold and configure the Anchor workspace, exactly Easy's
   Steps 2-5.

   Run:
     anchor init escrow-program
     cd escrow-program
     # set [provider].cluster = "devnet" in Anchor.toml

3. Replace programs/escrow-program/Cargo.toml's [dependencies] and
   src/lib.rs with the versions in the Solution section below.

4. Build, update declare_id!, rebuild, deploy.

   Run:
     anchor build
     anchor keys list
     anchor build
     anchor program deploy --provider.cluster devnet

5. Replace tests/escrow-program.ts with the version in the Solution
   section below, and run it.

   Run:
     anchor test --skip-deploy

   (--skip-deploy since Step 4 already deployed this exact program;
   anchor test would otherwise redeploy to its own fresh local
   validator instead of testing the live devnet deployment — for
   this assignment specifically, testing against the SAME devnet
   program the live client will also use keeps both halves of this
   assignment pointed at one consistent deployment.)

6. Set up the TypeScript client.

   Run:
     cd ..
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

7. Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/escrow_program.json into client/.

8. Run it.

   Run:
     npx tsx index.ts

   You should see two mint addresses, a make signature, the vault
   balance right after making the offer, a cancel signature, and the
   vault balance afterward (back to zero).
```

---

# Resources.

```
Program ID : 4pdehRChod4tVoutSJoaW4KGoGFCDdbYNVDk4hYBDjQ9
Metadata : GCf35SPmuWeGPaK3sJkXtW91P2oXvE75VNct19nrwFBY
```