# List of things learned.

## 1. Need for indexing. (RPC limitations)

Every direct RPC call this course has used so far, `getAccountInfo` (Week 16), `program.account.fetch` (Week 19 onward), answers exactly one question well.

_"What does this specific, already-known account currently contain."_

None of them answer _"which accounts of this type exist,"_ _"what happened to this account over time,"_ or _"show me every transfer into this wallet since last Tuesday"_.

An RPC node simply isn't built to search or aggregate at that scale, it serves current state, not a queryable history.

Week 21's DAS API (Concept 8 there) was this course's first real encounter with the problem this whole week is actually about, cNFT data had nowhere else to be found _except_ through an index, because it was never in an account to begin with.

---

## 2. Geyser plugin concept (Solana).

**Geyser** is a plugin interface built directly into the Solana validator itself. (Week 10's runtime)

It helps a plugin receive a live callback for every account update, transaction and slot the validator processes, _as it processes them_, rather than a separate program having to repeatedly ask an RPC node _"did anything change yet."_

This is the actual foundation nearly every real Solana indexer, including Helius and QuickNode (Concept 6), is built on.

A Geyser plugin exports a validator's entire firehose of activity to wherever an indexing pipeline actually lives.

---

## 3. gRPC streaming (Yellowstone).

Running your own Geyser-plugin-equipped validator just to consume its output isn't practical for nearly anyone.

**Yellowstone** is the standardized gRPC interface several infrastructure providers expose instead, letting a client subscribe to exactly the account or transaction updates it cares about (filtered by program ID, account, or other criteria) over a normal network connection, without operating any validator infrastructure at all.

It's the closest thing this ecosystem has to Geyser's live firehose, made consumable as an ordinary API.

---

## 4. Building custom Indexers.

This week's own assignments build small indexers directly.

A **polling** indexer (Concept 9) that periodically asks an RPC node _"what's new since I last checked"_ (Easy) and an **event-driven** indexer (Concept 9 again, the other side of it) that reacts immediately to activity pushed to it.

Whether via Week 16's `addEventListener` websocket subscriptions (Medium) or an inbound webhook (Concept 5, Hard).

Every real indexer, including Concept 2 and 3's infrastructure-level ones, is built from the same handful of pieces this week's assignments use directly:

- a data source,
- a checkpoint (Concept 10) &
- an idempotent write path (Concept 11).

---

## 5. Webhooks for on-chain events.

Rather than a client repeatedly polling (Concept 9) or maintaining an open streaming connection (Concept 3).

A **webhook** flips the direction entirely, a provider like Helius watches the chain on your behalf and makes an outbound HTTP `POST` request to a URL you register, the moment something matching your filter happens.

This removes polling delay almost entirely, at the cost of a new problem Concept 12 covers directly.

An HTTP endpoint sitting open on the public internet has to be able to tell a genuine webhook delivery apart from anyone else who simply discovers the URL and starts sending it fake payloads.

---

## 6. Third-party Indexers (Helius, QuickNode).

Week 21's `getAssetsByOwner` and DAS API calls were already exactly this, a hosted service that has already solved Concepts 2 through 5 at real scale, so that consuming indexed data never requires operating any of that infrastructure yourself.

The trade-off is the same one Week 21's Concept 8 flagged for DAS specifically.

You're depending on a third party's indexing pipeline being complete and current, worth verifying independently (Hard's reconciliation step) rather than assuming by default, exactly the same _"don't just trust a single source"_ instinct Week 41's oracles will formalize much later, applied here to data infrastructure instead of price feeds.

---

## 7. Database design for Indexed data.

An on-chain account (Week 11) is designed to minimize bytes, every extra field costs real rent.

An **indexed** copy of that same data, sitting in an ordinary database, optimizes for something completely different,

- how it will actually be _queried_ later,
- "every transfer to this wallet,"
- "every event from this program, ordered by time,"

patterns Week 11's rent-minimized on-chain layout was never designed to answer quickly, or in some cases (Week 21's compressed NFTs) can't answer at all without an index.

This week's assignments build a small but real schema (a primary key on each event's unique signature, Concept 11's idempotency depends directly on it and secondary indexes on whichever columns the assignment's own queries actually filter by).

---

## 8. Real-time vs Historical Indexing.

A push-based system (Concept 5) tells you about new activity the moment it happens, but it says nothing about everything that happened _before_ it was set up and a real deployment can also simply miss a delivery, a network blip, a brief outage.

A polling or backfill job (Concept 9) can walk arbitrarily far back through history, but only if run and only as fast as it's willing to poll.

Hard's assignment builds both together specifically because neither alone is trustworthy on its own, the push path handles low-latency freshness and a periodic reconciliation pass (Concept 10's checkpointing making that pass efficient rather than a full historical re-scan every time) catches whatever the push path missed.

---

## 9. Polling vs. Push-based Indexing.

Concept 4 named both strategies in passing; this is the actual trade-off between them, made explicit.

**Polling** (Easy's assignment) is simple to reason about and trivially resumable, but every interval you don't poll is activity you haven't seen yet and polling too aggressively wastes RPC calls on intervals with nothing new.

**Push** (Medium's `addEventListener`, Hard's webhook) delivers activity essentially the moment it happens, but requires holding open a connection or exposing a reachable endpoint, and, per Concept 8, needs a polling-based safety net anyway for anything that arrives before the push system existed or slips through it.

Neither approach is simply _"better,"_ they answer different reliability questions, which is exactly why Hard's assignment builds both rather than picking one.

---

## 10. Checkpointing and Resumable Indexing.

An indexer that restarts from scratch every time it runs either re-processes everything it already indexed (wasteful, and Concept 11's idempotency has to absorb the redundancy) or, worse, has no way to know where it left off at all.

A **checkpoint**, Easy's assignment stores the most recent signature already indexed per watched address, exactly Week 23's `next_charge_ts` pattern in spirit.

A small piece of state marking "processed up to here", turns every subsequent run into "fetch only what's new since the checkpoint," and turns a crash or restart into a minor delay rather than a full historical re-index.

---

## 11. Idempotent event processing.

Week 23, Concept 11 introduced this for payments specifically, an accidental duplicate `pay` call shouldn't double-charge anyone.

The exact same principle governs indexing.

A webhook can redeliver the same event after a slow response (Concept 5), a polling pass can overlap slightly with the previous one at its checkpoint boundary (Concept 10) and a websocket reconnect (Concept 9) can occasionally replay recent activity.

An indexer's write path has to treat _"I've already recorded this exact event"_ as a normal, expected case, not an error, this week's assignments key every table on the on-chain signature itself and use an `INSERT OR IGNORE`-shaped write specifically so a duplicate delivery becomes a silent no-op rather than a duplicate row or a crash.

---

## 12. Webhook payload verification.

Concept 5 flagged the problem, this is Week 20's Concept 2 and 3 discipline, missing signer and owner checks, applied to an HTTP endpoint instead of a Solana account.

A webhook receiver that processes _any_ `POST` request shaped like a valid payload, with no check on where it actually came from, will happily ingest fabricated events from anyone who finds the URL, the exact same _"the attacker controls the input"_ starting assumption Week 20, Concept 1 opened with, just at a different layer of the stack.

Hard's assignment requires a shared secret in an authorization header, checked before any payload processing begins, mirroring real webhook providers' own signing/secret conventions.

---

## Assignment.

1. **Easy - A Polling Indexer for SPL Token Transfers, Checkpointed and Idempotent.**

   **What you practice:**
   - Building a polling indexer (Concept 9) that fetches only what's new since the last run, using a stored checkpoint (Concept 10)
   - Designing a small database schema keyed on each transaction's own signature, so a duplicate poll never produces a duplicate row (Concept 11)
   - Directly observing Concept 1's RPC limitation the indexer exists to solve: there's no single call that returns "every transfer to this wallet," only a signature list to walk and parse one transaction at a time

   **Requirements:**
   - No custom program. Watches your own wallet's existing token account (any mint you've already used in an earlier week works fine, Week 19-23's persisted mints are all valid targets).
   - A `transfers` table (`signature TEXT PRIMARY KEY`, `slot INTEGER`, `block_time INTEGER`, `source TEXT`, `destination TEXT`, `amount TEXT`, `mint TEXT`, `indexed_at INTEGER`), with an index on `destination`, the actual query pattern a real lookup ("show me transfers to this wallet") would use.
   - A `checkpoints` table (`address TEXT PRIMARY KEY`, `last_signature TEXT`) tracking, per watched address, the most recent signature already indexed.
   - A script fetches signatures for the watched address newer than the stored checkpoint (using `getSignaturesForAddress`'s `until` parameter), parses each transaction for SPL transfer instructions, and upserts every result into `transfers` with `INSERT OR IGNORE`, then advances the checkpoint to the newest signature seen.
   - Running the script twice in a row with no new activity in between must insert zero new rows the second time, and must not error.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts <A MINT ADDRESS YOU'VE USED BEFORE>

       Expected output shape:
           Watching: 6nBWg...
           Checkpoint (fetching newer than): (none — first run)
           Found 4 new signature(s).
           Inserted 4 new transfer row(s) (Concept 11: duplicates silently
           ignored).
           Checkpoint advanced to: 5f3G...

           Total indexed transfers to this address: 4

   2. Command: run the exact same command a second time immediately.

       Expected output: "Found 0 new signature(s)," "Inserted 0 new
       transfer row(s)," and the checkpoint line does NOT print (no new
       signatures to advance to) — confirming Concept 10's checkpoint
       genuinely narrowed the fetch, this wasn't just idempotency quietly
       discarding duplicates fetched all over again.

   3. Command: send yourself a new transfer of the same mint (any
       earlier week's client script that does a transfer works),

           then re-run the indexer.

       Expected output: "Found 1 new signature(s)," "Inserted 1 new
       transfer row(s)," and the total count increases by exactly 1 —
       confirming the indexer picks up genuinely new activity
       incrementally, without re-scanning or re-inserting anything from
       before.

   4. Command: manually delete the checkpoints table's row (or the
       whole indexer.db file) and re-run.

       Expected output: the indexer falls back to a full historical scan
       (every signature ever, back to whatever getSignaturesForAddress's
       default limit covers), and re-inserts everything, but Concept 11's
       INSERT OR IGNORE means the total count ends up EXACTLY the same as
       before, not doubled — confirming idempotency holds even under a
       full checkpoint loss, not just a normal incremental rerun.
   ```

2. **Medium - Real-Time Program Event Indexing via WebSocket Push.**

   **What you practice:**
   - Emitting a structured on-chain event from an Anchor program via `emit!` (new this week, Week 16's IDL/client machinery already supports decoding it)
   - Subscribing to those events live via `program.addEventListener`, Week 16, Concept 6's event listening, used here as this week's actual indexing mechanism, push rather than Easy's poll (Concept 9)
   - Confirming the same idempotent-write discipline (Concept 11) holds even when the same event is delivered to the handler more than once

   **Requirements:**
   - A minimal Anchor program, `counter-events`, existing purely to emit events, deliberately small so the assignment's focus stays on indexing, not contract design.
   - A `Counter` PDA (seeds `["counter", owner]`) storing `owner: Pubkey`, `value: u64`.
   - `initialize(ctx)` creates it at `value = 0`.
   - `increment(ctx, amount)` adds `amount` (checked) and emits a `CounterIncremented { owner, amount, new_value }` event via `emit!`.
   - A `counter_events` table (`signature TEXT`, `event_index INTEGER`, `owner TEXT`, `amount TEXT`, `new_value TEXT`, `indexed_at INTEGER`, primary key on `(signature, event_index)`, Concept 11, since a single transaction could in principle emit more than one event).
   - A test creates a counter, subscribes via `addEventListener` before any increments happen, calls `increment` three times, and confirms all three events were captured live by the listener, in order, with no polling involved anywhere in the test.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --provider.cluster localnet

       Expected output:
           counter-events
           ✔ captures every increment live via addEventListener, with
               idempotent writes (....ms)

           1 passing

   2. Command: verify by hand.

       capturedEvents must contain exactly 3 entries with new_value
       "10", "15", "18" in that order — confirming events arrived live,
       in the correct order, with the correct cumulative state, not just
       that "some events happened."

   3. Command: temporarily move the `program.addEventListener(...)`
       call to AFTER the three increment() calls instead of before them,
       and re-run.

       Expected output: 1 failing — capturedEvents.length is 0, since a
       websocket subscription only receives events emitted AFTER it
       starts listening, exactly Concept 9's real trade-off: push
       delivers nothing retroactively, unlike Easy's poll, which would
       have found all of them regardless of when it ran. Revert this
       change afterward.

   4. Command: temporarily change the primary key in the CREATE TABLE
       statement from `PRIMARY KEY (signature, event_index)` to no
       primary key at all, then re-run the "duplicate delivery"
       assertion logic by hand (insert the same row twice).

       Expected output: the row count assertion now fails at 2 instead
       of 1 — confirming the primary key itself is the actual mechanism
       enforcing Concept 11's idempotency, `INSERT OR IGNORE` only
       silently discards a duplicate because SQLite recognizes it AS a
       duplicate via that key, without it, every "duplicate" insert
       becomes a genuine new row instead. Revert this change afterward.
   ```

3. **Hard - A Verified Webhook Receiver With Backfill Reconciliation.**

   **What you practice:**
   - Building an HTTP endpoint that verifies a shared-secret header before processing any payload (Concept 12), rejecting anything that doesn't include it
   - Ingesting webhook-delivered events into the exact same idempotent schema shape Easy's polling indexer uses, confirming one unified database doesn't care which path data arrived through (Concept 7, 11)
   - Running a reconciliation pass, Easy's polling logic, reused directly, against a webhook receiver that (realistically) misses some deliveries, and confirming the backfill catches exactly what was missed and nothing more (Concept 8)

   **Requirements:**
   - No public tunnel or real Helius webhook registration, out of scope for this assignment, an honest simplification. A local Express server plays the role of "webhook receiver," and the test script itself sends `POST` requests shaped like real Helius webhook payloads directly to `localhost`, exactly what a real Helius delivery would send over the public internet.
   - `POST /webhook` requires an `Authorization: Bearer <secret>` header matching a locally-configured secret; a missing or wrong secret gets rejected with `401` before the payload is parsed at all (Concept 12).
   - A valid payload (an array of transfer-shaped objects: `signature`, `slot`, `blockTime`, `source`, `destination`, `amount`, `mint`) gets upserted into the exact same `transfers` table shape Easy's assignment used (`INSERT OR IGNORE` on `signature`, Concept 11).
   - A reconciliation script accepts a list of signatures the webhook "should have" delivered (simulating real activity) against a smaller list actually `POST`ed to the receiver (simulating a realistic partial delivery failure), then runs Easy's polling logic to backfill anything the webhook missed, and reports exactly how many rows came from each path.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx server.ts (terminal 1), then npx tsx reconcile.ts
       (terminal 2, same WEBHOOK_SECRET exported in both)

       Expected output (reconcile terminal):
           Step 1: Rejected-auth check — sending with NO secret first.
           Response without auth header: 401 (expect 401)

           Step 2: Delivering 3 of 5 events via the (authorized) webhook path...
           Webhook response: { received: 3, inserted: 3 }

           Step 3: Reconciliation — backfilling whatever the webhook missed
           (Concept 8, 10).
           Backfill inserted 2 row(s) that the webhook had missed.

           Final row counts by source path: [
           { source_path: 'webhook', count: 3 },
           { source_path: 'backfill', count: 2 }
           ]
           Total rows: 5 (expect exactly 5 — all of Concept 8's "both paths
           together" story, no duplicates, no gaps)

   2. Command: verify by hand, in the server terminal.

       The first request should log "Rejected an unauthorized webhook
       request," and only the SECOND request should log a real "Webhook
       delivery: 3 event(s)..." line — confirming Concept 12's check
       actually runs before any event is processed, not merely that the
       response code was eventually correct.

   3. Command: run npx tsx reconcile.ts a SECOND time (server still
       running from before, indexer.db not deleted).

       Expected output: "Webhook response: { received: 3, inserted: 0 }"
       and "Backfill inserted 0 row(s)," total rows still exactly 5 —
       confirming Concept 11's idempotency holds across BOTH paths
       together, redelivering the same webhook events and re-running the
       same backfill both correctly recognize everything as already
       indexed, neither path duplicates the other's work either.

   4. Command: temporarily change the Authorization check in server.ts
       from `authHeader !== \`Bearer ${WEBHOOK_SECRET}\`` to always pass
       (e.g. `false`), restart the server, delete indexer.db, and re-run
       reconcile.ts.

       Expected output: Step 1's "response without auth header" now
       returns 200 instead of 401, and its 3 events get inserted into
       the database despite having sent zero authorization, confirming
       Concept 12's check was the entire thing standing between this
       endpoint and accepting completely unauthenticated data from
       anyone who finds the URL. Revert this change afterward.
   ```
