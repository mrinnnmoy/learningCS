# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir seed-wallet && cd seed-wallet
     npm init -y

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

3. Add tsconfig.json.

   Reuse the same file from every previous week's TypeScript projects
   — nothing about the compiler configuration changes this week.

4. Write wordlist.ts.

   This file exports the 256-word list plus two small helper
   functions: bytesToPhrase (bytes -> words) and phraseToBytes (words
   -> bytes). Keeping these together in one file matters because they
   must always agree on the exact same word list — if wallet.ts ever
   imported a different copy of the list for encoding versus decoding,
   recovery would silently break. See the Solution section below for
   the full file.

5. Write wallet.ts.

   This is the part worth reading carefully rather than just copying:
   the ED25519_PKCS8_PREFIX constant is a fixed sequence of bytes that
   is genuinely identical for every Ed25519 private key ever encoded
   in the PKCS8 format — it only encodes "version 0, algorithm
   Ed25519, 32 bytes follow," none of which varies key to key. That's
   what makes it possible to build a real, working private key out of
   nothing but 32 raw seed bytes plus this fixed prefix. See the
   Solution section below for the full file, including the comment
   explaining exactly what each part of that prefix means.

6. Run it.

   Run:
     npx tsx wallet.ts

   Read the output top to bottom: first the phrase and its derived
   public key, then the recovery step, then the two "matches?" lines
   confirming recovery worked.
```