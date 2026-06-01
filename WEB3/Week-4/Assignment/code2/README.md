# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir encrypted-keystore && cd encrypted-keystore
     npm init -y

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

3. Add tsconfig.json.

   Reuse the same file from every previous week unchanged.

4. Write keystore.ts.

   This file owns key generation, password-based encryption and
   decryption, and file I/O — cli.ts should never touch scrypt, AES,
   or the filesystem directly. See the Solution section below. Pay
   attention to the comment on deriveEncryptionKey explaining why
   scrypt specifically, and not a plain fast hash, is used to turn the
   password into a key.

5. Write cli.ts as the command router.

   This file parses argv, calls into keystore.ts, and is responsible
   for catching the error a wrong password throws and turning it into
   a readable message rather than letting the raw exception crash the
   process. See the Solution section below.

6. Create a keystore and unlock it correctly.

   Run:
     npx tsx cli.ts create alice "correct horse battery staple"
     npx tsx cli.ts unlock alice "correct horse battery staple"

   Confirm the second command reports the demo message was signed and
   verified as true.

7. Try unlocking with the wrong password.

   Run:
     npx tsx cli.ts unlock alice "wrong password"

   Compare this output against Step 6's successful unlock — the
   difference between these two runs is exactly what Manual Test Case
   3 below checks for.

8. Inspect the keystore file directly.

   Open encrypted-keystore/keystores/alice.json in a text editor and
   read through every field. None of them should let you reconstruct
   the private key without also knowing the password.
```
