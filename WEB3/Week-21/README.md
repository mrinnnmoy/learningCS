# List of things learned.

## 1. Why NFT compression exists.

Week 17 and Week 19's `TokenAccount`/`Mint` pattern, extended to NFTs, costs real, non-trivial rent per NFT, one full on-chain account (Week 11, Concept 8's rent-exemption minimum) for every single mint.

A collection of one million regular NFTs means one million separately rent-exempt accounts, a genuinely large SOL cost just to _exist_, independent of any trading activity.

Compression's entire premise, most of that per-NFT account data doesn't need to live in an _account_ at all, it needs to be **provably attributable to this collection** and there's a structure that gives you that proof far more cheaply than a full account does.

---

## 2. State compression concept.

The core trick, instead of storing full data on-chain, store only a small, fixed-size **cryptographic commitment** to that data on-chain (Week 3, Concept 6's Merkle trees and Merkle proofs, put to direct use) and keep the actual data off-chain, in the transaction history itself.

Anyone can _reconstruct_ the full data by replaying the relevant transaction logs and anyone can _prove_ a specific piece of data was included by presenting a Merkle proof against the on-chain commitment.

The commitment is tiny and cheap to store; the data itself never needs a dedicated account.

---

## 3. Merkle trees for cNFTs.

Week 3, Concept 6 defined the shape.

Every leaf is a hash of some data, every internal node is a hash of its two children and the single root at the top is a compact fingerprint of every leaf beneath it.

For compressed NFTs, each **leaf** is a hash of one NFT's metadata (owner, name, URI, and so on); the on-chain account stores only the **root**.

Changing any single NFT changes its leaf's hash, which cascades up and changes the root, so the root alone is enough to detect _any_ tampering with _any_ leaf, without storing any of the leaves themselves on-chain.

---

## 4. Concurrent Merkle trees.

A plain Merkle tree has a real practical problem for a blockchain specifically:

- two transactions modifying different leaves in the same block would each compute a _different_ new root from their own transaction's view and
- only one can actually land, the other's update would be silently lost or rejected.

A **concurrent Merkle tree** solves this by keeping a small **changelog buffer** of recent root updates on-chain, alongside the root itself.

A transaction can still validate against a _slightly stale_ root, as long as it's recent enough to still be tracked in that buffer, letting many updates to _different_ leaves succeed within the same slot without colliding.

```
   Regular Merkle tree                      Concurrent Merkle tree
   (one valid root at a time)           (root + a short history buffer)

        root                                root  <- [root, root-1, root-2, ...]
       /    \                                 \            (changelog buffer,
    node    node                            proof         depth × buffer size)
    /  \    /  \                            still valid
  leaf leaf leaf leaf                   against any of these

  Two txns updating different leaves    Two txns updating different leaves
  in the same block: only one root      in the same block: BOTH succeed,
  can be correct, one txn fails.        the buffer absorbs the concurrency.
```

---

## 5. Bubblegum program overview.

**Bubblegum** is Metaplex's own program, deployed once on both devnet and mainnet, that sits on top of the SPL **Account Compression** program (which manages the raw concurrent Merkle tree accounts) and the **Noop** program (whose entire purpose is to emit the actual NFT metadata into the transaction log cheaply, without storing it in any account, exactly Concept 2's "data lives in the log, not the account" idea, made concrete).

This week, unlike every Anchor week since Week 14, involves writing **no custom on-chain program at all**, Bubblegum, Account Compression and the Token Metadata program are all _already deployed_.

This week's work is entirely TypeScript, calling into programs that already exist.

---

## 6. Minting compressed NFTs.

Minting a cNFT via Bubblegum's `mintV1` instruction does three things in one transaction.

It hashes the new NFT's metadata into a leaf, appends that leaf to the tree (updating the on-chain root, Concept 4) and emits the full metadata via the Noop program's log (Concept 5), all for a fraction of a regular NFT mint's cost, since no new account is created at all.

The tree itself (Concept 4) has to be created once, upfront, sized by a `maxDepth`/`maxBufferSize` pair that caps how many leaves it can ever hold and how many concurrent updates its changelog buffer can absorb, a tree can be minted into many times, cheaply, after that one setup cost.

---

## 7. Transferring compressed NFTs.

A regular SPL NFT transfer (Week 17, Concept 5) is a single, self-contained `Transfer` CPI, the whole state lives in the token account being moved.

A compressed NFT transfer instead has to prove the leaf being transferred is _actually currently in the tree_, by supplying a full Merkle proof (Concept 3) from that leaf up to a root the tree's changelog buffer (Concept 4) still recognizes as valid, then the instruction computes the _new_ leaf (same data, new owner) and updates the root accordingly.

This proof has to be fetched from an indexer (Concept 8) beforehand, the transaction itself has no way to look up _"what does this leaf's current proof path look like"_ on its own.

---

## 8. Indexing compressed NFTs (DAS API).

Since a cNFT's actual metadata was never stored in any account (Concept 2, 6), a program can't answer "what NFTs does this wallet own" or "what's this cNFT's current metadata" by simply reading accounts, Week 16, Week 19's `program.account.fetch()` pattern has nothing to fetch.

This is what the **DAS API** (Digital Asset Standard) exists to solve, specialized RPC providers continuously replay Bubblegum's transaction logs (Concept 6's Noop emissions) and maintain their own off-chain index, exposing methods like `getAsset` and `getAssetProof` that reconstruct a cNFT's current state and Merkle proof on demand.

Critically, **not every RPC endpoint supports this**, the default public devnet RPC doesn't implement DAS methods at all.

A DAS-capable provider (Helius, for this week) is a genuine, separate requirement.

---

## 9. Cost comparison vs Regular NFTs.

Putting Concepts 1 through 8 together into real numbers.

A regular NFT mint (Week 17's `Mint` + `TokenAccount` + Week 29-equivalent metadata account) costs roughly 0.012 SOL in rent alone, per NFT.

A concurrent Merkle tree sized for a million leaves (`maxDepth = 20`) costs a low, one-time setup fee measured in a few SOL _total_, and minting into it afterward costs only the transaction fee, no new rent at all.

The trade-off this week's Hard assignment makes concrete, that cost savings is paid for entirely by Concept 7 and Concept 8's added complexity, a cNFT transfer needs a proof an indexer must supply, where a regular NFT transfer never did.

---

## 10. Canopy depth.

Concept 7 left a real cost hidden.

A transfer's Merkle proof (Concept 3) has to reach all the way from the leaf up to the root and at `maxDepth = 14` (Easy's tree), that's 14 proof nodes the client has to fetch from an indexer (Concept 8) and pass into every single transaction.

A tree's `canopyDepth` parameter caches some number of the tree's _upper_ levels directly inside the on-chain tree account itself, a transaction then only needs to supply the proof nodes _below_ the cached canopy, the program fills in the rest from what it already has stored.

The trade-off is exactly Concept 9's shape again, in miniature: a larger canopy means a larger, more expensive tree account (Concept 4's account size, Concept 9's rent cost), in exchange for smaller, cheaper, more reliable transactions afterward.

Easy's assignment deliberately left `canopyDepth` at its default of `0`, the simplest case to reason about the base tree-sizing math with, worth revisiting once the core mechanics are solid.

---

## 11. Tree authority, delegates & public vs. private trees.

Every concurrent Merkle tree (Concept 4) has an **authority**, by default whoever created it (Easy's `createTree` call, using your own wallet).

Bubblegum (Concept 5) lets that authority configure whether the tree is **public** (anyone can call `mintV1` into it, no restriction at all) or effectively private (only the authority, or an explicitly assigned **delegate**, may mint).

This is Week 20's Concept 2/3 discipline, missing signer and owner checks, showing up again here, except this time it's _Bubblegum's own_ access control you're relying on being correct, not code you wrote and audited yourself.

Worth explicitly checking which mode a tree is in before trusting it the way Easy's assignment trusted its own freshly-created, authority-only tree by default.

---

## 12. Verified collections on cNFTs.

A cNFT minted with `collection: null` (exactly what Medium's assignment did) carries no provable grouping at all, nothing stops anyone from _claiming_ their cNFT belongs to some collection in its metadata's `name`/`uri` fields alone.

Bubblegum's `mintToCollectionV1` instruction ties a cNFT to a real, single, regular (uncompressed) Collection NFT instead, the same Metaplex Token Metadata construct a normal NFT collection already uses, cryptographically **verified** at mint time.

Only one account is needed for the whole collection, not one per cNFT, so this doesn't reintroduce Concept 1's original cost problem, it adds trustworthy grouping on top of Concept 6's cheap minting, rather than trading it away.

---

## 13. Burning compressed NFTs.

The mirror operation to Concept 6's mint.

Bubblegum's `burn` instruction requires the same kind of current Merkle proof Concept 7's transfer does, proving the leaf being destroyed is genuinely the tree's current state for that leaf, then overwrites that leaf's slot so it's no longer a valid, ownable asset (Concept 8's DAS index will stop returning it as owned by anyone).

One nuance worth being explicit about, this doesn't erase the NFT's _history_, Week 2's transaction-lifecycle immutability still applies, the original mint and every subsequent transfer remain permanently in the ledger, "burning" only removes its current, live, ownable status going forward, not its past.

---

## 14. Bubblegum V2 (landscape awareness).

As of early 2026, Metaplex has introduced Bubblegum V2 alongside the V1 this week's assignments used throughout, its main addition is a `mintV2` instruction with native support for **MPL-Core** collections, Metaplex's newer, non-Token-Metadata NFT standard, rather than Concept 12's legacy Collection NFT approach.

This week deliberately built against V1:

- it's simpler,
- has no MPL-Core prerequisite and
- is by far the more widely documented version to learn the core mechanics against.

Per this week's own Assignment intro and Week 1, Concept 5's original habit, check [Developer-Docs](https://developers.metaplex.com/bubblegum-v2) directly before building anything real on top of this, this is one of the faster-moving corners of the whole curriculum.

---

## Assignment.

1. **Easy - Creating a Concurrent Merkle Tree, and Comparing Its Cost.**

   **What you practice:**
   - Computing a concurrent Merkle tree's exact on-chain size and rent cost from a `maxDepth`/`maxBufferSize` pair (Concept 4), before creating anything
   - Creating a real tree on devnet via Bubblegum's `createTree` (Concept 5, 6), persisting its address for Medium and Hard to reuse
   - Directly computing Concept 9's cost comparison: this tree's one-time setup cost against the rent cost of that same number of regular NFT accounts

   **Requirements:**
   - A script that computes the byte size and rent-exemption cost of a concurrent Merkle tree sized `maxDepth = 14`, `maxBufferSize = 64` (room for 16,384 leaves), using `getConcurrentMerkleTreeAccountSize` from `@solana/spl-account-compression`.
   - The same script then actually creates that tree on devnet via `createTree` from `@metaplex-foundation/mpl-bubblegum`, using your real local wallet as both payer and tree creator.
   - The tree's address is written to `tree-address.json` on first run; on subsequent runs, the script reads it back and prints "Tree already exists" rather than creating a second one, the same idempotency habit as Week 19's `mint-address.json`.
   - The script prints a direct comparison: this tree's one-time cost versus `16,384 × ~0.012 SOL` (an approximate regular-NFT rent cost per mint), stated in whole SOL.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Tree size (maxDepth=14, maxBufferSize=64): ... bytes
           One-time rent cost for this tree: 0.XXXX SOL

           Tree created: 6nBWg...

           Cost comparison for 16,384 NFTs:
           This tree, one-time:        ~0.XXXX SOL
           16,384 regular NFT mints:   ~196.61 SOL
           Approximate savings:        ~196.XX SOL

   2. Command: run npx tsx index.ts a second time.

       Expected output: "Tree already exists: 6nBWg..." (the same address
       as Run 1), followed by the same cost comparison — confirming
       tree-address.json's persistence is genuinely working, no second
       tree gets created and no SOL gets spent twice.

   3. Command: verify by hand.

       The "one-time" tree cost should be a small, low single-digit or
       sub-1 SOL number, while the 16,384-regular-NFT comparison should
       be in the hundreds of SOL — confirming Concept 9's cost claim
       directly, in real numbers from a real devnet transaction, not
       just as prose.

   4. Command: temporarily change MAX_DEPTH from 14 to 3 (room for only
       8 leaves), delete tree-address.json, and re-run.

       Expected output: a MUCH smaller tree size and rent cost printed,
       and a leaf capacity of 8 instead of 16,384 in the final
       comparison — confirming the tree's cost genuinely scales with
       maxDepth, exactly Concept 4's sizing trade-off, not a fixed cost
       regardless of capacity. Revert this change afterward and delete
       tree-address.json once more so Medium starts from a real,
       full-sized tree.
   ```

2. **Medium - Minting Several Compressed NFTs Into the Tree.**

   **What you practice:**
   - Minting multiple cNFTs cheaply into Easy's existing tree via Bubblegum's `mintV1` (Concept 6), each a single transaction, with no new account created.
   - Retrieving the resulting compressed NFT's asset ID using the Helius DAS API (`getAssetsByOwner`) after each successful mint, since (Concept 2) a cNFT has no account of its own to fetch directly afterward.
   - Observing several mints' real transaction cost directly, reinforcing Concept 9's comparison with your own numbers rather than the approximate figure Easy used.

   **Requirements:**
   - Extends Easy's project: reads `tree-address.json`, reusing the same tree rather than creating a new one.
   - Mints 3 distinct compressed NFTs into that tree, each with distinct `name`/`uri` metadata, all owned by your own wallet.
   - For each mint, the script queries the Helius DAS API (`getAssetsByOwner`) to locate the newly minted compressed NFT and prints its asset ID, since a cNFT has no account of its own to look up afterward (Concept 2, 8).
   - The script sums and prints the total transaction fee cost of all 3 mints, for direct comparison against Easy's tree-creation cost.

   **Note:**
   - Due to an SDK compatibility issue, `parseLeafFromMintV1Transaction()` could not extract the leaf information because the transaction metadata did not contain `innerInstructions` in the current development environment.
   - Therefore, the asset ID is retrieved using the Helius DAS API instead.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx mint.ts

       Expected output shape:
           Minting into existing tree: 6nBWg...

           Minted "Week 21 cNFT #1"
           Signature: 3xR9k...
           Asset ID (leaf owner + nonce derived): 9pQr...
           Fee paid: 5000 lamports

           Minted "Week 21 cNFT #2"
           ...
           Minted "Week 21 cNFT #3"
           ...

           Total fee cost for 3 cNFT mints: ~15000 lamports
           Compare against Easy's regular-NFT rent estimate — this is
           transaction fees only, no new rent at all.

   2. Command: verify by hand.

       Total fee cost should be on the order of thousands of lamports
       (a few cents at most), not a meaningful fraction of a SOL —
       confirming Concept 6's claim that minting into an existing tree
       costs only the transaction fee, no rent, directly.

   3. Command: run npx tsx mint.ts a second time without modifying
       anything.

       Expected output: three MORE cNFTs minted successfully into the
       SAME tree (6 total now), each with a distinct asset ID from the
       first three — confirming the tree can be minted into repeatedly,
       unlike Easy's tree-creation step, minting doesn't need an
       existence check the way `init` did in every prior Anchor week.

   4. Command: temporarily change the tree address used by replacing
       `merkleTree = publicKey(tree)` with a randomly generated PublicKey
       that was never actually created as a tree, then re-run.

       Expected output: the transaction fails, since Bubblegum's mintV1
       requires an actual, already-initialized tree account — confirming
       Concept 5's ordering requirement directly: a tree must exist
       before anything can be minted into it, this isn't optional
       setup. Revert this change afterward.
   ```

3. **Hard - Transferring a Compressed NFT and Reading It Back via the DAS API.**

   **What you practice:**
   - Fetching a cNFT's current Merkle proof from a DAS-capable RPC (Concept 7, 8), rather than assuming any locally cached proof is still valid.
   - Transferring a cNFT to a second owner using that proof, confirming the transfer actually lands by reading the asset back via `getAsset` afterward, not merely trusting the transaction succeeded.
   - Directly observing DAS indexing latency: querying immediately after a transaction sometimes returns stale data, a genuine eventual-consistency behavior Week 16's direct `program.account.fetch()` never had to contend with.

   **Requirements:**
   - Extends Medium's project: uses one of the 6 cNFTs already minted into the shared tree (the first one, by asset ID, printed during Medium's run).
   - A second owner, a fresh `Keypair` generated locally. The recipient does not require SOL because your wallet signs and pays for the Bubblegum transfer transaction.
   - The script fetches the cNFT's current asset + proof via `dasApi`'s `getAssetWithProof`, transfers it to the new owner via Bubblegum's `transfer`, then polls `getAsset` afterward (retrying briefly if the indexer hasn't caught up yet) until the returned owner matches the new owner, printing the before/after owner explicitly.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx transfer.ts <ASSET_ID_FROM_MEDIUM>

       Expected output shape:
           New owner (freshly generated, funded): 4kLp...

           Current owner (from DAS): 9yL3H...
           Transfer signature: 3xR9k...
           Indexer hasn't caught up yet (attempt 1/10), waiting...
           Confirmed post-transfer owner (from DAS): 4kLp...
           Matches new owner: true

   2. Command: verify by hand.

       "Current owner (from DAS)" before the transfer should equal YOUR
       wallet's own address (loaded from ~/.config/solana/id.json,
       matching every prior week's wallet rule), and "Confirmed
       post-transfer owner" should equal the freshly generated address
       printed at the top — confirming the transfer genuinely moved
       ownership, verified independently through the DAS API rather than
       just trusting the transaction's own success.

   3. Command: verify by hand — count how many times "Indexer hasn't
       caught up yet" printed.

       If it printed 0 times, the DAS index updated faster than one
       polling interval; if it printed a few times, that delay IS
       Concept 8's eventual-consistency behavior, directly observed, not
       theoretical — a real gap between "the transaction is confirmed on
       -chain" and "the indexer's off-chain copy reflects it." If it
       never resolves within 10 attempts, try a different DAS provider or
       increase the sleep interval; this is a real infrastructure
       dependency this week introduces, not a bug in the script.

   4. Command: attempt to run transfer.ts a second time with the SAME
       asset ID and no other changes.

       Expected output: an error partway through — since umi.identity
       (your own wallet) is no longer the asset's leafOwner after Test
       Case 1 succeeded (it's now the freshly-generated newOwnerKeypair
       from that run, which this script never persisted anywhere), the
       transfer's `leafOwner: umi.identity.publicKey` no longer matches
       the asset's actual current owner. Confirming Concept 7's ownership
       check is real and enforced, not merely decorative — you'd need to
       mint a fresh cNFT via mint.ts, or use a different already-owned
       asset ID, to run this test again.
   ```
