# Rollup Design. (A Hypothetical Real-Time, High-Frequency Trading App)

## Optimistic vs. ZK. (for THIS specific application)

For a real-time, high-frequency trading application, I would choose a **ZK rollup** over an optimistic rollup.

The main reason is the application's need for fast and credible finality. A trading application can move significant value in a very short period, so users should not have to depend on a long optimistic challenge period before treating withdrawals or settlement as final. A ZK rollup uses validity proofs to demonstrate that the L2 state transition is correct, allowing the Ethereum settlement layer to verify the proof rather than relying on a fraud-proof challenge period.

This matters much more for high-frequency trading than it would for an NFT marketplace. An NFT buyer may tolerate a delayed withdrawal because transactions are relatively infrequent and usually not time-sensitive. A trading user may need to enter a position, exit it, and move the resulting funds much more quickly.

The main disadvantage of ZK rollups is proof generation. Producing validity proofs requires specialized proving infrastructure and can be computationally expensive. For this application, I would accept that additional infrastructure cost because fast finality is directly related to the application's core requirement: rapid movement and settlement of capital.

Therefore, my recommendation is:

**ZK rollup, higher proving complexity and infrastructure cost in exchange for stronger finality characteristics that better fit high-frequency financial activity.**

---

## Data availability cost, calculated

The test uses a **50,000-byte** batch.

From the actual test run:

```text
Real intrinsic calldata gas: 797648
```

This is the analytical top-level transaction calldata cost using Ethereum's calldata pricing formula. The separate internal Solidity call consumed:

```text
Internal test-call gas: 2045398
```

That internal-call number is not used for the calldata comparison because an internal Solidity call does not incur the same top-level transaction calldata charge.

At the time of testing, the live Sepolia blob base fee returned by:

```bash
cast rpc eth_blobBaseFee --rpc-url sepolia
```

was:

```text
0x342bbf2
```

which is:

```text
54,706,162 wei
```

A single EIP-4844 blob contains up to approximately **128 KiB (131,072 bytes)**, so the 50,000-byte batch fits inside one blob.

The blob gas cost for one blob is therefore:

```text
131,072 × 54,706,162
= 7,170,? wei
```

The important economic difference is that calldata and blob data use different pricing mechanisms. Calldata is charged according to the bytes included in the transaction, while EIP-4844 blob data is priced through a separate blob-fee market.

For a high-frequency trading application, this distinction becomes particularly important because the application may need to publish batches continuously.

A larger calldata batch increases the calldata cost approximately linearly with the number of bytes. A blob, however, is priced as one blob regardless of how full it is. Therefore, increasing a batch from 50,000 bytes toward the one-blob limit does not proportionally increase the blob gas cost as long as the data still fits inside that same blob.

The original assignment's proposed **200,000-byte** comparison should not be treated as a one-blob example because 200,000 bytes exceeds the approximately 128 KiB capacity of one blob. A better one-blob comparison is **120,000 bytes**, which remains below the 131,072-byte limit.

At 120,000 bytes, calldata costs continue increasing approximately linearly, while the data can still fit inside one blob. This means the calldata-versus-blob cost gap can become increasingly favorable to blobs as a batch approaches the capacity of a blob.

For this hypothetical trading application, I would therefore prefer efficiently packed batches that make good use of each blob rather than publishing many mostly-empty blobs.

---

## Sequencer centralization (Concept 6), disclosed.

Sequencer centralization is a **much more serious concern for this particular application than for an ordinary consumer application**.

A high-frequency trading application depends heavily on transaction ordering. Suppose two traders submit competing orders for the same asset at almost the same time. The sequencer receives those transactions before constructing the L2 block and therefore has significant influence over which transaction executes first.

For a trading application, ordering is not simply a user-experience concern. **Ordering can directly determine who makes or loses money.**

For example:

1. Trader A submits an order to buy an asset.
2. Trader B submits another transaction immediately afterward.
3. The sequencer receives both transactions.
4. The sequencer deliberately changes their order or delays A's transaction.
5. B receives an execution advantage that would not have existed under fair ordering.

This creates a direct MEV and fairness problem. A centralized sequencer therefore represents a particularly valuable point of control for this application.

The sequencer also creates a liveness risk. If the only sequencer goes offline, the application can temporarily stop producing L2 blocks even though Ethereum itself continues operating.

For this reason, I would **not** consider a permanently centralized sequencer acceptable as the final architecture for this trading application.

---

### Proposed sequencing design

I would initially use a single high-performance sequencer for the prototype because it provides the low-latency execution required by a high-frequency trading application. However, the protocol should be designed from the beginning with a path toward **shared or decentralized sequencing**.

The long-term design should include:

* **Fair ordering rules** so the sequencer cannot freely reorder profitable trades for its own benefit.
* **Forced inclusion mechanisms** so users have an escape route if the sequencer censors their transactions.
* **Multiple sequencing participants or shared sequencing** so one operator is not the permanent point of failure.
* **Transparent ordering and preconfirmation rules** so traders understand what guarantees they are receiving.
* **Ethereum-backed settlement and data availability** so the sequencer cannot silently rewrite historical application state.

ZK validity proofs do **not** automatically solve sequencer censorship or ordering problems. A validity proof demonstrates that the resulting state transition is valid, but it does not by itself guarantee that the sequencer selected a fair ordering of valid transactions.

Therefore, the trading application needs to treat sequencing as a separate security and fairness problem rather than assuming that choosing a ZK rollup automatically solves it.

---

### Final recommendation.

For this specific **real-time, high-frequency trading application**, my design would be:

**ZK rollup + blob-based data availability + low-latency sequencing initially, with decentralized/shared sequencing as a core long-term requirement.**

ZK is preferred because fast validity-based finality is more valuable to a trading application than it is to slower applications. Blob-based data availability is preferred because the application can generate large quantities of transaction data and can benefit from the separate blob fee market.

Finally, sequencing decentralization is especially important because transaction ordering itself has direct financial consequences in a trading environment.

The central design principle is:

> **Low latency cannot come at the cost of giving one operator unchecked control over transaction ordering.**

A centralized sequencer may be appropriate for an initial high-performance implementation, but a production financial rollup should progressively reduce that single point of control.
