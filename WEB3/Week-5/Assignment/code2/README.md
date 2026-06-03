# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir borsh-accounts && cd borsh-accounts
     npm init -y

2. Switch the package to ES modules and install the TypeScript
   tooling and borsh.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node
     npm install borsh@2.0.0

3. Add tsconfig.json.

   Reuse the same file from Easy unchanged.

4. Write accounts.ts.

   The schema's owner field uses the fixed-size array form,
   { array: { type: 'u8', len: 32 } } — supplying a len makes the
   array's size part of the schema itself, so no length prefix is
   stored in the bytes for it, unlike a dynamic-length array. See the
   Solution section below for the full file, including both
   corruption demonstrations.

5. Run it.

   Run:
     npx tsx accounts.ts

   Read the output in three parts: the initial round-trip
   confirmation, the single-byte-flip demonstration, and the
   truncation demonstration — in that order.
```