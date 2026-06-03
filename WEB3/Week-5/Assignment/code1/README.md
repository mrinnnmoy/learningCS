# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir serialization-compare && cd serialization-compare
     npm init -y

2. Switch the package to ES modules and install the TypeScript
   tooling, plus this week's one new real dependency.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node
     npm install borsh@2.0.0

   Notice the second install command has no --save-dev flag — borsh is
   a runtime dependency your program actually needs to run, not just a
   development tool, so it belongs in "dependencies" rather than
   "devDependencies" in the resulting package.json.

3. Add tsconfig.json.

   Reuse the same file from every previous week's TypeScript projects
   unchanged.

4. Write compare.ts.

   The part worth reading slowly here is the "schema" constant — it's
   the one thing that determines Borsh's byte layout, completely
   independent of how the account object's properties are ordered in
   the source code below it. See the Solution section below for the
   full file.

5. Run it.

   Run:
     npx tsx compare.ts

   Read the output in two halves: the JSON section first (where the
   two "identical?" lines should both say false), then the Borsh
   section (where both should say true).
```