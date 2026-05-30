# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir keypair-signer && cd keypair-signer
     npm init -y

   This gives you a bare package.json to build on, the same starting
   point as every project so far this course.

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to the generated package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

   ES modules matter here specifically because this file imports named
   exports directly from "node:crypto" (generateKeyPairSync, sign,
   verify) — the import syntax you'll use is the ES module form.

3. Add tsconfig.json.

   See the Solution section below for the full file. This is the same
   tsconfig used in every TypeScript project so far this course, so if
   you've already got one you're happy with from Week 2, you can reuse
   it unchanged.

4. Write signer.ts.

   See the Solution section below for the full file. Pay attention to
   the comment explaining why `null` is passed as the first argument
   to both `sign` and `verify` — it's not a placeholder, it means
   something specific for Ed25519.

5. Run it.

   Run:
     npx tsx signer.ts

   Because a fresh keypair is generated on every run, the exact PEM
   text and signature hex will differ each time you run this — that's
   expected, and is exactly what Manual Test Case 3 below checks for.
```