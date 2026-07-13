# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the project.

   Run:
     mkdir transfer-indexer && cd transfer-indexer
     npm init -y
     npm install @solana/web3.js @solana/spl-token
     npm install -D typescript tsx @types/node

3. Create tsconfig.json (same shape as every prior week's client) and
   index.ts from the Solution section below.

4. Run it.

   Run:
     npx tsx index.ts

   You should see however many existing transfers your watched
   account already has, all indexed on the first run, then "0 new
   transfers" on every immediate rerun.
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-24/Assignment/code1$ npx tsx index.ts 5AnSqmHxm3LAAmGKb6Be8mrw2xRoTgp8PvCxCW36qRrW
(node:11271) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Watching: 14s8vcSLzo1Jng7WMBxzbbbWF3Uf58wF47zWEJY51ji6
Checkpoint (fetching newer than): (none — first run)
Found 6 new signature(s).
Inserted 0 new transfer row(s) (Concept 11: duplicates silently ignored).
Checkpoint advanced to: 4H929x9cjrfvgPKFmQ5TF5di72HD7RVdb3rxEYaikrmYT9pTejgoMgDMDqfi1kN7K3tTRZvCS1RL7eRPUaUpM4kj

Total indexed transfers to this address: 0
```