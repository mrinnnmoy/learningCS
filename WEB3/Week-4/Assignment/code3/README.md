# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir hd-vault && cd hd-vault
     npm init -y

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

3. Add tsconfig.json.

   Reuse the same file from every previous project this week
   unchanged.

4. Copy wordlist.ts from the Easy assignment into this project
   unchanged.

   This vault needs to print a human-readable one-time backup phrase
   for the master seed, using the exact same encoding Easy already
   built and tested — there's no reason to write a second version.

5. Write keys.ts.

   This is Easy's keypairFromSeed/publicKeyToHex logic, plus one new
   function: deriveChildSeed, which turns a master seed and an account
   index into a distinct, reproducible child seed using HMAC-SHA256.
   See the Solution section below, including the comment explaining
   how this compares to real BIP-32/BIP-44 derivation.

6. Write vault-storage.ts.

   This is Medium's keystore.ts encryption logic, narrowed down to
   encrypting and decrypting exactly one thing: the 32-byte master
   seed, rather than a full private key record. See the Solution
   section below.

7. Write vault.ts as the command router.

   This file never derives more than one account's private key into a
   variable that outlives the block of code that needs it — read
   through main() and notice that every derived privateKey is used
   immediately for signing and then simply falls out of scope, rather
   than being collected into an array or returned anywhere. See the
   Solution section below.

8. Create a vault and write down the printed phrase.

   Run:
     npx tsx vault.ts create "correct horse battery staple"

   The 32-word phrase this prints is shown exactly once, the same way
   a real wallet's setup flow shows a backup phrase exactly once —
   there is no "show me the phrase again" command in this project on
   purpose.

9. List a few accounts, then list them again to check determinism.

   Run:
     npx tsx vault.ts accounts "correct horse battery staple" 3
     npx tsx vault.ts accounts "correct horse battery staple" 3

   Compare the two runs' output line by line.

10. Sign a message with one specific account.

    Run:
      npx tsx vault.ts sign "correct horse battery staple" 1 "Hello from account 1"

    Compare the public key this prints against Account #1 from Step 9.
```