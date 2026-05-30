# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir signed-log && cd signed-log
     npm init -y

2. Switch the package to ES modules and install the TypeScript tooling.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node

3. Add tsconfig.json.

   Reuse the same file from Easy — nothing about this project's module
   setup is different.

4. Write identity.ts.

   This module owns everything about creating, saving, loading, and
   signing/verifying with a named identity. See the Solution section
   below. Keeping this separate from log.ts means log.ts never needs
   to know how keys are stored on disk — only that it can ask for
   "alice's identity" and get back something it can sign with.

5. Write log.ts as the command router.

   This file parses process.argv, decides which of the three
   subcommands (identity create / append / verify) was requested, and
   delegates the actual work to identity.ts or to its own log-file
   read/write helpers. See the Solution section below.

6. Create two identities and append a few entries.

   Run, in order:
     npx tsx log.ts identity create alice
     npx tsx log.ts identity create bob
     npx tsx log.ts append alice "Alice says hello"
     npx tsx log.ts append bob "Bob replies hello back"
     npx tsx log.ts append alice "Alice signs off for the day"

   Running these in this specific order matters for the Manual Test
   Cases below, since they assume a log with entries from two
   different identities, appended in this sequence.

7. Verify the log, then verify again after manually tampering with it.

   Run:
     npx tsx log.ts verify

   Then open data/log.json in a text editor, find the "message" field
   of the entry where author is "bob", and change its text — do not
   touch the "signature" field. Save the file, then run:
     npx tsx log.ts verify
   again and compare the two verify runs' output.
```