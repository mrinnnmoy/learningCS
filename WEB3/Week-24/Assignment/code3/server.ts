import express, { type Request, type Response } from "express";
import { DatabaseSync } from "node:sqlite";
import { join } from "path";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  throw new Error("Set WEBHOOK_SECRET before starting the server.");
}

const db = new DatabaseSync(join(import.meta.dirname, "indexer.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS transfers (
    signature TEXT PRIMARY KEY,
    slot INTEGER,
    block_time INTEGER,
    source TEXT,
    destination TEXT,
    amount TEXT,
    mint TEXT,
    indexed_at INTEGER,
    source_path TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_transfers_destination ON transfers(destination);
`);

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO transfers (signature, slot, block_time, source, destination, amount, mint, indexed_at, source_path)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const app = express();
app.use(express.json());

app.post("/webhook", (req: Request, res: Response) => {
  // Concept 12: verify BEFORE touching the payload at all.
  const authHeader = req.header("Authorization");
  if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    console.log("Rejected an unauthorized webhook request.");
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const events = req.body as Array<{
    signature: string;
    slot: number;
    blockTime: number;
    source: string;
    destination: string;
    amount: string;
    mint: string;
  }>;

  let inserted = 0;
  for (const event of events) {
    const result = insertStmt.run(
      event.signature,
      event.slot,
      event.blockTime,
      event.source,
      event.destination,
      event.amount,
      event.mint,
      Date.now(),
      "webhook",
    );
    if (result.changes > 0) inserted++;
  }

  console.log(
    `Webhook delivery: ${events.length} event(s), ${inserted} new row(s) inserted.`,
  );
  res.status(200).json({ received: events.length, inserted });
});

const PORT = 8787;
app.listen(PORT, () => {
  console.log(`Webhook receiver listening on http://localhost:${PORT}/webhook`);
});
