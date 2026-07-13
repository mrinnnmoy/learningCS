import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { DatabaseSync } from "node:sqlite";
import { Connection, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// Set this to any mint you've already used in an earlier week's
// assignment (Week 19-23's persisted mints all work).
const MINT_TO_WATCH = process.argv[2];
if (!MINT_TO_WATCH) {
  throw new Error("Usage: npx tsx index.ts <MINT_ADDRESS>");
}

function loadLocalWallet(): Keypair {
  const keypairPath = join(homedir(), ".config", "solana", "id.json");
  const secretKey = Uint8Array.from(
    JSON.parse(readFileSync(keypairPath, "utf-8")),
  );
  return Keypair.fromSecretKey(secretKey);
}

async function main(): Promise<void> {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const wallet = loadLocalWallet();
  const mint = new PublicKey(MINT_TO_WATCH);
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
  );
  const watchedAddress = ata.address.toBase58();

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
      indexed_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_transfers_destination ON transfers(destination);
    CREATE TABLE IF NOT EXISTS checkpoints (
      address TEXT PRIMARY KEY,
      last_signature TEXT
    );
  `);

  const checkpointRow = db
    .prepare("SELECT last_signature FROM checkpoints WHERE address = ?")
    .get(watchedAddress) as { last_signature: string } | undefined;
  const until = checkpointRow?.last_signature;

  console.log("Watching:", watchedAddress);
  console.log(
    "Checkpoint (fetching newer than):",
    until ?? "(none — first run)",
  );

  const signatures = await connection.getSignaturesForAddress(
    ata.address,
    { until },
    "confirmed",
  );
  console.log(`Found ${signatures.length} new signature(s).`);

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO transfers (signature, slot, block_time, source, destination, amount, mint, indexed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  for (const sigInfo of signatures) {
    const tx = await connection.getParsedTransaction(sigInfo.signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx?.meta) continue;

    for (const ix of tx.transaction.message.instructions) {
      if (
        "parsed" in ix &&
        ix.program === "spl-token" &&
        (ix.parsed.type === "transfer" || ix.parsed.type === "transferChecked")
      ) {
        const info = ix.parsed.info;
        const result = insertStmt.run(
          sigInfo.signature,
          sigInfo.slot,
          sigInfo.blockTime ?? null,
          info.source ?? null,
          info.destination ?? null,
          String(info.amount ?? info.tokenAmount?.amount ?? "0"),
          MINT_TO_WATCH,
          Date.now(),
        );
        if (result.changes > 0) inserted++;
      }
    }
  }

  console.log(
    `Inserted ${inserted} new transfer row(s) (Concept 11: duplicates silently ignored).`,
  );

  if (signatures.length > 0) {
    db.prepare(
      "INSERT OR REPLACE INTO checkpoints (address, last_signature) VALUES (?, ?)",
    ).run(
      watchedAddress,
      signatures[0].signature, // getSignaturesForAddress returns newest-first
    );
    console.log("Checkpoint advanced to:", signatures[0].signature);
  }

  const total = db
    .prepare("SELECT COUNT(*) as count FROM transfers WHERE destination = ?")
    .get(watchedAddress) as { count: number };
  console.log(`\nTotal indexed transfers to this address: ${total.count}`);

  db.close();
}

main().catch((err) => {
  console.error("Full error:", err);
  console.error("Stack:", err instanceof Error ? err.stack : err);
  process.exit(1);
});
