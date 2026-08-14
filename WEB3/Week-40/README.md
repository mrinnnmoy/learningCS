# List of things learned.

## 1. Designing account/state structures for scalability.

Every previous week's own contracts made this choice implicitly.

This week makes it deliberately.

The core question, on either chain this course has covered.

Does a design route many independent users through _one shared piece of state_ or does it give each relationship its own, independent slice?

Solana's own account model (Week 11) answers this structurally.

Sealevel (Week 10) can only run transactions touching _different_ accounts in parallel, so a design funneling every user through one shared account creates real, measurable write-lock contention.

The same "one bottleneck everyone queues behind" cost Week 31, Concept 7's own unbounded-loop DoS pattern showed on the EVM side, arrived at from a completely different mechanical cause.

A `mapping(address => Data)` (Week 27, Concept 7) sidesteps this specific Solana-side concern, since every EVM transaction already processes sequentially regardless (Week 26, Concept 2).

But the _storage cost_ concern (Concept 4) and the _unbounded growth_ concern (Concept 6) still apply equally on both chains, just via different specific mechanisms.

---

## 2. Data normalization vs. Denormalization on-chain.

Borrowed vocabulary from ordinary database design, applied here with a genuinely inverted cost trade-off worth stating precisely:

- **normalized** data stores each fact exactly once, cross-referenced by relationship, avoiding duplication;

- **denormalized** data duplicates facts directly where they're needed, avoiding a cross-reference at read time.

Off-chain, normalization is usually preferred by default, storage is cheap, correctness (one source of truth) matters more.

On-chain, every additional storage read (an `SLOAD`, Week 26, Concept 2) costs real, metered gas on every single call that needs it, not just latency.

Which is exactly why on-chain design leans toward denormalization far more readily than off-chain design typically does, deliberately trading a small amount of extra storage cost at write time for avoiding a repeated cross-reference cost on every future read.

```solidity
// Normalized — TWO separate mappings, a real cross-reference read every time both are needed
function getUserSummary(address user) external view returns (string memory name, uint256 amount) {
    name = users[user].name;         // one SLOAD
    amount = balances[user].amount;  // a SECOND, separate SLOAD
}

// Denormalized — ONE mapping, the balance duplicated directly alongside the profile
function getUserSummary(address user) external view returns (string memory name, uint256 amount) {
    UserProfile storage p = profiles[user];
    return (p.name, p.balance);      // ONE read reaches everything needed
}
```

Easy's own assignment measures the real gas difference between these two shapes directly, not just asserts one is better.

---

## 3. Choosing PDAs vs. Storage contracts for relationships.

A direct, honest cross-chain comparison, since this course built real experience with both sides.

Solana's own PDA (Week 13).

A _separate, individually-addressed account_ deterministically derived per relationship (one user, one pool, say), each independently rent-exempt (Week 11, Concept 7), independently parallelizable (Concept 1's own point).

An EVM contract's own `mapping` (Week 27, Concept 7).

Every relationship lives as an entry inside _one shared contract's own storage_, a single, larger, sequentially-accessed structure.

|                                                   | Solana PDA (Week 13)                                     | EVM mapping (Week 27, Concept 7)                                                                          |
| ------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Physical storage unit                             | A real, separate account per relationship                | One entry inside one shared contract's own storage                                                        |
| Cost model                                        | Rent-exemption, paid once, per account (Week 11)         | Gas per write, amortized into each transaction (Week 26, Concept 3)                                       |
| Parallel execution                                | Yes — different PDAs can process concurrently (Sealevel) | No — the EVM processes one transaction at a time regardless (Week 26, Concept 2)                          |
| Adding a genuinely new kind of relationship later | A new PDA seed scheme, deployed independently            | A new mapping, or a new field, in the SAME already-deployed contract (Concept 5's own versioning concern) |

Neither is "correct" in the abstract. A system already built on Solana inherits PDA-shaped design by default.

A system already built on the EVM inherits mapping-shaped design by default worth understanding as two different structural answers to the identical underlying question, not a ranking.

---

## 4. Minimizing storage costs.

Solana's own rent-exemption model (Week 11, Concept 7) charges once, up front, sized to an account's own byte length.

Minimizing cost there means minimizing an account's own total size at creation.

The EVM's own equivalent lever is different in mechanism but identical in spirit.

Solidity packs multiple struct fields into a single 32-byte storage slot automatically, _if_ they're declared adjacently and their combined size fits and charges per-slot, not per-byte, for every write.

```solidity
// UNPACKED — four separate 32-byte slots, even though most of that space goes unused
struct Item {
    uint256 quantity;   // slot 0
    uint256 price;       // slot 1
    bool active;           // slot 2 — wastes 31 of its own 32 bytes
    uint256 createdAt;   // slot 3
}

// PACKED — the identical information, TWO slots instead of four
struct Item {
    uint128 quantity;   // slot 0, bytes 0-15
    uint128 price;        // slot 0, bytes 16-31 — SAME slot as quantity
    bool active;            // slot 1, byte 0
    uint88 createdAt;      // slot 1, bytes 1-11 — SAME slot as active
}
```

`uint88` for a timestamp is deliberately generous, not a typo. It comfortably covers timestamps for longer than this course, or this planet's own sun, will realistically exist, while still leaving room to pack alongside `bool` in the same slot.

Picking the _smallest type that's still obviously safe_, not the smallest type that technically fits today's expected values, is the real discipline here.

Easy's own assignment measures the real gas difference this packing produces directly.

---

## 5. Versioning on-chain schemas.

Once data is written on-chain, its _shape_ at that moment is permanent.

There is no equivalent of an off-chain database migration that rewrites every existing row in place.

Week 33's own upgradability arc solved a _related_ problem, evolving a contract's own _logic_ while keeping the _same_ storage layout (Week 33, Concept 5's own append-only rule).

This week's own concern is different and, in a genuinely common real pattern, doesn't involve a proxy at all.

A brand-new contract, at a brand-new address, that needs to correctly handle data that already exists in an _older_, differently-shaped contract it doesn't share storage with.

```solidity
function getUser(address user) public view returns (string memory name, uint256 registeredAt, string memory bio) {
    UserV2 memory local = usersV2[user];
    if (local.version == 2) {
        return (local.name, local.registeredAt, local.bio);   // already migrated — read directly
    }
    (string memory legacyName, uint256 legacyRegisteredAt) = legacyRegistry.usersV1(user);   // fall back
    return (legacyName, legacyRegisteredAt, "");
}
```

An explicit `version` field on each stored entry, checked at read time and a **lazy migration** (writing the new, complete shape only the next time that specific user actually interacts with the new contract, rather than migrating every existing entry all at once in one expensive transaction) is the standard, gas-conscious answer.

Hard's own assignment builds exactly this, genuinely different in mechanism from Week 33's own proxy-based upgrade, worth telling apart precisely.

Week 33 keeps one address, one shared storage, evolving logic.

This pattern uses two separate addresses, two separate storage areas, bridged deliberately by application-level logic reading across them.

---

## 6. Pagination patterns for large datasets.

A single call, on either chain, cannot safely return an unbounded amount of data.

Solana bounds this via a real, hard account-size ceiling.

The EVM bounds it via gas, ultimately the block gas limit itself (Week 26, Concept 3), the exact mechanical root of Week 31, Concept 7's own DoS pattern, now encountered from the _read_ side rather than the write side.

```solidity
// NAIVE — grows without bound, a real, growing cost and eventual hard failure as `listings` grows
function getAllListings() external view returns (Listing[] memory) {
    return listings;
}

// PAGINATED — bounded work per call, regardless of how large the underlying dataset ever grows
function getListings(uint256 offset, uint256 limit) external view returns (Listing[] memory page) {
    uint256 total = listings.length;
    if (offset >= total) return new Listing[](0);
    uint256 end = offset + limit > total ? total : offset + limit;
    page = new Listing[](end - offset);
    for (uint256 i = offset; i < end; i++) {
        page[i - offset] = listings[i];
    }
}
```

Medium's own assignment measures exactly how the naive version's own gas cost grows with the dataset's own size while the paginated version's own cost stays flat concrete, not asserted.

Worth naming directly, though. Pagination _on-chain_ is really a stopgap for moderate cases and Concept 7 covers the more complete, standard real-world answer for genuinely large or frequently-queried datasets.

---

## 7. Off-chain vs. On-chain data trade-offs.

The most consequential design decision this whole week builds toward.

Not _how_ to structure on-chain data, but _what actually needs to live on-chain at all_.

Ownership, balances and anything a contract's own logic must directly enforce or verify (Week 27's entire security-relevant state) genuinely has to live on-chain.

Nothing else provides the guarantees this course has spent since Week 27 building on.

Rich metadata, full historical activity and anything primarily needed for _search, filtering or display_ rather than on-chain enforcement is usually better served off-chain.

Week 29, Concept 4's own `tokenURI` pointing at off-chain JSON rather than storing it directly, Week 35's own subgraph indexing full history a contract itself never needs to iterate, Week 24's Solana-side indexing infrastructure solving the identical problem from the other chain.

Medium's own `getAllListings` (Concept 6) is, in a real system, exactly the function a project would delete entirely in favor of a subgraph query.

The naive on-chain version exists in this week's own assignment specifically to be measured and felt as a real cost, not because it's how a production system should actually expose this data.

---

## 8. Designing one real data model end to end.

Walk a single, realistic design question, "how should a marketplace store its listings," through every concept above in order, rather than leaving each as an isolated rule.

- Scalability (Concept 1): One `Listing[]` array, appended to, never requiring a shared, contended piece of state per listing.

- Normalization (Concept 2): A listing's own seller address is stored directly on the listing itself, not looked up separately, since it's needed on nearly every read.

- Storage cost (Concept 4): A listing's own `price` and `active` flag, packed together rather than each taking a full slot.

- Versioning (Concept 5): A listing struct genuinely likely to grow a new field someday (a category tag, an expiry) benefits from planning an explicit `version` byte from day one, even before it's needed, exactly the same "cheap now, expensive to retrofit" argument Week 33 made for upgradability itself.

- Pagination (Concept 6): `getListings(offset, limit)`, never `getAllListings()`, from the very first version.

- Off-chain (Concept 7): Full-text search across listing titles, sorting by popularity, anything beyond "give me page N" belongs in a subgraph (Week 35), not in Solidity at all.

This is genuinely the actual skill this week is building. Not memorizing seven separate facts, but running every one of them past a single real design before writing the first line of a contract's own state.

---

## Assignment.

1. **Easy - Measuring Normalization and Storage Packing, For Real.**

   **What you practice:**
   - The real gas cost difference between a normalized, cross-referencing read and a denormalized, single-read one (Concept 2)
   - The real gas cost difference between an unpacked and a packed struct (Concept 4)

   **Requirements:**
   - A `NormalizedRegistry` contract: separate `users` and `balances` mappings, `getUserSummary` reading both.
   - A `DenormalizedRegistry` contract: one `profiles` mapping holding everything, `getUserSummary` reading it once.
   - An `UnpackedStorage` contract: an `Item` struct with `quantity`, `price` (both `uint256`), `active` (`bool`), `createdAt` (`uint256`) — four slots.
   - A `PackedStorage` contract: the identical information, `quantity`/`price` as `uint128` (packed into one slot together), `active`/`createdAt` (`uint88`) packed into a second slot — two slots.
   - A test measuring and printing the real gas cost of each pair's own equivalent operation, confirming the packed/denormalized version costs meaningfully less in both cases.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

       Expected output: both tests PASS, and the printed console output
       shows real, different gas numbers for each pair — Denormalized
       and Packed both meaningfully lower than their own counterparts,
       confirming Concepts 2 and 4 directly rather than by assertion alone.

   2. Command: forge test --match-test testFix_PackedWriteCostsLessGasThanUnpacked -vvvv

       Expected output: a full trace showing FOUR separate `SSTORE`
       operations for `UnpackedStorage.create` against only TWO for
       `PackedStorage.create` — the exact mechanical reason for the gas
       difference, visible directly in the trace, not just implied by the
       final numbers.

   3. Action: in src/PackedStorage.sol, temporarily reorder the struct
       fields to `bool active; uint128 quantity; uint128 price; uint88
       createdAt;` (breaking the adjacency that made packing work — `bool`
       alone starts a fresh slot, then `quantity`+`price` no longer align
       the same way), rebuild, and re-run:

       forge test --match-test testFix_PackedWriteCostsLessGasThanUnpacked -vv

       Expected output: the packed version's own gas number increases
       noticeably from before (though the test may still pass overall,
       since SOME packing may still occur depending on the exact new
       layout) — confirming DECLARATION ORDER genuinely matters for
       packing to work, not just which types are chosen. Revert the change
       afterward.

   4. Action: in src/DenormalizedRegistry.sol, temporarily add a SECOND,
       separate mapping duplicating `balances` yet again (an unnecessary
       THIRD copy of the same data), and read from IT too inside
       `getUserSummary`, then re-run:

       forge test --match-test testFix_DenormalizedReadCostsLessGasThanNormalized -vv

       Expected output: `denormalizedGas` now increases, potentially
       closing much of the gap with `normalizedGas` — confirming
       denormalization isn't "duplicate everything for free," it's a
       deliberate trade-off with its own real cost the moment it's overused
       past what a specific read actually needs. Revert the change
       afterward.
   ```

2. **Medium - Pagination: Measuring the Wall, and Building the Escape Hatch.**

   **What you practice:**
   - Watching a naive, unbounded read's own gas cost grow directly with dataset size (Concept 6)
   - Building and measuring a paginated alternative whose own cost stays flat regardless of total size
   - Recognizing, directly in this assignment's own Requirements, exactly where the real, off-chain answer (Concept 7) takes over from on-chain pagination entirely

   **Requirements:**
   - A `Marketplace` contract: `createListing(uint256 price, string calldata title)` (appends to a `Listing[]`, emits `ListingCreated` — Concept 7's own off-chain-indexable escape hatch, present from day one, not added later).
   - `getAllListings()` — the naive, unbounded version (Concept 6).
   - `getListings(uint256 offset, uint256 limit)` — the bounded, paginated version.
   - A test creating a genuinely large number of listings (at least 200), then measuring and comparing `getAllListings()`'s own gas cost against `getListings(0, 20)`'s own gas cost, confirming the paginated call costs dramatically less despite the underlying dataset being identical in both cases.
   - A second test confirming `getListings` correctly returns a short, correctly-sized final page when `offset + limit` exceeds the total listing count, rather than reverting or returning garbage.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv --gas-report

       Expected output: `getAllListings() gas, 200 listings` prints a
       real, meaningfully larger number than `getListings(0, 20) gas` —
       confirming Concept 6's own claim directly, with real listings,
       not a hypothetical.

   2. Action: in setUp(), temporarily change the loop to create 1000
       listings instead of 200, then re-run:

       forge test --match-test testFix_PaginatedReadCostsFarLessThanUnboundedRead -vv

       Expected output: `getAllListings()`'s own gas number grows roughly
       proportionally with the new, larger count; `getListings(0, 20)`'s
       own gas number stays close to what it was before — confirming
       Concept 6's own "flat regardless of total size" claim isn't
       specific to exactly 200 listings, it holds as the dataset genuinely
       grows. Revert the loop count afterward.

   3. Command: forge test --match-test testFix_FinalPageIsShortAndCorrectRatherThanRevertingOrGarbage -vvvv

       Expected output: a trace confirming `getListings(190, 20)` returns
       an array of length 10 (indices 190 through 199), not a revert and
       not a garbage-filled array of length 20 — confirming the bounds
       check inside the pagination logic genuinely handles the
       "near the end of the dataset" edge case correctly.

   4. Action: in src/Marketplace.sol, temporarily remove the
       `if (end > total) end = total;` line entirely from `getListings`,
       rebuild, and re-run Test Case 3's own test.

       Expected output: reverts instead (an out-of-bounds array access
       attempting to read past the real end of `listings`) — confirming
       that one line was genuinely the entire mechanism handling this edge
       case correctly, not incidental to the test passing before. Revert
       the change afterward.
   ```

3. **Hard - Schema Versioning: Migrating Live Data to a New Contract, Lazily.**

   **What you practice:**
   - A genuinely different evolution strategy from Week 33's own proxy upgrade: two separate contracts, two separate storage areas, bridged deliberately by application logic (Concept 5)
   - Reading old-shaped data correctly through new logic, and migrating it lazily, only on next write, rather than all at once
   - Documenting Concept 3's own PDA-vs-storage-contract comparison as a real, written design decision, since this course's own tooling can't build a literal Solana PDA to compare against directly

   **Requirements:**
   - A `UserRegistryV1` contract: a simple `mapping(address => UserV1)`, `register(string calldata name)`.
   - A `UserRegistryV2` contract, a genuinely separate deployment: a `UserV2` struct adding a `bio` field and a `version` byte; `getUser(address)` correctly returns V1-shaped data (with an empty `bio`) for any user who's never touched V2's own storage, by reading through an interface to the real, already-deployed V1 contract; `setBio(string calldata)` lazily migrates that user's own entry into V2's own storage on this, their first V2 write, then updates normally on every subsequent call.
   - A test: register several users on V1 only; deploy V2 pointed at that real V1 address; confirm `getUser` on V2 correctly returns each one's real V1 data, with an empty bio, WITHOUT any of them ever having touched V2's own storage.
   - A test confirming that after one specific user calls `setBio`, THAT user's own entry is now genuinely stored in V2's own storage (`version == 2`), while every other, untouched user's data still correctly falls back to V1.
   - A `DATA_MODEL_DESIGN.md`, documenting this specific design's own real Concept 3 trade-off (why a second EVM contract with a fallback read, rather than a Solana-style PDA-per-user, was the right call here — or wouldn't have been, argued honestly) and its own Concept 5 migration strategy.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv

       Expected output shape:
           Ran 2 tests for test/SchemaVersioning.t.sol:SchemaVersioningTest
           [PASS] testFix_SetBioLazilyMigratesOnlyTheCallingUser()
           [PASS] testFix_V2CorrectlyReadsNeverMigratedV1DataViaFallback()

   2. Command: forge test --match-test testFix_SetBioLazilyMigratesOnlyTheCallingUser -vvvv

       Expected output: a trace showing Alice's own `setBio` call reading
       FROM the real, deployed V1 contract via the interface, then writing
       the combined result into V2's own storage — confirming the
       migration genuinely reads real, existing data rather than silently
       discarding it, and confirming Bob's own data was never touched at
       all during Alice's own transaction.

   3. Action: in src/UserRegistryV2.sol, temporarily change `getUser`'s
       own fallback branch to return `("", 0, "")` instead of actually
       querying `legacyRegistry`, rebuild, and re-run:

       forge test --match-test testFix_V2CorrectlyReadsNeverMigratedV1DataViaFallback -vv

       Expected output: this test now FAILS — Alice's real V1 data
       (`"Alice"`, a real `registeredAt`) no longer comes through at all,
       confirming the fallback query was genuinely the entire mechanism
       making V2 correctly aware of V1's own already-existing users,
       not incidental to the test passing before. Revert the change
       afterward.

   4. Action: deploy a SECOND `UserRegistryV2` instance in a fresh test
       (or add one to this file) pointed at the SAME V1 address, and
       confirm it also correctly reads Alice's real data without ANYONE
       having called `setBio` on this new instance either.

       Expected result: it does — confirming the fallback mechanism reads
       from V1's own real, independent storage, not from anything specific
       to the FIRST V2 deployment's own state; any number of independent
       V2-shaped contracts could coexist, each correctly reading the same
       underlying V1 data, a real, useful property of reading through an
       interface rather than sharing storage the way a Week 33-style proxy
       upgrade would have required instead.
   ```
