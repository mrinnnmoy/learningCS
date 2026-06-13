# List of things learned.

## 1. The Solana runtime. (A different shape of blockchain entirely)

Week 2 built a mental model of _"a blockchain"_ from first principles:

- blocks,
- hashing,
- a mempool,
- a consensus rule.

Solana implements every one of those ideas, but reshapes almost all of them for a single overriding goal, high throughput without sacrificing decentralization and gives each reshaped piece its own name.

This week names and explains all of them; Week 11 then goes one level deeper into the account model itself.

```
Client sends a tx
     |
     v
Gulf Stream    -- forwarded straight to the upcoming leader, no shared mempool (Concept 6)
     |
     v
Sealevel       -- the leader executes many non-conflicting txs IN PARALLEL (Concept 2)
     |
     v
Proof of History -- every event gets stamped into a verifiable, ordered hash chain (Concept 3)
     |
     v
Turbine        -- the resulting block is propagated to the rest of the cluster (Concept 6)
     |
     v
Tower BFT      -- validators vote on and finalize the chain built on that PoH sequence (Concept 4)
     |
     v
Cloudbreak     -- the resulting account state lives here, ready for the NEXT leader (Concept 7)
```

Every remaining concept this week is one node in that diagram, expanded.

---

## 2. Sealevel. (parallel transaction execution)

Ethereum's EVM (Week 26) processes transactions one at a time, in strict sequence, on a single logical thread, that's a large part of why Ethereum's throughput is capped so low.

Solana's runtime, **Sealevel**, takes a fundamentally different approach. It executes many transactions **in parallel**, across all available CPU cores, whenever it's safe to do so.

The trick is a requirement Week 11 will cover in full, every Solana transaction must declare, upfront, exactly which accounts it will read and which it will write.

With that declared list in hand _before_ execution even starts, the runtime can build a dependency graph and answer one question cheaply:

_Do any two transactions touch the same writable account?_

```
Tx A: writes account X            Tx B: writes account Y            Tx C: writes account X
      reads account Y                    reads account X

A and C both write X -> conflict, must run sequentially relative to each other
A and B, B and C -> no overlapping writes -> safe to run in parallel
```

This is the single biggest architectural bet Solana makes and it's why "declare your accounts upfront" (Week 14 onward) isn't a stylistic preference, it's the mechanism that makes parallelism possible at all.

---

## 3. Proof of History. (A verifiable clock, not a consensus mechanism)

Week 2 raised the ordering problem directly:

- independent nodes,
- no shared clock,
- how do you agree what happened first?

Most chains solve this purely through consensus, communication rounds where nodes vote on order.

Solana adds a second tool on top: **Proof of History (PoH)**, a way to prove that time has passed and in what order events occurred, without needing a communication round for every single event.

PoH is, mechanically, a very long, continuously-running SHA-256 hash chain (Week 2's hash-chaining idea, Week 3's hash function, applied to _time itself_ rather than to block content).

Each hash's output feeds directly back in as the input to the next hash, over and over, as fast as a CPU core can compute it.

```
seed -> H(seed) -> H(H(seed)) -> H(H(H(seed))) -> ...
        each step is one "tick" -- a verifiable unit of elapsed time
```

Any event (like a transaction) can be mixed into the chain at a specific tick, which timestamps it, verifiably, relative to everything else in the chain, since reproducing that exact sequence of hashes without actually doing the sequential work is computationally infeasible (the same one-way-function property from Week 3).

PoH doesn't decide _which_ chain is canonical, that's still a consensus problem, but it lets validators agree on **ordering and elapsed time** essentially for free, without waiting on network round-trips for every single tick, which is what makes Solana's block times so short.

---

## 4. Tower BFT. (Consensus built on top of PoH's clock)

**Tower BFT** is Solana's actual consensus mechanism, Solana's specific implementation of Proof of Stake (Week 2 named PoS in general terms; this is what it looks like in practice here).

It's a variant of PBFT-style consensus, but instead of needing multiple full communication rounds to agree on ordering (the expensive part of classic BFT algorithms), it uses PoH's already-agreed-upon sequence as a global clock, cutting most of that communication overhead out entirely.

The distinctive mechanic, every time a validator votes for a fork, it accepts a **lockout**, a period during which it's forbidden from voting for any _conflicting_ fork.

Each subsequent vote on the same fork doubles the next lockout period.

```
Vote 1 on fork A -> locked out from voting elsewhere for 2 slots
Vote 2 on fork A -> locked out from voting elsewhere for 4 slots
Vote 3 on fork A -> locked out from voting elsewhere for 8 slots
...
```

This is Week 2's **finality** concept (Week 2, Concept 5) made concrete: a block isn't "finalized" in one instant, it becomes exponentially more expensive, vote by vote, for a validator to abandon it.

That's exactly the "increasingly costly to reverse" shape Week 2 described for probabilistic finality, just with the exact cost schedule made explicit and enforceable, rather than left as an informal "wait for more confirmations" heuristic.

---

## 5. Validators, The Leader schedule & Clusters.

Week 2 already drew the line between a generic **node** and a **validator** (a node that stakes value to earn the right to propose blocks).

Solana adds one more piece of structure on top: at any given moment, exactly **one** validator is the **leader**, the only one allowed to produce blocks for the current slot.

- Leaders aren't chosen live, per-slot. A **leader schedule** is computed in advance, once per **epoch** (roughly two days on mainnet-beta), assigning specific validators to specific upcoming slots, weighted by how much stake each validator has.

- Because the schedule is known in advance, clients and other validators always know exactly who the _next_ leader will be, well before that slot arrives. This single fact is what makes Concept 6's Gulf Stream possible at all.

> Week 1 already introduced the localnet → devnet → testnet → mainnet ladder in general terms. On Solana specifically, these are literally separate **clusters**, entirely independent networks, each with their own validator set, leader schedule and (on devnet/testnet) faucet-issued test SOL, sharing nothing with mainnet-beta except the same client software and protocol rules.

---

## 6. Gulf Stream & Turbine. (Getting a transaction from client to confirmed block)

Two more Solana-specific subsystems, one for getting a transaction _in_, one for getting a finished block _out_:

- **Gulf Stream** replaces the shared, first-come-first-served mempool Week 2 described.

  Since the leader schedule (Concept 5) is known ahead of time, clients (and validators relaying on their behalf) forward transactions **directly to the upcoming leader**, before that leader's slot even arrives, instead of broadcasting into a shared public waiting room every node can see.

  This cuts confirmation latency substantially, and also removes an entire category of mempool-visible front-running surface that Week 45 covers in depth for chains that still rely on a public mempool.

- **Turbine** handles the opposite direction: once a leader produces a block, it doesn't send the full block individually to every validator.

  Instead, the block is broken into many small packets, erasure-coded (so the original data can be reconstructed even if some packets are lost) and propagated outward through a fanout tree, each validator forwards packets to a handful of others, rather than the leader alone bearing the bandwidth cost of the entire cluster.

---

## 7. Cloudbreak. (The accounts database built for Sealevel's parallelism)

Sealevel (Concept 2) can only execute transactions in parallel if the underlying account data itself can actually be read and written in parallel, without one slow disk becoming the bottleneck.

**Cloudbreak** is Solana's purpose-built accounts database: it memory-maps account data and spreads it horizontally across many SSDs simultaneously, so multiple unrelated accounts really can be read and written concurrently at the storage layer, not just at the CPU-scheduling layer Concept 2 described.

This is a direct architectural response to Week 5's serialization work: every account's data sitting in Cloudbreak is Borsh-encoded bytes (Week 5, Concept 3), read and written directly, with no intermediate database engine or query layer in between.

Week 11's account model, next week, is what those bytes are structured as.

---

## 8. Transaction fees, Rent & Compute units.

Week 2's generic fee/gas concept gets three specific, Solana-shaped mechanisms:

- **Base transaction fee**: A small, largely flat fee (paid in lamports, 1 SOL = 1,000,000,000 lamports) charged per signature on a transaction, currently a flat 5,000 lamports per signature on mainnet-beta at the time of writing.

  An optional **priority fee** can be added on top as a tip, Solana's own version of Week 2's fee-market idea, without Ethereum's `EIP-1559` burn mechanism (Week 26 covers that model specifically).

- **Rent**: Every account must maintain a minimum SOL balance, proportional to how many bytes of data it stores, to stay **rent-exempt**.

  Fall below that threshold and an account can eventually be purged from the network. In practice, almost every account funded today is created rent-exempt from the start, Week 11 covers the account model (and this threshold) in full detail.

- **Compute units (CU)**: Every instruction consumes a metered amount of compute as it executes and each transaction has a **compute budget**, a cap on total CU it's allowed to consume, similar in spirit to Ethereum's gas limit (Week 26), but priced and metered independently of the base fee rather than being the same number.

  A transaction can explicitly request a higher compute budget (or a lower one, to signal priority) via a dedicated system instruction.

> This week's Hard assignment reads all three of these directly off a real devnet transaction, rather than taking the numbers on faith.

---

## Assignment.

1. **Easy - Cluster & Slot Explorer.**

   **What you practice:**
   - Opening a `Connection` to a real public cluster and making read-only RPC calls against it, with TypeScript inferring (or explicitly annotating) each response's real shape
   - Reading cluster version and epoch info directly, connecting Concept 5's "leader schedule computed once per epoch" to real epoch/slot numbers
   - Directly observing Proof of History's clock ticking on its own, with no transaction of yours involved, by polling the slot number twice with a delay in between

   **Requirements:**
   - Connects to devnet via `clusterApiUrl("devnet")` and prints the cluster's Solana core version.
   - Fetches and prints the current epoch, the slot index within that epoch (`slotIndex` / `slotsInEpoch`), and the absolute slot number.
   - Fetches and prints the number of cluster nodes visible to this RPC endpoint.
   - Reads the current slot, waits 2 seconds, reads the slot again, and prints both readings plus the difference between them.
   - The whole file type-checks cleanly under `strict: true`, with no `any` types written by hand.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your actual numbers will differ):
           Cluster: devnet
           Solana core version: 1.18.x

           Current epoch: 650   (some positive integer)
           Slot index within epoch: 123456 / 432000
           Absolute slot: 281000000   (some large positive integer)

           Active cluster nodes visible to this RPC: 1900   (a positive integer, typically in the hundreds to low thousands on devnet)

           Slot before 2s wait: 281000000
           Slot after 2s wait:  281000005
           Slots advanced: 5   (expect several, at ~400ms per slot)

   2. Command: Verify the invariants by hand, not the literal numbers.

       - Solana core version should look like a real version string
           (e.g. 1.18.something), not undefined.

       - slotIndex should be strictly less than slotsInEpoch.

       - "Slot after" must be greater than "Slot before" — this is the
           actual point of the assignment: Proof of History's clock is
           ticking whether or not any of your own transactions exist.

       - "Slots advanced" should be a small positive number, roughly in
           the range of 3-8 for a 2 second wait at ~400ms per slot. A
           value of 0 would indicate a stalled connection, not a stalled
           network — re-run the script.

   3. Command: Re-run npx tsx index.ts two or three times, a few
   seconds apart.

       Expected output: the absolute slot number should be strictly
       higher on each successive run, confirming the same thing Test 2
       confirmed, but across separate process invocations rather than
       within a single one.

   4. Command: Temporarily change `const slotBefore: number = ...` to
       `const slotBefore: string = ...`, leaving everything else
       unchanged, then run npx tsc --noEmit.

       Expected output: a type error, reporting that a Promise<number>
       isn't assignable to a string — confirming the "type-checks
       cleanly" requirement is actually being enforced, not just true by
       accident. Revert this change afterward.
   ```

2. **Medium - Leader Schedule & Validator Stake.**

   **What you practice:**
   - Fetching the current slot leader and cross-checking it against the live validator set, making Concept 5's "leader schedule known in advance" fact independently verifiable
   - Fetching real vote accounts and computing a genuine decentralization metric (stake concentration among the top validators) from live data
   - Explicitly typing an array built from `@solana/web3.js`'s own exported `VoteAccountInfo` type, instead of letting it fall back to an inferred, looser shape
   - Connecting Concept 6's Gulf Stream idea, "clients forward transactions directly to a known upcoming leader", to the fact that leader really is a specific, identifiable, currently-active validator, not an abstraction

   **Requirements:**
   - Fetches and prints the current slot and the current slot leader's pubkey.
   - Fetches the full set of vote accounts (current + delinquent), combines them into a single array typed as `VoteAccountInfo[]`, and confirms the current leader's pubkey appears among them, printing the result as a boolean.
   - Computes the combined `activatedStake` of all currently active validators, and separately the combined stake of the top 10 by stake, printing the top 10's share as a percentage of the total.
   - Prints the total number of currently active validators.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your actual numbers will differ):
           Current slot: 281000123
           Current slot leader: 7xKXt...   (a valid base58 pubkey, ~43-44 characters)

           Total known validators (current + delinquent): 1400   (a positive integer)
           Current leader matches a known validator entry: true

           Active validators: 1350   (a positive integer, typically somewhat below the total above)
           Top 10 validators hold 12.34 % of total active stake

   2. Command: Verify the invariants by hand.

       - Current slot leader should be a plausible base58 string, not
           empty or undefined.

       - "matches a known validator entry" should read true — this is
           the actual point of the assignment: the leader Gulf Stream would
           forward a transaction to right now is a real, identifiable
           validator you can cross-reference independently, not a black
           box. (On rare occasions this can print false, since
           getSlotLeader() and getVoteAccounts() are two separate RPC
           calls made a few milliseconds apart, and the leader could
           theoretically shift between them. If you see false, just re-run
           the script, don't assume the code is wrong.)

       - The top-10 stake share percentage should be a number strictly
           between 0 and 100. On devnet specifically, don't be surprised if
           it's noticeably higher than what you'd see on mainnet-beta,
           devnet's validator set is far smaller and less distributed.

   3. Command: Re-run npx tsx index.ts after waiting a minute or two.

       Expected output: a different "Current slot leader" pubkey than
       the first run, in most cases — leaders rotate far more often
       than once a minute, so seeing the same leader twice in a row
       would be the more surprising outcome, not the other way around.

   4. Command: Temporarily change `v.nodePubkey === currentLeader` to
       `v.nodePubkey === 123`, then run npx tsc --noEmit.

       Expected output: a type error, reporting that a number isn't
       comparable to nodePubkey's actual string type — this is exactly
       the "compiler catches a wrong field/type before you run it"
       benefit called out in this week's Assignment intro, made
       concrete.

       Revert this change afterward.
   ```

3. **Hard - Fees, Rent & Compute Units on a Real Transaction.**

   **What you practice:**
   - Airdropping devnet SOL to a freshly generated `Keypair` (Week 1's faucet concept, in actual code)
   - Building a real `SystemProgram.transfer` instruction and reading its **exact** base fee straight from the cluster, rather than taking Concept 8's "flat per-signature fee" description on faith
   - Reading the real rent-exemption minimum for two different account sizes, connecting Concept 8's rent explanation to Week 17's upcoming SPL token account size
   - Simulating (not sending) a transaction to read back its actual **compute units consumed**, making Concept 8's compute budget concept a real, observed number instead of an abstraction
   - Using the non-deprecated, blockhash-aware `confirmTransaction` overload, and understanding why the older signature-only overload is best avoided

   **Requirements:**
   - Generates two `Keypair`s (`payer`, `receiver`), airdrops 1 devnet SOL to `payer`, confirms the airdrop via the object-based confirmation strategy (`{ signature, blockhash, lastValidBlockHeight }`), and prints the resulting balance.
   - Builds a `SystemProgram.transfer` instruction moving a small amount of lamports from `payer` to `receiver`, compiles it into a `v0` message using a freshly-fetched blockhash, and prints the exact base fee returned by `connection.getFeeForMessage`.
   - Prints the rent-exemption minimum lamport balance for a 0-byte account and, separately, for a 165-byte account (the size of an SPL token account, previewed here ahead of Week 17).
   - Signs the transaction locally and calls `connection.simulateTransaction` (never `sendTransaction`, nothing is actually broadcast), printing the `unitsConsumed` value from the simulation result.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your actual numbers may differ slightly,
       though fee/rent/compute figures tend to be far more stable across
       runs than slot or leader data, since they're closer to protocol
       constants than to live scheduling state):

           Requesting devnet airdrop for payer...
           Payer funded with: 1 SOL

           Base fee for a one-signature transfer: 5000 lamports

           Rent-exempt minimum, 0-byte account:   890880 lamports
           Rent-exempt minimum, 165-byte account: 2039280 lamports (SPL token account size — Week 17)

           Compute units consumed by this transfer: 150

   2. Command: Verify the invariants by hand.

       - "Payer funded with" should read exactly 1 SOL, matching the
           LAMPORTS_PER_SOL airdrop requested.

       - The base fee should be a small positive integer, typically 5000
           lamports for a single-signature transfer on current cluster
           software — this is Concept 8's "largely flat per-signature fee"
           claim, now an observed number instead of a claimed one.

       - The 165-byte rent-exemption minimum must be strictly greater
           than the 0-byte one — more stored data costs more rent-exempt
           SOL, confirming Concept 8's "proportional to size" claim
           directly.

       - unitsConsumed should be a small positive integer, since a plain
           SystemProgram.transfer does very little work compared to, say, a
           token swap or an NFT mint (Weeks 17 and 22 will show noticeably
           larger figures here for more complex instructions).

       - No deprecation warning should print anywhere in the output —
           if one does, double check confirmTransaction is being called
           with the object form, not a bare signature string.

   3. Command: Re-run npx tsx index.ts end to end (a fresh payer is
       generated automatically each run).

       Expected output: the base fee and both rent-exemption figures
       should come back identical or nearly identical to the first run —
       unlike Easy and Medium's slot/leader data, these numbers reflect
       protocol-level constants and formulas, not fast-changing live
       scheduling state, so seeing them barely move between runs is the
       correct, expected result, not a sign anything is broken.

   4. Command: Temporarily change `lamports: 1000` to `lamports: "1000"`
       (a string instead of a number), then run npx tsc --noEmit.

       Expected output: a type error, reporting that a string isn't
       assignable to the lamports field's expected number type —
       SystemProgram.transfer's parameter object is fully typed by
       @solana/web3.js itself, so this mistake is caught before the
       script ever touches the network.
       
       Revert this change afterward.
   ```
