# How to build.

```
1. Run the environment verification commands above.

2. Scaffold and configure the Anchor workspace, Easy's Steps 2-3.

   Run:
     anchor init per-user-vault
     cd per-user-vault
     # set [provider].cluster = "devnet" in Anchor.toml
     # (this stays devnet — the live client in Step 8 needs a real
     # devnet deployment; only the test suite gets run against a
     # separate local validator, in Step 6 below)

3. Replace programs/per-user-vault/Cargo.toml's [dependencies] and
   src/lib.rs with the versions in the Solution section below.

4. Build, update declare_id!, rebuild, deploy to devnet.

   Run:
     anchor build
     anchor keys list
     anchor build
     anchor deploy --provider.cluster devnet

5. Anchor 1.1.2's default anchor init scaffold doesn't create a
   tests/ folder or wire up TS/Mocha testing by default — check
   before assuming otherwise.

   Run:
     ls tests/

   If missing, create it and add the test file yourself:

   Run:
     mkdir tests

   Then create tests/per-user-vault.ts with the version in the
   Solution section below.

6. Install the TS test dependencies at the PROJECT ROOT (not
   client/). ts-mocha/ts-node don't work with TypeScript 7 (no
   compiler API yet), so use mocha with tsx as the loader instead.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

7. Open Anchor.toml and set the test script to mocha + tsx, with an
   explicit file path:

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/per-user-vault.ts"

8. Run the test suite against a LOCAL validator, not the devnet
   deployment from Step 4 — this test airdrops SOL to a throwaway
   second signer (userB), which is only reliable locally, exactly
   the problem Medium hit. Override the cluster just for this one
   command instead of changing [provider].cluster globally, so
   Step 4's devnet deployment (needed for the live client) stays
   untouched:

   Turn (from Anchor.toml):
      skip_local_validator = false
      
      [provider]
      cluster = "localnet"

   Run:
     anchor test --provider.cluster localnet

   This deploys a SEPARATE, fresh copy of the program to its own
   ephemeral local validator, runs both tests, then tears it down —
   entirely independent of the devnet deployment from Step 4.

9. Set up the TypeScript client (talks to the Step 4 devnet
   deployment, unaffected by Step 8's local testing).

   Run:
     cd ..
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

10. Create tsconfig.json and index.ts from the Solution section
    below, and copy target/idl/per_user_vault.json into client/.

11. Run it.

    Run:
      npx tsx index.ts

    You should see a mint address (created once, then reused on
    future runs), a vault initialization (or "already initialized"),
    a deposit, a withdrawal, and the vault's balance before and
    after.
```

---

# Resources.

```
Program ID : 2ext2KEFSdtStDAHcyBmVNfXJXt9wih9awJme2gDYHKJ
Metadata : 3KxoKyeMFYCWbcQGWmEgBpgV9bCsywjWEBNYLHCoux9p
```