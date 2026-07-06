# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the Anchor workspace.

   Run:
     anchor init overflow-vault
     cd overflow-vault

3. Open Anchor.toml and set [provider].cluster to "devnet".

4. Confirm the workspace root Cargo.toml still has:
     [profile.release]
     overflow-checks = true
   (Anchor's default — leave it as-is; this assignment's checked_*
   calls are the portable fix, this default is the safety net under
   them, not a substitute for them.)

5. Replace programs/overflow-vault/Cargo.toml's [dependencies] and
   src/lib.rs with the versions in the Solution section below.

6. Build, update declare_id!, rebuild, deploy.

   Run:
     anchor build
     anchor keys list
     # paste the printed address into declare_id!(...) if it differs
     anchor build
     anchor program deploy --provider.cluster devnet

7. Set up the TypeScript client.

   Run:
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js bn.js
     npm install -D typescript tsx @types/node @types/bn.js

8. Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/overflow_vault.json into client/.

9. Run it.

   Run:
     npx tsx index.ts

   You should see a vault initialization signature, a deposit, a
   withdrawal, the resulting balance, and finally a caught error
   message from the deliberate over-withdrawal attempt.
```

---

# Resources.

```
Program ID : 8eMb1hAdTdfkzELvq7rsAjUp7Re4M335Qy8xuvreqTaQ
Metadata : EfrDUYaEJ16CPg7kQpgUENYbiCUr7y7wq3oNzAWASmNj
```