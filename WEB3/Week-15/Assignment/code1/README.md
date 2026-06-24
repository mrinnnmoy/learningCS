# Folder Structure.

```
counter-anchor/
├── Anchor.toml                        (edited — cluster set to devnet)
├── programs/
│   └── counter-anchor/
│       ├── Cargo.toml                  (edited — dependency pinned)
│       └── src/
│           └── lib.rs                   (edited — this week's program)
├── tests/                              (untouched this assignment, see Medium)
├── migrations/                         (untouched, from Anchor's scaffold)
└── client/
    ├── package.json
    ├── tsconfig.json
    └── index.ts
```

---

# How to Build.

```
1. Run the environment verification commands at the top of this
   Assignment section. Confirm anchor --version reports 1.x before
   continuing.

2. Scaffold the Anchor workspace.

   Run:
     anchor init counter-anchor
     cd counter-anchor

3. Open Anchor.toml and change [provider].cluster from "localnet" to
   "devnet". Leave wallet as its scaffolded default
   (~/.config/solana/id.json) — it already matches this course's
   wallet rule with no edits needed.

4. Replace programs/counter-anchor/Cargo.toml's [dependencies]
   section and src/lib.rs with the versions in the Solution section
   below.

5. Note the program's on-chain address.

   Run:
     anchor keys list

   Paste this address into declare_id!(...) in src/lib.rs if it
   differs from the placeholder, then run anchor build again — the
   deployed program's ID and the ID declared inside the program
   itself must match exactly.

6. Build it.

   Run:
     anchor build

   This runs cargo build-sbf under the hood and also generates the
   IDL (Concept 5) at target/idl/counter_anchor.json and a TypeScript
   type file at target/types/counter_anchor.ts.

7. Deploy to devnet.

   Run:
     anchor program deploy --provider.cluster devnet

8. Set up the TypeScript client (separate from tests/, which Medium
   uses instead).

   Run:
     mkdir client && cd client
     npm init -y
     npm install @coral-xyz/anchor @solana/web3.js
     npm install -D typescript tsx @types/node

9. Create tsconfig.json and index.ts from the Solution section below.
   Copy target/idl/counter_anchor.json into the client/ folder so
   index.ts can import it directly.

10. Run it.

    Run:
      npx tsx index.ts

    You should see your wallet address, the derived counter PDA, an
    Initialize signature, count 0, an Increment signature, and count 1.
```

---

# Program Key + ID.

```
8Usiwh28LZ451hEpwmjLiJVcY2QsXa8SsrSpcmr2vy7e
```

## Metadata.

```
45uiA4K2TStJS3PyuZvRHwsQWN6gr387JKR46H5fuuU9
```