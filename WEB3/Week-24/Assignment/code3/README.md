# How to Build.

```
1. Scaffold the project.

   Run:
     mkdir webhook-indexer && cd webhook-indexer
     npm init -y
     npm install express @solana/web3.js
     npm install -D typescript tsx @types/node @types/express

2. Create tsconfig.json (same shape as every prior week's client)
   and server.ts, reconcile.ts from the Solution section below.

3. Set a shared secret as an environment variable, and start the
   webhook receiver in one terminal.

   Run:
     export WEBHOOK_SECRET="a-locally-chosen-secret-value"
     npx tsx server.ts

4. In a SECOND terminal (same WEBHOOK_SECRET exported), run the
   reconciliation script, which POSTs simulated deliveries to the
   running server, then backfills whatever was deliberately withheld.

   Run:
     export WEBHOOK_SECRET="a-locally-chosen-secret-value"
     npx tsx reconcile.ts

   You should see the receiver's terminal log incoming POSTs, and
   the reconcile terminal report how many rows came from the webhook
   path versus the backfill path.
```