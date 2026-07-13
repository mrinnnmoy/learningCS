import { DatabaseSync } from "node:sqlite";
import { join } from "path";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error("Set WEBHOOK_SECRET before running this script.");
}

const RECEIVER_URL = "http://localhost:8787/webhook";

// Simulated "real chain activity" — 5 events. Only the first 3 are
// actually delivered to the webhook, the last 2 are deliberately
// withheld here to simulate a realistic missed delivery.
const ALL_SIMULATED_EVENTS = [
  {
    signature: "sig_A",
    slot: 1000,
    blockTime: 1750000000,
    source: "walletX",
    destination: "walletY",
    amount: "100",
    mint: "mintZ",
  },
  {
    signature: "sig_B",
    slot: 1001,
    blockTime: 1750000010,
    source: "walletX",
    destination: "walletY",
    amount: "200",
    mint: "mintZ",
  },
  {
    signature: "sig_C",
    slot: 1002,
    blockTime: 1750000020,
    source: "walletX",
    destination: "walletY",
    amount: "150",
    mint: "mintZ",
  },
  {
    signature: "sig_D",
    slot: 1003,
    blockTime: 1750000030,
    source: "walletX",
    destination: "walletY",
    amount: "300",
    mint: "mintZ",
  }, // MISSED by webhook
  {
    signature: "sig_E",
    slot: 1004,
    blockTime: 1750000040,
    source: "walletX",
    destination: "walletY",
    amount: "50",
    mint: "mintZ",
  }, // MISSED by webhook
];
const ACTUALLY_DELIVERED = ALL_SIMULATED_EVENTS.slice(0, 3);
const MISSED_BY_WEBHOOK = ALL_SIMULATED_EVENTS.slice(3);

async function main(): Promise<void> {
  console.log("Step 1: Rejected-auth check — sending with NO secret first.");
  const unauthorizedResponse = await fetch(RECEIVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ACTUALLY_DELIVERED),
  });
  console.log(
    "Response without auth header:",
    unauthorizedResponse.status,
    "(expect 401)\n",
  );

  console.log(
    "Step 2: Delivering 3 of 5 events via the (authorized) webhook path...",
  );
  const authorizedResponse = await fetch(RECEIVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WEBHOOK_SECRET}`,
    },
    body: JSON.stringify(ACTUALLY_DELIVERED),
  });
  const authorizedResult = await authorizedResponse.json();
  console.log("Webhook response:", authorizedResult, "\n");

  console.log(
    "Step 3: Reconciliation — backfilling whatever the webhook missed (Concept 8, 10).",
  );
  const db = new DatabaseSync(join(import.meta.dirname, "indexer.db"));
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO transfers (signature, slot, block_time, source, destination, amount, mint, indexed_at, source_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let backfilled = 0;
  for (const event of MISSED_BY_WEBHOOK) {
    const result = insertStmt.run(
      event.signature,
      event.slot,
      event.blockTime,
      event.source,
      event.destination,
      event.amount,
      event.mint,
      Date.now(),
      "backfill",
    );
    if (result.changes > 0) backfilled++;
  }
  console.log(
    `Backfill inserted ${backfilled} row(s) that the webhook had missed.\n`,
  );

  const byPath = db
    .prepare(
      "SELECT source_path, COUNT(*) as count FROM transfers GROUP BY source_path",
    )
    .all() as {
    source_path: string;
    count: number;
  }[];
  console.log("Final row counts by source path:", byPath);

  const total = db.prepare("SELECT COUNT(*) as count FROM transfers").get() as {
    count: number;
  };
  console.log(
    `Total rows: ${total.count} (expect exactly 5 — all of Concept 8's "both paths together" story, no duplicates, no gaps)`,
  );

  db.close();
}

main().catch((err: unknown) => {
  const reason = err instanceof Error ? err.message : String(err);
  console.error("Request failed:", reason);
  process.exit(1);
});
