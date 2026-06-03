# How to Build.

```
1. Create the project folder and initialize it.

   Run:
     mkdir versioned-accounts && cd versioned-accounts
     npm init -y

2. Switch the package to ES modules and install the TypeScript
   tooling and borsh.

   Add "type": "module" to package.json, then run:
     npm install --save-dev typescript@6 tsx @types/node
     npm install borsh@2.0.0

3. Add tsconfig.json.

   Reuse the same file from Easy and Medium unchanged.

4. Write schemas.ts.

   This file holds both schema versions side by side, plus the
   TypeScript interfaces describing each shape and one shared constant
   for the default value new fields get during migration. Keeping both
   schemas in one file makes the size difference between them easy to
   see directly, rather than scattered across multiple files. See the
   Solution section below.

5. Write cli.ts.

   Two small helper functions, writeVersioned and readVersioned, wrap
   every file read/write with the one-byte version prefix — every
   other function in this file goes through them rather than touching
   the filesystem directly, so the version-byte convention can't
   accidentally be forgotten in one command but not another. See the
   Solution section below for the full file, including all three
   commands.

6. Create a V1 record.

   Run:
     npx tsx cli.ts create-v1 account.bin

7. Decode it, confirming it reads as version 1.

   Run:
     npx tsx cli.ts decode account.bin

8. Check the file's exact size on disk before migrating.

   Run:
     wc -c account.bin

   (On Windows PowerShell, use (Get-Item account.bin).Length instead.)
   Expect 41 bytes: 1 version byte + 32 owner bytes + 8 balance bytes.

9. Migrate it, then decode and check its size again.

   Run:
     npx tsx cli.ts migrate account.bin
     npx tsx cli.ts decode account.bin
     wc -c account.bin

   Expect 42 bytes this time — exactly one more, for the new decimals
   field.

10. Try migrating the same, now-V2 file a second time.

    Run:
      npx tsx cli.ts migrate account.bin

    Expect a clear refusal rather than a second, incorrect migration.
```