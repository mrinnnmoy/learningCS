# How to Build.

```
1. Confirm your wallet still has enough devnet SOL for a second
   Anchor deployment this week (Assignment intro's cost note applies
   again — this is a separate program from Easy's).

   Run:
     solana balance --url devnet

2. Scaffold the Anchor workspace.

   Run:
     anchor init vault-anchor
     cd vault-anchor

3. Open Anchor.toml and change [provider].cluster to "devnet", exactly
   Easy's Step 3.

4. Replace programs/vault-anchor/Cargo.toml's [dependencies] section
   and src/lib.rs with the versions in the Solution section below.

5. Build, note the program ID, update declare_id!, and rebuild,
   exactly Easy's Steps 5-6.

   Run:
     anchor build
     anchor keys list
     # paste the printed address into declare_id!(...) if it differs
     anchor build

6. Deploy to devnet.

   Run:
     anchor deploy --provider.cluster devnet

7. Set up the TypeScript client, exactly Easy's Steps 8-9, but for
   vault-anchor.

   Run:
     mkdir client && cd client
     npm init -y
     npm install @coral-xyz/anchor @solana/web3.js
     npm install -D typescript tsx @types/node

   Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/vault_anchor.json into client/.

8. Run it.

   Run:
     npx tsx index.ts

9. Write COMPARISON.md, listing every manual step Week 14's raw
   vault-program needed that this version doesn't write explicitly
   (a starting point, expand on it yourself): the manual
   Pubkey::find_program_address re-derivation and equality check in
   BOTH instructions, the manual is_signer check, the manual
   system_instruction::create_account CPI (Easy's Initialize only,
   not this vault, which never explicitly creates its PDA either
   way), the manual invoke/invoke_signed calls themselves, and the
   hand-rolled Borsh instruction-enum parsing.
```

---

# Program. (`solana program show 2wSvvqUyuh7pgWwnAyRumXiZc5Y7jQhYGCYBB34s9HF6 --url devnet`)

```
Program Id: 2wSvvqUyuh7pgWwnAyRumXiZc5Y7jQhYGCYBB34s9HF6
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: EuyoLHjk2H2qorstQZAnoWiLZZKwtK4hJcD5coowpwVS
Authority: HGjTtQGMdubFRYXVYQi8qbSegdKc3zYABa9qoQmdoQVW
Last Deployed In Slot: 478578656
Data Length: 111968 (0x1b560) bytes
Balance: 0.78050136 SOL
```

## Metadata.

```
Aam4pvrMhffDuEEuSSBjNP6jQK1jkbuxvR4S3WboTQ3D
```