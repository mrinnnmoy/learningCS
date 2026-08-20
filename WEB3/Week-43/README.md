# List of things learned.

## 1. The scalability trilemma. (Why L2s exist)

A common, useful simplification.

A blockchain can prioritize at most two of **decentralization**, **security** and **scalability** at once, without real, hard trade-offs against the third.

Ethereum L1 (this entire course, since Week 26) deliberately prioritizes decentralization and security.

A large, permissionless validator set, real economic finality at a real, direct cost to raw throughput, the exact mechanical root of Week 26, Concept 3's own block gas limit and Week 31, Concept 7's own DoS-via-gas-exhaustion lesson, now reframed as a _scale_ problem rather than only a security one.

A **Layer 2 (L2)** doesn't abandon that trade-off, it works around it.

Move the actual computation off of L1 entirely and post only a small, compressed summary back to L1.

Inheriting L1's own real security and decentralization for the parts that matter most (data availability, final settlement), while executing the bulk of real activity somewhere dramatically cheaper.

---

## 2. Optimistic rollup mechanics. (Arbitrum, Optimism)

An **optimistic rollup** (real, live, currently-operating chains, Arbitrum and Optimism among the largest, with Base ; this week's own hands-on chain built directly on Optimism's own OP Stack and sharing its exact same bridge and rollup mechanics) executes transactions off-chain, batches many of them together, and posts a compressed batch plus a resulting state root back to L1.

**Assumed correct by default**, the "optimistic" half of the name, with no proof of correctness required at the moment of posting at all.

This is dramatically cheaper than proving every batch correct upfront, at a real, structural cost Concept 3 covers directly.

Something has to exist to catch the case where a posted batch is actually wrong.

---

## 3. Fraud proofs & Challenge periods.

The real mechanism behind Concept 2's own "assumed correct" claim.

After a batch is posted, a **challenge period**, a real, live 7 days on Optimism specifically (and on Base, built on the identical OP Stack and sharing this exact same window), gives anyone watching (Week 24 and Week 35's own indexing infrastructure, applied here to a genuinely new purpose) the opportunity to submit a **fraud proof**.

A mechanism to re-execute the specific disputed step directly on L1 and demonstrate the posted state root doesn't match what actually should have resulted.

If no valid challenge arrives before the window closes, the batch is treated as final.

This single mechanism is _why_ withdrawing funds from an optimistic rollup back to L1 takes real, meaningful time.

Concept 8 covers exactly this asymmetry hands-on.

---

## 4. ZK rollup mechanics. (zkSync, Starknet, Polygon zkEVM)

A **ZK rollup** (real, live chains — zkSync, Starknet, Polygon zkEVM among them) takes a structurally different approach.

Alongside the compressed batch, it generates a **validity proof**, a real cryptographic proof (a zk-SNARK or zk-STARK — Week 47's own later material, "Practical Zero-Knowledge Proofs," covers exactly this machinery in depth, this week only needs the _result_, not the internals) demonstrating the posted state transition is mathematically correct, _before_ it's ever accepted.

An L1 verifier contract checks this proof directly.

Genuinely expensive to _generate_ off-chain, but cheap and fast to _verify_ on-chain.

A real, deliberate asymmetry zero-knowledge proof systems are specifically designed around.

---

## 5. Validity proofs vs. Fraud proofs. (the single most important distinction this week)

|                                         | Optimistic rollups (Concepts 2, 3)                                       | ZK rollups (Concept 4)                                                |
| --------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| Default assumption                      | Correct, unless proven otherwise                                         | Nothing assumed — proven correct before acceptance                    |
| What proves correctness                 | A fraud proof, submitted reactively, only if someone actually challenges | A validity proof, submitted proactively, with every single batch      |
| Delay before L1 treats a batch as final | The full challenge period (real, currently ~7 days on Optimism)          | None — a verified proof is final the moment it's checked              |
| Computational cost                      | Cheap to post; expensive only if a real dispute happens                  | Expensive to generate a proof for every batch, regardless of disputes |

Neither is strictly better.

- Optimistic rollups are simpler to build and reach EVM-equivalence more easily (Concept 1's own tooling-compatibility point, Easy's own assignment feels this directly).

- ZK rollups offer faster real finality at real, ongoing proof-generation cost.

Hard's own `ROLLUP_DESIGN.md` argues this trade-off concretely rather than leaving it abstract.

---

## 6. Sequencers & Centralization trade-offs.

Nearly every currently-live L2, optimistic or ZK, relies on a single, centralized **sequencer**.

One operator, ordering and batching transactions before they're ever posted to L1 at all.

This is a real, disclosed (Week 39, Concept 8's own trust-disclosure lesson, applied here to infrastructure this course didn't build) centralization point worth stating plainly rather than glossing over.

A centralized sequencer _can_ reorder, delay, or censor transactions within its own batches.

It generally _cannot_ steal funds outright or post an invalid state root undetected, since Concepts 3 and 4's own correctness mechanisms still run against whatever it eventually posts, but transaction-ordering power alone is real, meaningful power (Week 31, Concept 4's own front-running/MEV concept, now concentrated in a single, known operator rather than distributed across an open, competitive mempool).

---

## 7. Data availability: calldata vs. blobs (EIP-4844).

Every rollup batch's own underlying transaction data has to be published somewhere genuinely available on L1.

Otherwise nobody could ever reconstruct L2 state or check a fraud proof (Concept 3) against real, verifiable inputs.

Historically, this meant posting batch data as ordinary L1 **calldata**, at Week 26, Concept 3's own real per-byte gas cost (16 gas per non-zero byte, 4 per zero byte).

A genuinely large, dominant fraction of a rollup's own total operating cost.

**EIP-4844** ("proto-danksharding," live on Ethereum mainnet and Sepolia both, not a future proposal) introduced **blobs**.

A separate, dramatically cheaper data-storage lane specifically for exactly this purpose, with its own independent fee market and a deliberately short retention window (roughly 18 days) since blob data only needs to stay available long enough for anyone to verify it, not forever.

```solidity
// Calldata — Week 26, Concept 3's own real per-byte cost, historically how rollup batches were posted
function postBatch(bytes calldata data) external { ... }   // 16 gas/non-zero byte, 4 gas/zero byte

// Blobs — a genuinely separate, far cheaper data lane, read on-chain via a native Solidity global
bytes32 versionedHash = blobhash(0);   // Solidity 0.8.24+ — references the first blob attached to this tx
```

Hard's own assignment calculates the real, concrete cost difference for a realistic batch size, using Week 26's own calldata formula against EIP-4844's own documented blob-cost model, rather than only asserting blobs are "cheaper."

---

## 8. L1-to-L2 messaging & withdrawals.

This is Week 36 and 37's own entire bridge arc, arriving at its most concrete, most currently-relevant real-world instance.

Every major rollup ships an official, first-party bridge and Medium's own assignment uses Base's real, live one directly.

Base's own bridge, since Base is built on Optimism's OP Stack, exposes the identical `L1StandardBridge` interface Optimism itself does, just at Base's own separate, real contract address not a from-scratch build.

```solidity
// The REAL L1StandardBridge interface (OP Stack — shared by Optimism and Base alike), called directly on Sepolia (L1)
function depositETH(uint32 _minGasLimit, bytes calldata _extraData) external payable;
```

The real, asymmetric timing here is the single most important practical fact:

- A **deposit** (L1 → L2) typically completes in roughly 1-3 minutes.

Genuinely fast, since accepting new activity on the L2 side doesn't need to wait for anything (Concept 3's challenge period exists to protect _withdrawals_, not deposits).

- A **withdrawal** (L2 → L1) is the direction Concept 3's own challenge period genuinely gates.

Initiate on L2 (instant), _prove_ on L1 once the relevant L2 state root has actually been posted there (roughly 1-2 hours later).

Then _finalize_ on L1 only after the full, real challenge period has elapsed (7 days, on both Optimism and Base alike).

A real, live, currently-true asymmetry, not a simplification for this course's own sake.

---

## 9. Shared sequencing & Based rollups, in overview.

Two real, active answers to Concept 6's own centralization concern, kept at overview level since both are genuinely large, evolving research and infrastructure areas beyond what a single week can build hands-on.

- **Shared sequencing**: A neutral, often more decentralized sequencing layer serving _multiple_ separate rollups at once, rather than each rollup running its own single, centralized sequencer independently.

  Genuinely useful for enabling fast, atomic cross-rollup transactions as a side benefit, not just decentralization.

- A **based rollup**: A rollup that deliberately has no separate sequencer of its own at all, instead using L1's _own_ existing validators/block proposers to sequence its transactions directly.

  Inheriting L1's own real decentralization and censorship-resistance properties immediately, at the cost of L1's own block time and any L2-specific sequencing optimizations a dedicated sequencer might otherwise provide.

---

## 10. App-chains & Rollup-as-a-service, in overview.

A real, live category of product.

**Rollup-as-a-service (RaaS)** providers let a team spin up its own dedicated, customized rollup (an **app-chain**, a chain built for one specific application rather than general-purpose use) without building rollup infrastructure like

- the sequencer,
- the prover or fraud-proof system,
- the L1 settlement contracts

entirely from scratch.

This is a direct, practical continuation of Week 1's own very first concept, "the blockchain landscape," now answerable with real, concrete specificity this course has spent 42 weeks building toward.

A real project today can choose an existing L1, an existing general-purpose L2, or its own dedicated app-chain launched via a real RaaS provider, each a genuinely different point on the exact trilemma Concept 1 opened this week with.

---

## 11. The full deposit-execute-withdraw lifecycle, with real timing.

```
L1 (Sepolia)                                L2 (Base Sepolia)
─────────────                                ─────────────
depositETH() ──────────────────────────►
  (Concept 8)                              ETH appears at the SAME
                                            address, ~1-3 minutes later
                                                      │
                                            ordinary L2 activity —
                                            cheap, fast, sequenced by
                                            a single operator (Concept 6),
                                            batched and posted back to L1
                                            as blob data (Concept 7)
                                                      │
                                            initiateWithdrawal() ── INSTANT
                                                      │
                              (~1-2 hours — the relevant L2 state root
                               is posted and available on L1)
                                                      │
proveWithdrawalTransaction() ◄───────────────────────┘

        (Optimism/OP Stack's own real, live 7-DAY CHALLENGE PERIOD — Concept 3, shared by Base)

finalizeWithdrawalTransaction() ──► real ETH, back on L1
```

- The deposit side is fast because nothing about _accepting new L2 activity_ needs Concept 3's own dispute window.

- The withdrawal side is slow because _finalizing L2 state as settled on L1_ is exactly what that window protects.

Medium's own assignment runs the fast, deposit half of this diagram for real.

The full 7-day withdrawal half is described here precisely rather than performed, for the same practical reason this course has never asked for a literal week-long wait mid-assignment before.

---

## Assignment.

**A real, honest caveat worth stating up front.**

Base's own exact `L1StandardBridge` contract address on Sepolia is the kind of specific, real-world detail that can drift.

- Confirm the current, official address directly from Base's own docs (`https://docs.base.org/base-chain/network-information/base-contracts`) before Medium's assignment.

```
For Base Sepolia, the L1StandardBridge address is : 0xfd0Bf71F60660E2f608ed56e1659C450eB113120
```

Rather than trusting a hardcoded value here, the same caution this course applied to Pyth's own Sepolia address in Week 41.

**Base Sepolia is this week's own chain of choice specifically for its real, currently-reliable faucet access.**

The Base Sepolia Faucet itself, Bware Labs and Coinbase's own Developer Platform faucet (up to 0.1 ETH/24h) all provide free testnet ETH with no mainnet balance or heavy verification requirement, a real, practical advantage over some other L2 testnets' own faucets.

Base is built directly on Optimism's own OP Stack, so everything this week describes about Optimism's own architecture (Concepts 2, 3, 8) applies to Base identically, including its own real bridge interface and its own real 7-day challenge period.

Everything else this week:

- the real chain ID (`84532`),
- the real public RPC (`https://sepolia.base.org`),
- the real `depositETH` interface shape and
- the real challenge-period timing

is confirmed directly from Base's own current documentation.

1. **Easy - Deploying the Same Contract to a Real L2, With the Same Tooling.**

   **What you practice:**
   - Confirming, directly, that an L2 is genuinely just another EVM-compatible chain from a developer's own point of view (Concept 1) — the exact same `forge script`/`cast` workflow this course has used since Week 27, pointed at a different RPC and chain ID
   - Measuring the real gas _price_ difference between L1 Sepolia and Base Sepolia for the identical operation

   **Requirements:**
   - Deploy Week 27's own `Counter` contract, completely unchanged, to Base Sepolia.
   - A test confirming the deployed contract behaves identically to every previous week's own Sepolia deployment — `increment`, `incrementBy` (owner-gated), `decrement`, all working exactly as before.
   - A real, measured comparison: the actual gas _price_ (in gwei, not gas units — the operations themselves cost the identical number of gas units on any EVM-equivalent chain) paid for an `increment()` call on Base Sepolia vs. the equivalent call on Sepolia L1.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge script script/Deploy.s.sol --rpc-url base_sepolia --account deployerKey --broadcast

       Expected output: `Counter deployed on chain ID: 84532` — Concept
       1's own claim, confirmed directly rather than assumed: this really
       is a genuinely different chain, reached with the exact same
       deployment tooling as every previous week's own Sepolia (L1) work.

   2. Command:
         cast send <COUNTER_ADDRESS> "increment()" --rpc-url base_sepolia --account deployerKey
         cast call <COUNTER_ADDRESS> "getCount()(uint256)" --rpc-url base_sepolia

       Expected output: `1` — confirming the identical contract, the
       identical ABI, the identical `cast` commands all work against OP
       Sepolia exactly as they would against L1 Sepolia, no code changes
       of any kind.

   3. Command, comparing real gas PRICE (not gas units):
         cast gas-price --rpc-url base_sepolia
         cast gas-price --rpc-url sepolia

       Expected output: Base Sepolia's own gas price is typically
       dramatically lower than Sepolia L1's — confirming Concept 1's own
       real, practical payoff directly: identical opcodes, identical gas
       UNITS consumed, but a real, live L2 charging meaningfully less per
       unit for the exact same computation.

   4. Command:
         cast receipt <INCREMENT_TX_HASH> --rpc-url base_sepolia

       Expected output: a real transaction receipt, with a real block
       number and real gas used — confirming this transaction genuinely
       landed on a real, live, independently-operating chain, inspectable
       the same way any Sepolia L1 transaction has been throughout this
       course, not a simulated or mocked environment.
   ```

2. **Medium - A Real L1-to-L2 Deposit via Base's Official Standard Bridge.**

   **What you practice:**
   - Concept 8's own real mechanism, run for real: a genuine, official, already-deployed bridge, not a from-scratch build (Weeks 36, 37) or a general-purpose one (Week 42's own multisig-secured version)
   - The real, live ~1-3 minute deposit timing, observed directly rather than only read about

   **Requirements:**
   - Confirm the current, official `L1StandardBridge` address for Base Sepolia directly from Base's own docs (this Assignment's own intro flags exactly why, rather than trusting a hardcoded value).
   - Call `depositETH(uint32 _minGasLimit, bytes calldata _extraData)` directly on Sepolia (L1), sending a small, real amount of Sepolia ETH.
   - Confirm, on Base Sepolia (L2), that the identical address's own balance increased by the deposited amount, within the real, expected ~1-3 minute window.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command, immediately after the depositETH transaction confirms on
      L1:
         cast balance $(cast wallet address --account deployerKey) --rpc-url base_sepolia

       Expected output: UNCHANGED from before the deposit — confirming the
       deposit genuinely hasn't landed on L2 yet, this isn't instantaneous
       even though it's the "fast" direction (Concept 11's own diagram).

   2. Action: wait 1-3 real minutes, then repeat the exact same command.

       Expected output: the Base Sepolia balance has increased by real,
       approximately 0.01 ETH (minus whatever small L2 execution cost the
       deposit's own completion consumed) — confirming Concept 8's own
       real timing claim directly, not as a described abstraction.

   3. Command, independently confirming on the L1 side:
         cast receipt <DEPOSIT_TX_HASH> --rpc-url sepolia

       Expected output: a real, confirmed L1 transaction receipt — the
       `depositETH` call itself is an ordinary L1 transaction, confirmed
       immediately by L1 Sepolia's own consensus, entirely separate from
       how long it takes for the L2 side to reflect the result.

   4. Action: compare this real, ~1-3 minute deposit experience directly
       against Concept 11's own diagram and Concept 3's own 7-day
       challenge period, and write, in your own words, one sentence
       explaining precisely WHY a withdrawal in the opposite direction
       can't complete this quickly using the identical bridge contracts —
       this isn't a Foundry-checkable test, the point is confirming the
       real asymmetry is understood precisely, not just observed.
   ```

3. **Hard - Data Availability Economics: Calldata vs. Blobs, Calculated From Real Numbers.**

   **What you practice:**
   - Measuring the real, current L1 calldata cost of posting a realistic rollup-batch-sized payload, directly (Week 26, Concept 3's own gas formula, applied at real scale)
   - Calculating the same data's theoretical cost under EIP-4844's own real, documented blob-fee model, and comparing the two directly
   - Producing a real `ROLLUP_DESIGN.md`, arguing optimistic vs. ZK for a specific, real hypothetical application (Concept 5, 9, 10)

   **Requirements:**
   - A `BatchPoster` contract: `postBatch(bytes calldata data) external`, doing nothing meaningful with the data itself (a real rollup's own batch-posting contract does much more; this assignment isolates the cost of the calldata itself, exactly the variable being measured, Week 40's own "isolate the one variable actually being demonstrated" discipline).
   - A test posting a realistic batch size (`50_000` bytes — a real, modest rollup batch) and measuring the real gas cost via `forge test --gas-report`.
   - A calculation (in the test's own comments, and restated in `ROLLUP_DESIGN.md`) of the SAME 50,000 bytes' theoretical cost if posted as blob data instead, using EIP-4844's own real, documented model: one blob holds up to ~128 KB, so 50,000 bytes fits in a single blob; a blob's own base fee is tracked by a separate fee market from ordinary gas, targeting 3 blobs per block (max 6) — cite the real, current blob base fee at calculation time (`cast rpc eth_blobBaseFee` reads it live) rather than assuming a fixed historical number.
   - A `ROLLUP_DESIGN.md` recommending optimistic or ZK for a hypothetical "real-time, high-frequency trading" application specifically, arguing from Concept 5's own table rather than restating it generically.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

       Expected output: `Real intrinsic calldata gas (top-level tx formula)`
       prints a real, large number, comfortably above `700_000` — confirming
       a real, substantial calldata cost for a realistic batch size, not a
       hypothetical one; the separate `Internal test-call gas` figure will
       be noticeably smaller, exactly the real, honest distinction the
       test's own comments explain — a nested Solidity call is genuinely
       cheaper than a top-level transaction's own calldata charge, and
       conflating the two would understate the real comparison this
       assignment is actually making.

   2. Command: cast rpc eth_blobBaseFee --rpc-url sepolia

       Expected output: a real, current, live number — confirming the
       blob fee market genuinely exists and is queryable today, on the
       exact same Sepolia network this course has used since Week 27, not
       a separate or future-only mechanism.

   3. Action: recompute the comparison in ROLLUP_DESIGN.md using a batch
       size of 200,000 bytes instead of 50,000 (still comfortably under a
       single blob's own ~128KB capacity), and note, in your own words,
       whether the calldata-vs-blob cost GAP grows, shrinks, or stays
       proportionally the same as batch size increases.

       Expected result: the calldata cost scales up roughly linearly with
       size (Week 26's own per-byte formula, unchanged); the blob cost
       stays FLAT as long as the data still fits in one blob at all,
       since a blob is priced as one unit regardless of how full it is —
       confirming a real, additional, concrete reason larger batches
       benefit disproportionately from blob-based data availability, not
       just a fixed percentage discount.

   4. Action: re-read Concept 6 and Concept 9, then fill in
       ROLLUP_DESIGN.md's own third section with a real, specific answer
       about sequencer centralization for THIS hypothetical app — not a
       generic restatement of what a sequencer is.
   ```
