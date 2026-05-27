# List of things learned.

## 1. What is a blockchain, really?

### Plain-English version first.

Take a single page of a notebook. Write a fact on it, like _"Alice paid Bob 5 coins."_

Now run that page through a machine that turns its exact contents into a short fingerprint, a fixed-length string of letters and numbers. Change even one character on the page and the fingerprint comes out completely different.

Now take a second page. Before writing anything new on it, first copy the first page's fingerprint onto the top of this second page. Then write your new fact below it and run this whole page through the same fingerprint machine to get a new fingerprint.

- Keep doing this: Every new page starts with the fingerprint of the page before it.

That's a blockchain.

Each "page" is a **block**. The fingerprint is a **hash**. And because each block carries the previous block's hash inside it, the pages are physically chained together. You cannot swap out page 2 without every fingerprint from page 2 onward becoming visibly wrong.

```
Block #0            Block #1            Block #2
+-----------+       +-----------+       +-----------+
| data      |       | data      |       | data      |
| prevHash  |------>| prevHash -+------>| prevHash -+--> ...
| hash      |       | hash      |       | hash      |
+-----------+       +-----------+       +-----------+
```

### Why this matters for a beginner.

Last week's README talked about blockchains as _"a public, shared ledger."_

This week is about the actual mechanical trick that makes that ledger tamper-evident, hashing plus chaining.

Nothing about consensus, mining or wallets is needed to understand this part. It's just a data structure with one clever property.

---

## 2. Hash functions: The one tool blockchains can't work without.

### Plain-English version first.

A hash function is a machine with three rules:

1. Feed it anything (a word, a sentence, an entire book) and it always gives back an output of the exact same fixed length.

2. Feed it the exact same input twice and you always get the exact same output. No randomness.

3. Change the input by even one character and the output changes completely and unpredictably.

There's no "close" output for a "close" input.

You cannot run the machine backwards. Given only the output, there is no practical way to figure out what input produced it.

This course will use **SHA-256**, one specific hash function, throughout. Its output is always 64 hexadecimal characters (256 bits), no matter how big or small the input is.

```
Input                          SHA-256 output (64 hex characters)
-----                          -----------------------------------
"hello"                        2cf24dba5fb0a30e26e83b2ac5b9e29e1b1...
"Hello"  (capital H!)          185f8db32271fe25f561a6fc938b2e264306...
"hello " (trailing space)      2231670c07fa02fce4d9a6ba7bf3aeba3d02...
```

Notice how three almost-identical inputs produce three completely unrelated-looking outputs.

That unpredictability, called the **avalanche effect**. Is exactly what makes tampering visible later.

### Why this matters for a beginner.

Full cryptography (digital signatures, public/private key pairs) is next week's topic.

This week only needs hashing, because hashing alone is what gives a blockchain its tamper-evidence.

Signatures are about proving _who_ authorized a transaction. A different problem, solved a different way, layered on top of what you're building this week.

---

## 3. From block to chain: Why tampering becomes visible.

### Plain-English version first.

Say someone tampers with Block #2's data after the fact maybe changing _"Alice pays Bob 5 coins"_ to _"Alice pays Bob 500 coins."_

Two things are now true:

- Block #2's own stored hash no longer matches what you'd get by re-hashing its (now-different) contents. Anyone can catch this by just re-running the hash function.

- Even if the attacker also recalculates Block #2's hash to match the new data, Block #3 still contains a copy of Block #2's _old_ hash in its `previousHash` field. That link is now broken too.

- To truly hide the tampering, the attacker has to rewrite Block #2's hash, then Block #3's `previousHash` (and therefore its own hash), then Block #4's and so on to the end of the chain.

### Tampered link vs. intact link (side by side).

```
INTACT CHAIN                       TAMPERED CHAIN (data changed, hash not fixed)
Block #1  hash: 9f8a...            Block #1  hash: 9f8a...
Block #2  prevHash: 9f8a...  OK    Block #2  prevHash: 9f8a...  OK
          data: "5 coins"                    data: "500 coins"
          hash: 3c71...                      hash: 3c71...   <- now WRONG,
                                                                 doesn't match
                                                                 re-hashed content
Block #3  prevHash: 3c71...  OK    Block #3  prevHash: 3c71...  MISMATCH
```

### Why this matters for a beginner.

This is the entire reason blockchains are described as "immutable."

Nothing physically prevents someone from editing old data, the immutability is a _detectability_ guarantee, not a _prevention_ guarantee.

Anyone re-verifying the chain from scratch will notice. Week 20 and Week 31 build on this idea when discussing what happens when programs interact with data in ways that violate these guarantees.

---

## 4. Distributed ledgers: Nodes, Replication & Forks.

### Plain-English version first.

A blockchain isn't interesting if only one computer holds a copy. That's just a fancy tamper-evident log file and whoever controls that one computer still controls the "truth."

The actual innovation is **replication**:

- many independent computers (**nodes**) each hold their own full copy of the chain &
- they constantly send each other new blocks so their copies stay in sync.

```
   Node A  <---->  Node B
     ^                ^
     |                |
     v                v
   Node C  <---->  Node D
```

Because nodes operate independently and messages take time to travel across a network, two nodes can briefly end up with two different, both-locally-valid versions of "what comes next."

This is called a **fork**. It isn't a bug. It's an expected, temporary disagreement that the network needs a rule to resolve.

### Why this matters for a beginner.

Every "the network agreed" or "the transaction was confirmed" phrase you'll hear from Week 10 onward is really shorthand for "enough independent nodes converged on the same chain."

Nothing about that convergence is magic, it follows directly from a rule that every node applies identically, which is exactly this week's next (and final) concept.

---

## 5. Basic consensus: How independent nodes agree on "the real chain."

### Plain-English version first.

If two nodes disagree on which chain is correct, there needs to be an objective, mechanical rule that both nodes apply. With no need to trust each other's judgment.

This week's simplified version of that rule: **When a node receives a chain longer than its own and that chain is fully valid, it discards its own chain and adopts the longer one.**

```
Node A's chain (length 3)         Node A receives a chain of length 5 from Node B
[G]-[1]-[2]                       [G]-[1]-[2]-[3]-[4]     (fully valid)

Node A checks: is the incoming chain valid?         -> yes
Node A checks: is it longer than my current chain?  -> yes (5 > 3)
Node A adopts it, replacing its own chain entirely.
```

Real chains (Bitcoin, Ethereum, Solana) use a more refined version of this.

Comparing accumulated _work_ or _stake_ rather than raw block count, which Weeks 10 and 26 cover for each chain specifically.

The _longest valid chain wins_ version you'll build this week is a genuine simplification, but it is the same underlying idea: an objective, mechanically-checkable rule beats a subjective argument about whose copy is _right._

### Why this matters for a beginner.

This is the last piece needed to explain why attacking a real blockchain is expensive.

An attacker doesn't just need to fabricate one tampered block, they need to produce an entire _valid, longer_ chain than the honest network's, which (as Week 20's mining/security discussion will cover in more depth) gets combinatorially harder the more independent, honest nodes are running.

---

## Assignment.

1. **Easy — Hash-Linked Chain.**

   **What you practice:**
   - Writing typed data structures in TypeScript (`interface`, `Omit<...>`)
   - Using `node:crypto`'s `createHash` to produce SHA-256 hashes
   - Re-deriving and comparing hashes to detect tampering
   - Reasoning about which parts of a block should and shouldn't change between runs

   **Requirements:**
   - Running the program builds a 5-block chain and prints every field of every block.
   - The program reports the chain as valid immediately after building it.
   - The program then tampers with one block's `data` field without touching its stored `hash`, and reports the tampered chain as invalid.
   - Running the program twice produces identical `data`, `previousHash`, and `hash` values both times, but different `timestamp` values.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: `npx tsx chain.ts`

      Expected output: 5 blocks printed (`#0` through `#4`), each showing `timestamp`, `data`, `previousHash`, and `hash`. Followed by `Chain valid? true`.

   2. Command: same run, reading further down the output.

      Expected output: after the tampering message, `Tampered chain valid? false` — Block #2's stored hash no longer matches a hash recomputed from its changed data.

   3. Command: `npx tsx chain.ts` run twice in a row.

      Expected output: the `data`, `previousHash`, and `hash` values are identical across both runs, but every `timestamp` differs slightly between the two runs — confirming which fields are supposed to vary and which aren't.
   ```

2. **Medium - Proof-of-Work Miner.**

   **What you practice:**
   - Extending an existing TypeScript module (`Block`, hashing logic) without breaking its existing behaviour
   - Implementing a brute-force search loop (nonce-finding) and measuring its cost
   - Parsing command-line flags by hand (`--difficulty=`, `--length=`)
   - Distinguishing two separate layers of tamper-evidence: hash-matching vs. difficulty-matching

   **Requirements:**
   - Running the miner builds a chain where every block's hash starts with a configurable number of leading zeroes (the "difficulty").
   - The program reports, per block, its nonce, hash, number of attempts taken, and time spent mining.
   - The program demonstrates that changing a block's data without re-mining fails validation for two independent reasons in two separate demonstrations: a hash mismatch, and (once the hash is naively recomputed) a difficulty mismatch.
   - Increasing `--difficulty` visibly and substantially increases the attempts/time needed per block.
   - Setting `--difficulty=0` reduces mining to a single attempt per block.

   _(This extends the same `mini-chain/` project from the Easy assignment. `package.json` and `tsconfig.json` are unchanged. `chain.ts` below is a full replacement of Easy's version — it adds a `nonce` field and mining logic. `miner.ts` is new.)_

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: `npx tsx miner.ts --difficulty=3 --length=5`

      Expected output: 5 blocks reported, each with a `hash` starting with `000`, plus `attempts` and `mined in` figures; ends with `Chain valid? true`.

   2. Command: same run, reading further down the output.

      Expected output: `Valid? false  (fails: stored hash no longer matches recomputed hash)` for the first tamper demonstration.

   3. Command: same run, reading further down the output.

      Expected output: `Valid? false  (fails: recomputed hash won't satisfy the difficulty target with the old nonce)` for the second tamper demonstration — a different failure reason than test case 2, confirming two independent checks are both firing correctly.

   4. Command: `npx tsx miner.ts --difficulty=5 --length=3`

      Expected output: noticeably higher `attempts` and `mined in` values per block than the `--difficulty=3` run above — confirming difficulty directly controls mining cost.

   5. Command: `npx tsx miner.ts --difficulty=0 --length=3`

      Expected output: `attempts: 1` for every block — with zero required leading zeroes, the very first nonce tried always satisfies the (non-existent) difficulty target.

   ```

3. **Hard - Multi-Node Network & Consensus.**

   **What you practice:**
   - Running several independent HTTP servers that each hold their own copy of application state
   - Broadcasting data between peers using the built-in `fetch` API
   - Implementing an objective, mechanically-checkable consensus rule ("longest valid chain wins")
   - Writing a small standalone script that attacks your own system, to prove a defense actually works

   **Requirements:**
   - Each node exposes `GET /chain`, `POST /mine`, and `POST /receive-chain`.
   - Mining a block on one node and letting it broadcast results in every configured peer's chain updating to match — visible by querying `GET /chain` on each node.
   - Submitting a chain that fails hash/difficulty/link validation to any node's `POST /receive-chain` is rejected, and that node's own chain is left unchanged.
   - Submitting a fully valid chain that is not longer than a node's current chain is also rejected, with a distinct reason given from an invalid chain.
   - A separate `attacker.ts` script fetches a node's real chain, tampers with it without re-mining, and submits it back — demonstrating the rejection end-to-end.

   _(This extends the same `mini-chain/` project again. `chain.ts` and `miner.ts` are unchanged from Medium. `node-server.ts` and `attacker.ts` are new.)_

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Action: start all three nodes as in Step 3, then run `curl http://localhost:5001/chain`, `curl http://localhost:5002/chain`, and `curl http://localhost:5003/chain`.

      Expected output: each responds with `{"length":1, ...}`, but the genesis block's `hash` differs between all three nodes — each mined its own genesis independently, at a different timestamp, confirming the nodes start out truly independent.

   2. Action: mine a block on node 1 — `curl -X POST http://localhost:5001/mine -H "Content-Type: application/json" -d "{\"data\":\"Alice pays Bob 5 coins\"}"`.

      Expected output: a JSON response containing `minedBlock` (with `index: 1`), an `attempts` count, and `chainLength: 2`.

   3. Action: immediately after step 2, run `curl http://localhost:5002/chain` and `curl http://localhost:5003/chain`.

      Expected output: both now report `{"length":2, ...}`, and the full `chain` array — including the genesis block's hash — is byte-for-byte identical to node 1's `/chain` response. Node 1 broadcast its longer chain and both peers replaced their own with it, genesis included.

   4. Action: run `npx tsx attacker.ts http://localhost:5002`.

      Expected output: console output ending with a response like `{ accepted: false, reason: 'incoming chain failed validation' }`. A follow-up `curl http://localhost:5002/chain` still reports `length: 2` with unmodified data — the attack was rejected.

   5. Action: copy the 2-block chain from step 2/3's output, then submit it back to node 1 via `curl -X POST http://localhost:5001/receive-chain -H "Content-Type: application/json" -d "{\"chain\": <paste the 2-block chain array here>}"` after node 1 has already mined a third block (`curl -X POST http://localhost:5001/mine ...` once more first).

      Expected output: `{"accepted":false,"reason":"incoming chain (2 blocks) is not longer than local chain (3 blocks)"}` — confirming a valid-but-shorter chain is rejected for a different, clearly stated reason than an invalid one.
   ```
