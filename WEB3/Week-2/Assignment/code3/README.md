# How to Build.

```
1. Step 1 — Write `node-server.ts`.

    No new packages are needed — `node:http` and the global `fetch` are both built into Node.js 24.

2. Step 2 — Write `attacker.ts`.

3. Step 3 — Start three nodes in three separate terminals.

    Terminal 1: PORT=5001 PEERS=http://localhost:5002,http://localhost:5003 DIFFICULTY=3 npx tsx node-server.ts

    Terminal 2: PORT=5002 PEERS=http://localhost:5001,http://localhost:5003 DIFFICULTY=3 npx tsx node-server.ts

    Terminal 3: PORT=5003 PEERS=http://localhost:5001,http://localhost:5002 DIFFICULTY=3 npx tsx node-server.ts


    (PowerShell users: set each variable first, e.g. `$env:PORT=5001; $env:PEERS="http://localhost:5002,http://localhost:5003"; $env:DIFFICULTY=3`, then run `npx tsx node-server.ts` — same three variables, different syntax.)

4. Step 4 — Mine a block on node 1 and check the others.

    curl -X POST http://localhost:5001/mine -H "Content-Type: application/json" -d "{\"data\":\"Alice pays Bob 5 coins\"}"

    curl http://localhost:5002/chain

    curl http://localhost:5003/chain

5. Step 5 — Run the attacker script against node 2.

    npx tsx attacker.ts http://localhost:5002
```
