# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the Anchor workspace.

   Run:
     anchor init staking-program
     cd staking-program

3. Open Anchor.toml and set [provider].cluster to "devnet".

4. Replace programs/staking-program/Cargo.toml's [dependencies] and
   src/lib.rs with the versions in the Solution section below.

5. Build, note the program ID, update declare_id!, rebuild, deploy,
   exactly Week 15/16's pattern.

   Run:
     anchor build
     anchor keys list
     anchor keys sync
     # paste the printed address into declare_id!(...) if it differs
     anchor build
     anchor program deploy --provider.cluster devnet

6. Set up the TypeScript client.

   Run:
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

7. Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/staking_program.json into client/.

8. Run it.

   Run:
     npx tsx index.ts

   You should see a mint address, an authority-transfer confirmation,
   a vault initialization signature, a stake signature, and the
   printed position showing state: Active and an unlock_at roughly
   60 seconds in the future.
```

---

# Resources.

```
Program ID: FNWyMp4pMsg8MyfY8LWsHgFoE3uFVJNaLZXf2YYqqdxe
metadata: 8fsgeRPqqcexKy1s1AkFGQtV19AcfuAwi417ivfnhf91
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-19/Assignment/code1/staking-program/client$ npx tsx index.ts
Mint created: 6BEZ5TnaihrdqQX1N3dzbQEzCk8qVYM7oqTrZeQWSevg
Minted 1000 tokens to your ATA (for staking).
Mint authority transferred to program PDA: 3w4SWuYWgentJzUHvoSXhUisKyhxxrFDnu4YDoXZwyW4
Vault initialized: HvRFSXej7uFRSJxgj5Y3vovyBZ1f5Z3vpnb9nt72vZdS

Staked. Signature: 3hiVbQY2Fdu1P2ZA2eNfgbj7e1JCdDCZ2YKek6XaXCtYjXQj4kLER4dcBgJxsLqfpVpJTny2AsbFJ5dYMNrvyQq2

Position:
  Amount:    100000000
  State:     { active: {} }
  Unlock at: 2026-07-29T07:31:28.000Z
```