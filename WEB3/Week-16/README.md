# List of things learned.

## 1. The Anchor IDL, in full. (local files vs. on-chain)

Week 15, Concept 5 introduced the IDL as the JSON file `anchor build` writes to `target/idl/` and every client so far has imported that file directly.

That only works because you have the program's own source tree sitting right there.

A **third party** building a client against your deployed program, with no access to your repo at all, needs another way to get it.

Anchor supports publishing the IDL **on-chain**, in a dedicated account derived from the program's own address:

```
anchor idl init --filepath target/idl/counter_anchor.json <PROGRAM_ID> --provider.cluster devnet
```

Once published, any client can fetch it directly from the cluster, no local build artifacts required at all:

```typescript
const idl = await Program.fetchIdl(programId, provider);
```

This week's assignments still import the local JSON file, exactly Week 15's pattern, since it's simpler and this course controls both sides. Worth knowing this second path exists, though:

- it's how block explorers and third-party tools (Solscan, Week 1's block explorer, among them) show a fully decoded instruction and account view for programs they've never seen the source code of.

---

## 2. `@coral-xyz/anchor` client setup, formalized.

Every client this course has written since Week 15 follows the same four-step shape, worth naming precisely now:

```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Week 10
const wallet = new Wallet(loadLocalWallet()); // Week 12/14's pattern, wrapped
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
anchor.setProvider(provider); // registers it globally
```

- `Wallet` here is Anchor's own thin wrapper around a `Keypair` (or, in a browser context, around wallet-adapter's `useWallet()`, Week 12), giving it the `signTransaction`/`signAllTransactions` shape `AnchorProvider` expects.

- `setProvider` matters specifically for `anchor.workspace.X` (Week 15, Medium's testing pattern), which reads whatever provider was last registered globally, rather than one you pass explicitly.

---

## 3. Program instance creation & Program ID's origin.

```typescript
const program = new Program(idl as anchor.Idl, provider);
```

No separate `PROGRAM_ID` constant is needed, current Anchor IDLs embed the deployed program's own address directly in the IDL JSON's `address` field (set from `declare_id!`, Week 15, Concept 2, at build time) and `Program`'s constructor reads it from there automatically.

This is different from Week 14's raw client, which needed a manually pasted `PROGRAM_ID` constant with no automatic source of truth at all, one more piece of manual bookkeeping the IDL removes.

---

## 4. 3 ways to call an instruction. (not just `.rpc()`)

Every Anchor client so far has used

- `.rpc()`,
- sign,
- send &
- confirm,

in one call.

That's actually the _simplest_ of three related methods every instruction builder exposes:

```
.rpc()              -> signs, sends, AND confirms, in one call (every prior week's pattern)
.transaction()      -> returns an UNSIGNED Transaction — you sign, send, and confirm it yourself
.instruction()      -> returns just the raw TransactionInstruction — you build the whole
                       Transaction yourself, exactly Week 14's raw client's own shape
```

`.transaction()` matters the moment you need Week 10's manual confirmation strategy (`{ signature, blockhash, lastValidBlockHeight }`) instead of `.rpc()`'s built-in one, or need to inspect/modify the transaction before sending.

`.instruction()` matters the moment you need to combine an Anchor-generated instruction with something Anchor didn't generate, Concept 7 does exactly this, combining one with a plain `ComputeBudgetProgram` instruction (Week 10, Concept 8) in a single transaction.

---

## 5. Fetching & Deserializing account data. (beyond a single `.fetch()`)

Week 15's clients only ever fetched one known PDA at a time.

Two more methods exist on every `program.account.<name>` object:

- **`.all()`** : Fetches every existing account of this Rust type under this program, regardless of whose it is.

  Optionally filtered (by exact byte match at a given offset, `memcmp`, or by exact size, `dataSize`), useful for "give me every counter that exists," not just one you already know the address of.

- **`.fetchMultiple([...])`** : Batch-fetches several _known_ addresses in a single RPC round-trip, instead of awaiting several separate `.fetch()` calls in sequence.

  A missing account shows up as `null` in the corresponding array position, rather than throwing, worth handling explicitly.

---

## 6. Event listening.

An Anchor program can `emit!` a structured, typed event from inside an instruction:

```rust
emit!(CounterIncremented { counter: ctx.accounts.counter.key(), new_count: counter.count });
```

Mechanically, this is a specially-formatted log line (`sol_log_data`, a real Solana syscall) inside the transaction's logs, nothing more exotic than that.

A client subscribes with:

```typescript
const listenerId = await program.addEventListener(
  "counterIncremented",
  (event) => {
    /* ... */
  },
);
```

which, underneath, opens a WebSocket subscription to the RPC's log stream and parses out matching event data automatically.

One honest caveat, more than any other API this course has used:

**the exact shape of `addEventListener` (sync vs. async, and whether numeric fields arrive as Anchor's `BN` or a native `bigint`) has shifted across recent Anchor versions and forks.**

> This week's Hard assignment codes defensively around that uncertainty, verify the exact signature against your installed `@coral-xyz/anchor` version's own type definitions before trusting it blindly.

---

## 7. Transaction building & Sending. (combining Anchor with plain instructions)

Concept 4's `.instruction()` returns an ordinary `TransactionInstruction`, which means it composes with anything else Week 10–14 already taught you to build.

The clearest real-world case:

- adding a **compute budget instruction** (Week 10, Concept 8's compute units, made actionable) alongside an Anchor call, to set a priority fee:

```typescript
const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 });
const incrementIx = await program.methods.increment().accounts({...}).instruction();

const tx = new Transaction({ feePayer, blockhash, lastValidBlockHeight })
  .add(priorityFeeIx)
  .add(incrementIx);
```

Anchor's `.rpc()` shortcut has no way to express this, it only ever sends the one instruction it built.

Reaching for `.instruction()` and building the `Transaction` by hand, exactly Week 14's raw pattern, is how a real production client combines Anchor calls with anything Anchor itself doesn't know about.

---

## 8. Error decoding from Anchor programs.

Week 15, Concept 6 built custom errors with `#[error_code]`.

From the client side, a failed `.rpc()` call throws and what it throws is worth branching on:

```typescript
try {
  await program.methods.someInstruction().accounts({...}).rpc();
} catch (err: unknown) {
  if (err instanceof anchor.AnchorError) {
    // A genuine custom error from THIS program's own #[error_code] enum.
    console.log(err.error.errorCode.code, err.error.errorMessage);
  } else {
    // A raw Solana-level failure (insufficient funds, account already
    // in use, a failed CPI) — never reaches an AnchorError shape at all.
    const reason = err instanceof Error ? err.message : String(err);
    console.log(reason);
  }
}
```

This distinction is genuinely important, not every failure a program can produce is an `AnchorError`, plenty of failures (a CPI to the System Program failing, an account collision) surface as raw errors with no `errorCode`/`errorMessage` shape at all.

A robust client checks for the specific case first and falls back gracefully, exactly Week 14, Concept 7's "never assume the happy path" lesson, now applied to the client side of the same programs.

---

## Assignment.

1. **Easy - Three Ways to Call an Instruction.**

   **What you practice:**
   - Calling the exact same `increment` instruction three different ways, `.rpc()`, `.transaction()` plus manual sign/send/confirm, and `.instruction()` plus a fully hand-built `Transaction`
   - Confirming all three produce an identical on-chain effect, just with different amounts of manual wiring underneath Anchor's convenience layer
   - Reusing Week 15's already-deployed `counter-anchor` program without any redeployment at all

   **Requirements:**
   - Derives the same `["counter", payer_pubkey]` PDA Week 15 used, against your already-deployed program.
   - Calls `increment` via `.rpc()` first, printing the resulting count.
   - Calls `increment` a second time via `.transaction()`, manually setting `feePayer`/`recentBlockhash`, sending with `connection.sendTransaction`, and confirming with the object-based strategy (Week 10), printing the resulting count.
   - Calls `increment` a third time via `.instruction()`, building a `Transaction` from scratch around it, sending and confirming exactly as Week 14's raw client did, printing the resulting count.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (starting count depends on how many times
       Week 15's counter has already been incremented):
           Counter PDA: 4mNpQ...
           Starting count: 5

           [.rpc()] Signature: 5f3G...
           [.rpc()] Count now: 6

           [.transaction()] Signature: 2kLp...
           [.transaction()] Count now: 7

           [.instruction()] Signature: 8kNw...
           [.instruction()] Count now: 8

   2. Command: verify by hand.

       Count increases by exactly 1 after each of the three calls,
       regardless of which method produced it.

       Confirming all three are different amounts of client-side
       plumbing around the SAME on-chain instruction, not three
       different instructions.

   3. Command: re-run npx tsx index.ts a second time.

       Expected output: starting count now matches whatever the previous
       run ended on, three more increments follow.

       Confirming state persisted correctly across separate script runs,
       as every prior week's on-chain state has.

   4. Command: Temporarily delete the line `tx.recentBlockhash = blockhash;`
           from Way 2, leaving tx.feePayer set, then run npx tsc --noEmit.

       Expected output: this still TYPE-checks fine (recentBlockhash is
       optional on the Transaction type until send time), but if you
       actually run it, connection.sendTransaction will fail at runtime
       with a missing-blockhash error — a good reminder that Week 10's
       confirmation fields aren't just types to satisfy, they're required
       at the protocol level regardless of what TypeScript allows you to omit.

       Revert this change afterward.
   ```

2. **Medium - Fetching Account Data at Scale: `.all()` & `.fetchMultiple()`.**

   **What you practice:**
   - Using `.all()` to fetch every existing account of a given type under a program, rather than one address you already knew
   - Using `.fetchMultiple()` to batch several known addresses into a single RPC round-trip, and handling a genuine miss (`null`) inside that batch correctly
   - Confirming both methods reflect real, live state, by running this assignment after Easy has already changed the counter's value

   **Requirements:**
   - Fetches the known counter PDA with a single `.fetch()` call, printing its count (Week 15's baseline behavior, for comparison).
   - Calls `.all()` on `program.account.counterAccount`, printing every returned entry's address and count.
   - Derives a second PDA using a **different** seed prefix (e.g. `"counter-that-was-never-initialized"`) against the same wallet and program, guaranteed to never have been created, and confirms it independently.
   - Calls `.fetchMultiple([realPda, neverInitializedPda])` in one batch, printing both results, explicitly handling the `null` case for the second one.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Single .fetch(): 8

           .all() found 1 counter account(s):
           4mNpQ... -> count 8

           .fetchMultiple() results:
           Real PDA:           8
           Never-initialized PDA: null

   2. Command: verify by hand.

       The count in "Single .fetch()", the count inside the .all()
       listing, and the first entry of .fetchMultiple() must all read
       the EXACT same number — three different query shapes, all
       reading the identical underlying on-chain account.

   3. Command: verify the invariant on the second entry.

       "Never-initialized PDA" must read null, not throw, not print
       undefined — confirming .fetchMultiple() represents a genuine miss
       as a value in the array, something a caller has to explicitly
       check for (exactly the `!== null` guard in the Solution code),
       rather than an exception you'd need a try/catch to handle.

   4. Command: temporarily change `program.account.counterAccount.all()`
       to `program.account.counterAccount.all("not-a-real-filter")`
       (passing a plain string instead of a proper filter array), then

           run npx tsc --noEmit.

       Expected output: a type error, reporting that a string isn't
       assignable to .all()'s expected filter parameter type —
       confirming the IDL-derived typings extend to method arguments,
       not just return values.

       Revert this change afterward.
   ```

3. **Hard - Event Listening, a Combined Transaction & Error Decoding.**

   **What you practice:**
   - Adding a real `emit!` event to Week 15's counter program and upgrading the existing deployment in place, same program ID, same PDA
   - Subscribing with `addEventListener` _before_ sending a transaction, then confirming the event actually arrives after that transaction confirms
   - Building one transaction combining an Anchor instruction with a plain `ComputeBudgetProgram` instruction, and branching error-handling on `AnchorError` vs. a raw Solana-level failure

   **Requirements:**
   - Adds a `CounterIncremented { counter: Pubkey, new_count: u64 }` event (via `#[event]`) to `counter-anchor`'s `increment` instruction, and upgrades the existing devnet deployment (same program ID, `anchor deploy` again).
   - The client subscribes to `"counterIncremented"` before sending anything, then sends one transaction containing **both** a `ComputeBudgetProgram.setComputeUnitPrice` instruction and the Anchor-generated `increment` instruction (via `.instruction()`), in that order.
   - After confirming, the client waits briefly, then reports whether the event listener actually received the event, and removes the listener afterward.
   - The client then deliberately calls `initialize` a second time on the already-initialized counter PDA, catching the failure and printing whichever of the two error branches (Concept 8) actually applies.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           [event] CounterIncremented: 4mNpQ... -> new_count 9
           Increment (with priority fee) confirmed: 7hRt...

           Event received before cleanup: true

           Caught a non-Anchor error (expected here — re-creating an existing
           account fails at the System Program/CPI level, not as a custom Anchor error):
           Message: ...already in use...

   2. Command: verify by hand.

       "Event received before cleanup" MUST read true — this is Concept
       6's actual point: the subscription genuinely caught a real,
       server-pushed event tied to the transaction that just confirmed,
       not a value you could have gotten from the transaction's return
       value alone.

   3. Command: verify the error branch by hand.

       The output should land in the "non-Anchor error" branch, not the
       AnchorError branch — re-creating an account that already exists
       fails during the init constraint's own account-creation CPI,
       before your program's own #[error_code] logic ever runs, exactly
       Concept 8's distinction between the two failure categories.

   4. Command: temporarily change the emit! call's field name from
           new_count to newCount (Rust naming convention broken on purpose),

           Then run anchor build.

       Expected output: a Rust compile error, since CounterIncremented's
       struct definition still declares the field as new_count — the
       emit! call and the struct definition must agree exactly, Rust's
       ordinary struct-literal field-name checking applies here just as
       it would anywhere else in this course's Rust code.

       Revert this change afterward.
   ```
