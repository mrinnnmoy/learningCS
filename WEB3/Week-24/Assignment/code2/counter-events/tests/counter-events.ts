import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { PublicKey } from "@solana/web3.js";
import { DatabaseSync } from "node:sqlite";
import { assert } from "chai";
import type { CounterEvents } from "../target/types/counter_events";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("counter-events", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.CounterEvents as Program<CounterEvents>;
  const owner = (provider.wallet as anchor.Wallet).payer;

  it("captures every increment live via addEventListener, with idempotent writes", async () => {
    const db = new DatabaseSync(":memory:");
    db.exec(`
      CREATE TABLE counter_events (
        signature TEXT, event_index INTEGER, owner TEXT, amount TEXT, new_value TEXT, indexed_at INTEGER,
        PRIMARY KEY (signature, event_index)
      );
    `);
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO counter_events (signature, event_index, owner, amount, new_value, indexed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const capturedEvents: { newValue: string; signature: string }[] = [];

    // Concept 9: push, not poll — this callback fires the moment the
    // program's transaction lands, no repeated RPC calls involved.
    const listenerId = await program.addEventListener(
      "counterIncremented",
      (event, _slot, signature) => {
        insertStmt.run(
          signature,
          0,
          event.owner.toString(),
          event.amount.toString(),
          event.newValue.toString(),
          Date.now(),
        );

        capturedEvents.push({
          newValue: event.newValue.toString(),
          signature,
        });
      },
    );

    await sleep(500);

    const [counterPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter"), owner.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .initialize()
      .accounts({ counter: counterPda, owner: owner.publicKey })
      .rpc();

    await program.methods
      .increment(new anchor.BN(10))
      .accounts({ counter: counterPda, owner: owner.publicKey })
      .rpc();
    await program.methods
      .increment(new anchor.BN(5))
      .accounts({ counter: counterPda, owner: owner.publicKey })
      .rpc();
    await program.methods
      .increment(new anchor.BN(3))
      .accounts({ counter: counterPda, owner: owner.publicKey })
      .rpc();

    // Give the websocket subscription a moment to deliver the last event.
    await sleep(2000);
    await program.removeEventListener(listenerId);

    assert.equal(
      capturedEvents.length,
      3,
      "all three increments must have been captured live",
    );
    assert.deepEqual(
      capturedEvents.map((e) => e.newValue),
      ["10", "15", "18"],
      "events must arrive in order with correct cumulative values",
    );

    // Simulate a duplicate delivery of the first event (a real
    // websocket reconnect can replay recent events, Concept 9/11).
    insertStmt.run(
      capturedEvents[0].signature,
      0,
      owner.publicKey.toString(),
      "10",
      "10",
      Date.now(),
    );
    const row = db
      .prepare(
        "SELECT COUNT(*) as count FROM counter_events WHERE signature = ?",
      )
      .get(capturedEvents[0].signature) as {
      count: number;
    };
    assert.equal(
      row.count,
      1,
      "a duplicate delivery of the same event must not create a second row",
    );

    db.close();
  });
});
