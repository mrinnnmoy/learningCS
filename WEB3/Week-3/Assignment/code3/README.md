# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir signed-ledger && cd signed-ledger
     npm init -y

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

3. Add tsconfig.json.

   Reuse the same file from Easy and Medium unchanged.

4. Write ledger.ts.

   This file defines the Block shape and two functions: one that
   builds and signs a new block on top of a previous one, and one that
   validates an entire chain against a supplied registry of authorized
   public keys. See the Solution section below. Notice that the hash
   is computed over the block's content INCLUDING the signer's public
   key, but NOT including the signature itself — the signature is
   produced by signing that hash afterward, so it can never be part of
   what it's signing.

5. Write cli.ts.

   This file generates three separate Ed25519 identities (two
   authorized "validators" and one deliberately unauthorized
   "outsider"), builds a small valid ledger, then runs the three
   attack demonstrations described in the Requirements above, one
   after another, printing the result of each. See the Solution
   section below.

6. Run it.

   Run:
     npx tsx cli.ts

   Read the output top to bottom — it's organized as one valid-ledger
   confirmation followed by three separately labeled "Attempt N —"
   sections, each showing a different way validation can fail.
```