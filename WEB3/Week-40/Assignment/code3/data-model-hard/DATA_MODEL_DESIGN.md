# Data Model Design. (UserRegistry)

## Concept 3: PDA vs. storage-contract for THIS specific design

If this were built on Solana, each user's profile could be stored in its own
PDA derived from the user's address. This would give each user a separate,
deterministic account for their data.

For this EVM exercise, a separate V2 contract with a fallback read from V1
was chosen because V2 does not need to keep the same contract address or
share V1's storage directly.

V1 remains unchanged, while V2 can introduce new fields such as `bio` and
`version`. V2 can also continue reading users who have never migrated.

A proxy upgrade would be better if the application needed to keep the exact
same contract address, preserve existing integrations, or directly reuse
the same storage layout.

For this design, keeping V1 and V2 separate is simpler because the migration
logic is handled explicitly by the application instead of changing V1's
existing storage.

---

## Concept 5: The migration strategy chosen, and its real trade-off

Lazy migration was chosen instead of migrating every V1 user immediately.

When a user first calls `setBio`, V2 reads that user's existing data from V1
and stores the migrated version in V2.

This means users who never use the new V2 functionality do not need to be
migrated at all.

The main trade-off is that data can temporarily exist across both contracts.
V2 therefore needs to know whether a user has already migrated. The `version`
field provides this information.

If `version == 2`, V2 reads the user's data from its own storage. Otherwise,
it falls back to V1.

An eager migration would require writing every existing V1 user's data into
V2. With many users, this could require a large amount of gas even for users
who never use V2.

Lazy migration avoids that cost by migrating only users who actually interact
with the new functionality.

The tests confirm this behavior: Alice calls `setBio`, so Alice's data is
stored in V2 with `version == 2`. Bob never calls `setBio`, so his V2 storage
remains empty and his data continues to come from V1.

---

## Concept 7: What belongs off-chain?

The basic profile data in this exercise is stored on-chain because the
application needs to read it directly from the contracts.

However, storing large amounts of profile information on-chain can be
expensive and is not ideal for complex searching.

For example, if a future version needed to find every user whose bio
contains a specific word, that search would be better handled off-chain
using an indexer or database.

The blockchain could keep the important user state, while an off-chain
system could index the data for fast searching and filtering.

This keeps the on-chain storage focused on data that actually needs to be
secured and verified by the blockchain.
