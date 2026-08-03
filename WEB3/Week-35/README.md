# List of things learned.

## 1. The subgraph concept.

A **subgraph** is a small, self-contained project, three real files at its core (Concepts 3, 4 and a manifest tying them together) that together define exactly

- what on-chain data to watch,
- how to shape it into queryable entities &
- how to expose the result over GraphQL (Concept 2).

This is the Ethereum-side, productized answer to the exact problem Week 24 spent a whole week on for Solana (Geyser plugins, custom indexers, webhook payload verification) and the problem Week 32, Concept 6 explicitly flagged its own live event listener as _not_ actually solving.

A subgraph, unlike a page-level `contract.on(...)` listener, indexes from a real, specified historical starting block onward, persists everything to its own database and keeps serving that full history to any number of separate queriers, long after any one browser tab that triggered a listener would have closed.

---

## 2. GraphQL basics for querying.

GraphQL is a query language where the _caller_ specifies exactly which fields to return, in one request, nested arbitrarily deep.

A genuine contrast with a typical REST API (Week 26, Concept 11's own JSON-RPC is itself a kind of fixed-shape RPC protocol), where the server decides a fixed response shape per endpoint and the caller either gets it all or makes multiple round trips.

```graphql
{
  countChangeEvents(first: 5, orderBy: blockTimestamp, orderDirection: desc) {
    id
    changedBy
    newCount
    blockTimestamp
  }
}
```

Every subgraph automatically exposes a full set of standard query capabilities for each entity type defined in its own schema (Concept 3):

- filtering (`where: { ... }`),
- pagination (`first`/`skip`) and
- sorting (`orderBy`/`orderDirection`, both shown above).

None of this is hand-written per subgraph, it's generated directly from the schema itself, the same "the shape of the data determines the shape of the API" idea Week 26, Concept 6's ABI already embodied for contract calls, now for queries.

---

## 3. Defining `schema.graphql`.

A subgraph's own schema, written in GraphQL's Schema Definition Language, declares every **entity** type it will store.

Genuinely similar in spirit to Week 27, Concept 8's Solidity `struct`, but persisted in the Graph Node's own database rather than on-chain and typed with GraphQL's own scalar set (`BigInt`, `Bytes`, `String`, `Boolean`), which maps onto Solidity's own types (Week 27, Concept 3) in specific, standard ways.

```
`uint256` → `BigInt`, `address`/`bytes32` → `Bytes`.
```

```graphql
type CountChangeEvent @entity(immutable: true) {
  id: Bytes!
  changedBy: Bytes!
  newCount: BigInt!
  eventType: String!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
}
```

`@entity(immutable: true)` marks an entity that's written once and never updated again, exactly right for a raw event record (Easy's own assignment).

A genuinely different, _mutable_ entity (Hard's own `Task`, updated across three separate event types over its own lifetime) omits `immutable` and gets loaded, modified and re-saved by later handlers instead of only ever being created fresh.

A `@derivedFrom` field (Medium's own assignment uses this for a token holder's own transfer history) computes a reverse relationship automatically from a _forward_ reference elsewhere in the schema, rather than being stored and maintained by hand in every relevant mapping handler.

---

## 4. Mapping handlers, written in AssemblyScript.

The actual logic transforming a raw on-chain event into a stored entity is written in **AssemblyScript**.

A genuinely different, TypeScript-like language, syntactically close to real TypeScript but a real, stricter subset (no dynamic typing, explicit nullability, no arbitrary npm packages), compiled ahead of time to WebAssembly so the Graph Node can run it safely and deterministically.

The closest comparison this course has already made is Week 30, Concept 2's own point about Hardhat generating full TypeScript types from a compiled ABI, except here the generated types (`graph codegen`, Concept 6) are the entire interface a handler is written against, not just an autocomplete convenience.

```typescript
import { CountIncreased } from "../generated/Counter/Counter"; // generated from the ABI — Week 26, Concept 6
import { CountChangeEvent } from "../generated/schema"; // generated from schema.graphql — Concept 3

export function handleCountIncreased(event: CountIncreased): void {
  let entity = new CountChangeEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()), // a standard, collision-safe entity ID idiom
  );
  entity.changedBy = event.params.by;
  entity.newCount = event.params.newCount;
  entity.eventType = "increase";
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.save();
}
```

`event.params` carries the event's own typed arguments, exactly Week 28, Concept 6's ABI-encoded event data, already decoded.

`event.block` and `event.transaction` carry the surrounding context (Week 26, Concept 6; Week 27, Concept 9) a raw event log alone wouldn't include.

`entity.save()` is the actual write, nothing persists to the Graph Node's own database until it's called explicitly, exactly the same "must call it or nothing happens" discipline Week 27, Concept 9's `emit` requires for an event to actually be logged at all.

---

## 5. Event-driven indexing & How a Graph Node decides when to run a handler.

A subgraph's own manifest (`subgraph.yaml`, tying Concepts 3 and 4 together) declares

- exactly which contract address,
- on exactly which network and
- exactly which event _signatures_.

(Week 26, Concept 6's own 4-byte selectors, expressed here as full human-readable signatures)

It cares about, the Graph Node watches every new block on that network and the moment a matching event's log appears, it runs the corresponding handler, synchronously, in the exact order the events themselves occurred on-chain.

```yaml
eventHandlers:
  - event: CountIncreased(indexed address,uint256)
    handler: handleCountIncreased
  - event: CountDecreased(indexed address,uint256)
    handler: handleCountDecreased
```

This is a genuinely different indexing model from every option Week 24 covered for Solana.

Not a push-based webhook (Week 24's own term) an external service has to receive and verify, not manual polling.

And the real point worth contrasting directly against Week 32, Concept 6 one more time not an ephemeral, in-page listener either.

A subgraph starts from a declared `startBlock` (Concept 6 covers exactly why setting this correctly matters), processes every historical block up to the chain's current tip once, then continues indexing new blocks live, forever, independent of whether any particular querier's own browser tab or script happens to be open at the time.

---

## 6. Deploying subgraphs.

Three real steps turn a written subgraph into a queryable one:

```
graph codegen       # generates AssemblyScript types from schema.graphql AND the contract's own ABI

graph build         # compiles the mapping (Concept 4) to WebAssembly, produces the final deployable bundle

graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 <subgraph-name>
```

`graph codegen`'s own output (`generated/schema.ts`, `generated/Counter/Counter.ts` in Easy's own assignment) is exactly what Concept 4's mapping code imports from.

Running it _after_ any change to `schema.graphql` or the contract's own ABI and before running `graph build`, is a real, easy-to-forget step, since a stale generated file compiles fine but silently doesn't reflect the real, current schema or event shapes.

The `startBlock` set in `subgraph.yaml` (Concept 5) directly controls how long the very first sync takes.

Setting it to a contract's own real deployment block, rather than `0`, is the difference between syncing in seconds and syncing through years of unrelated Sepolia history that could never contain a relevant event in the first place.

Exactly why every previous week's own `deployments/sepolia.txt` file already stores the deployment block number alongside the address, a decision made back in Week 27 specifically so a moment like this one wouldn't need to re-derive it from scratch.

---

## 7. Querying subgraphs from a frontend.

A deployed subgraph's own GraphQL endpoint is just an HTTP URL, callable from anywhere, including directly from a browser dapp (Week 32).

With a plain `fetch` call or a small GraphQL client library, genuinely complementary to Week 32's own `ethers.js` reads, not a replacement for them.

A subgraph answers _"show me everything that's happened,"_ `ethers`'s own `Contract.getCount()` (Week 32, Concept 4) answers _"what's true right now, this instant."_ A real dapp typically uses both together.

```typescript
async function fetchRecentCountChanges() {
  const response = await fetch(
    "http://localhost:8000/subgraphs/name/counter-subgraph",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ countChangeEvents(first: 5, orderBy: blockTimestamp, orderDirection: desc) { id newCount eventType } }`,
      }),
    },
  );
  const { data } = await response.json();
  return data.countChangeEvents;
}
```

---

## 8. The Graph's hosted service vs. The decentralized network.

Worth stating plainly since a lot of existing tutorials and search results still describe the older setup as current.

**The Graph's original Hosted Service, a free, centralized indexing service The Graph itself operated, was fully deprecated in 2026.**

Any guide still pointing there is describing infrastructure that no longer exists.

The current path has two real tiers instead.

- **Subgraph Studio**: A free, developer-focused deployment target, used for building and testing a subgraph before it's ready for real production traffic. This week's own Hard assignment deploys here.

- **The Graph Network**: The real, decentralized production destination, where independent Indexers (who stake GRT, The Graph's own token, as a bond against serving accurate results), Curators and Delegators together serve a published subgraph's queries for real, paying and being paid in GRT. Genuinely more involved to reach, appropriately so, since it's meant for production traffic a real application depends on, not this week's own local learning loop.

|                  | Local Graph Node (Tutorial)                  | Subgraph Studio                                      | The Graph Network                                |
| ---------------- | -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Who runs it      | You, via Docker                              | The Graph (a real, hosted dev service)               | Many independent, GRT-staked Indexers            |
| Cost             | Free, your own machine                       | Free, for development                                | Real GRT payments per query, at production scale |
| Meant for        | Local development and testing (Easy, Medium) | Testing a subgraph before real production use (Hard) | Real, production dapps                           |
| Decentralization | N/A — entirely local                         | Centralized (a Graph-operated service)               | Fully decentralized                              |

---

## 9. Subgraphs vs. A custom indexer vs. A live listener. (The whole course's own "how do I get historical on-chain data" story, in one place)

This course has now built three genuinely different answers to a version of the same question, worth lining up directly rather than leaving scattered across separate weeks.

Week 24's own custom indexer (Geyser plugins, Yellowstone gRPC streaming, hand-rolled webhook verification):

- maximum control,
- maximum operational burden,

right when a project's own indexing needs are unusual enough that no off-the-shelf tool fits.

Week 32, Concept 6's live, in-page event listener:

- zero setup,
- zero infrastructure,

but no history at all and no life beyond the current tab.

This week's subgraph:

- a genuine middle ground,
- real infrastructure (Docker, or a hosted equivalent)

but a fraction of a custom indexer's own build effort, full historical queryability and a standard, GraphQL-based interface any frontend can consume without needing to know anything about how the indexing itself actually works underneath.

---

## Assignment.

1. **Easy - Indexing Week 30's Counter.**

   **What you practice:**
   - A minimal schema with one immutable entity type (Concept 3)
   - A mapping handler for two related event types, written in AssemblyScript (Concept 4)
   - The full `codegen` → `build` → `deploy` loop against a local Graph Node (Concept 6)
   - Querying the result over GraphQL (Concept 2)

   **Requirements:**
   - Index Week 30's own Sepolia `Counter` deployment at `0xe22F630A1AB30a145EAf7B2fA92d49687e796268`, including both `CountIncreased` and `CountDecreased` events.
   - A `CountChangeEvent` entity (immutable), recording who triggered the change, the new count, which kind of change it was, and the block/timestamp it happened in.
   - `startBlock` set to Week 30's own real deployment block number: `11444545`, not `0`.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Action: Check the local Graph Node indexing status.

       Command:

         curl -s http://localhost:8030/graphql \
           -H 'Content-Type: application/json' \
           --data-binary @- <<'EOF'
       {
         "query": "{ indexingStatuses(subgraphs: [\"QmU8146nv7jiksW8BjSQY4LYz2tcdDaWtLSsYZKWzRgYy6\"]) { subgraph synced health chains { chainHeadBlock { number } latestBlock { number } } } }"
       }
       EOF

       Expected result:

         "synced": true
         "health": "healthy"

       This confirms that the subgraph successfully indexed from the
       Week 30 deployment block through the current Sepolia tip.

   2. Action: Query the indexed CountChangeEvent entities.

       Command:

         curl -s http://localhost:8000/subgraphs/name/counter-subgraph \
           -H 'Content-Type: application/json' \
           --data '{"query":"{ countChangeEvents(first: 10, orderBy: blockNumber, orderDirection: desc) { id changedBy newCount eventType blockNumber blockTimestamp } }"}'

       Expected result:

         {
           "data": {
             "countChangeEvents": [
               {
                 "id": "0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e376555010000",
                 "changedBy": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
                 "newCount": "1",
                 "eventType": "increase",
                 "blockNumber": "11486403",
                 "blockTimestamp": "1786700832"
               }
             ]
           }
         }

   3. Action: Trigger one new real transaction against the same Counter.

       Command:

         cast send 0xe22F630A1AB30a145EAf7B2fA92d49687e796268 \
           "increment()" \
           --rpc-url https://ethereum-sepolia-rpc.publicnode.com \
           --account deployerKey

       Expected result:

       The transaction succeeds and produces a Sepolia transaction receipt
       containing a CountIncreased event.

       Example transaction:

         transactionHash:
         0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e3765

         blockNumber:
         11486403

       After the Graph Node indexes the new block, run the Test Case 2
       GraphQL query again.

       Expected GraphQL result:

         A new CountChangeEvent entry appears with:

           changedBy:   0xbe1a491a93822eb244f111ce83baa0b2c617c305
           newCount:   1
           eventType:  "increase"
           blockNumber: 11486403

       This confirms that the subgraph is indexing LIVE activity, not just
       the historical backlog.


   4. Action: Query only increase events using a GraphQL filter.

       Command:

         curl -s http://localhost:8000/subgraphs/name/counter-subgraph \
           -H 'Content-Type: application/json' \
           --data '{"query":"{ countChangeEvents(where: { eventType: \"increase\" }) { id newCount } }"}'

       Expected result:

         {
           "data": {
             "countChangeEvents": [
               {
                 "id": "0x826cabd698e9cbd89041185b1fccb5d61c7509d9e00294fda7d9eb4b842e376555010000",
                 "newCount": "1"
               }
             ]
           }
         }

       This confirms that GraphQL filtering generated from the schema works
       correctly.
   ```

2. **Medium - Indexing Week 29's `GameToken`, With Derived Holder Balances.**

   **What you practice:**
   - A mutable entity (`Holder`) updated across many separate events, contrasted with Easy's own immutable, append-only one (Concept 3)
   - `@derivedFrom`, computing a reverse relationship automatically (Concept 3)
   - Correctly handling a mint (`from == address(0)`) as a special case within a single shared handler (Concept 4)

   **Requirements:**
   - Index Week 29's own **Sepolia** `GameToken` deployment at `0x340Ac35821b9F6D1321E013A1C353B8ECac9f7fF`, deployed fresh to Sepolia using `deployerKey`.
   - A `Holder` entity tracking a running `balance`, and a `Transfer` entity (immutable) recording every individual transfer.
   - `Transfer.from`/`Transfer.to` typed as references to `Holder`, and `Holder.transfersSent`/`transfersReceived` computed via `@derivedFrom` rather than stored directly.
   - Minting (a `Transfer` from `address(0)`) credits the recipient without attempting to debit a real sender balance.
   - Verify the subgraph by minting `1000 GAME` and then transferring `100 GAME` to another address, resulting in the corresponding `Holder` balances being updated correctly.
   - Deploy the completed subgraph to **Subgraph Studio** and verify the indexed data through GraphQL.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Action, once synced, query:

       { holders(orderBy: balance, orderDirection: desc, first: 5) { id balance } }

       Expected result: real holder addresses with real balances, matching
       what `cast call <GAMETOKEN_ADDRESS> "balanceOf(address)(uint256)"`
       independently reports for the same addresses — confirming the
       mapping's own running balance calculation genuinely matches the
       real, on-chain ERC-20 state (Week 29, Concept 1), not just an
       internally-consistent but wrong number.

       Verified result:
       - `0xbe1a491a93822eb244f111ce83baa0b2c617c305` → 900 GAME
       - `0x23232f3d5815361c73f5599daea4c66e63952120` → 100 GAME
       - `0x0000000000000000000000000000000000000000` → 0 GAME

   2. Action: query a specific holder's own relationship fields:

       { holder(id: "<AN_ADDRESS_THAT_HAS_TRANSFERRED_TOKENS>") {
           balance
           transfersSent { value blockTimestamp }
           transfersReceived { value blockTimestamp }
       } }

       Expected result: both lists populate correctly, entirely from
       `@derivedFrom` — confirming Concept 3's claim that this relationship
       never needed to be stored or maintained directly in the mapping code
       at all, only the forward `from`/`to` references on `Transfer` itself.

   3. Action: query specifically for the original mint transaction (the
       very first Transfer, from the zero address, when GameToken's owner
       first minted supply in Week 29's own Easy assignment):

       { transfers(where: {
           from: "0x0000000000000000000000000000000000000000"
         }) {
           to { id }
           value
         }
       }

       Expected result: the original mint appears, `to` correctly resolves
       to whichever address it was minted to — confirming the zero-address
       special case in the mapping didn't accidentally create a real
       "Holder" for address zero with a broken, wrapped-around negative
       balance from an attempted debit that should never have happened.

   4. Action: in `src/game-token.ts`, temporarily remove the
       `if (!event.params.from.equals(ZERO_ADDRESS))` check entirely
       (always debit `fromHolder` unconditionally), redeploy to a
       freshly-named subgraph (`game-token-subgraph-broken`), and repeat
       Test Case 1's own query, specifically checking the zero address's
       own holder entry:

       { holder(id: "0x0000000000000000000000000000000000000000") {
           balance
       } }

       Expected result: a large negative-turned-huge-positive number
       (BigInt underflow, wrapping around, the exact class of bug Week 27,
       Concept 10 named in Solidity's own context, now hit in mapping code
       instead) — confirming the special case was genuinely load-bearing,
       not defensive styling. Revert the change afterward, and consider the
       broken subgraph disposable, no need to keep it deployed.
   ```

3. **Hard - Indexing Week 27's `TaskRegistry`, With Entities Updated Across Multiple Event Types, Deployed for Real to Subgraph Studio.**

   **What you practice:**
   - A genuinely mutable entity, loaded and re-saved across THREE separate event types over its own lifetime, not just two (Concept 3)
   - Handling an enum-shaped event parameter (`Status`) by mapping it to a readable string in the handler itself
   - A real deployment to Subgraph Studio, the actual current path Concept 8 describes, not just a local Graph Node

   **Requirements:**
   - Index Week 27's own Sepolia `TaskRegistry` deployment: `TaskCreated`, `TaskAssigned`, and `StatusUpdated` events, all three.
   - A single, mutable `Task` entity, created on `TaskCreated`, updated (not replaced) on both `TaskAssigned` and `StatusUpdated`, tracking `taskId`, `description`, `assignedTo` (nullable — unset until actually assigned), `status` (as a readable string, not the raw `uint8`), `createdAtBlock`, `updatedAtBlock`.
   - A handler that gracefully does nothing (rather than crashing) if `TaskAssigned` or `StatusUpdated` somehow arrives for a `taskId` with no corresponding `Task` entity yet — a real defensive habit worth building here, not just for this specific case.
   - A real deployment to Subgraph Studio: a free account, a wallet connection, `graph auth`, and `graph deploy` targeting Studio instead of the local Graph Node.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```text
   1. Action: Check the subgraph's sync status in the Subgraph Studio
     dashboard.

       Expected result: The subgraph shows "Synced," and Studio's
       built-in playground lets you run:

         {
           tasks {
             id
             description
             status
             assignedTo
           }
         }

       Expected result: The query returns the real tasks indexed from
       Week 27's TaskRegistry, including historical tasks that were
       created before this subgraph was deployed.

       This confirms that startBlock-driven historical synchronization
       works with real multi-event entity data.

   2. Action: Query a task that goes through its FULL lifecycle:
       created, assigned, and status updated.

         {
           task(id: "1") {
             description
             status
             assignedTo
             createdAtBlock
             updatedAtBlock
           }
         }

       Expected result:

         {
           "data": {
             "task": {
               "description": "Week 35 full lifecycle test",
               "status": "Done",
               "assignedTo": "0xbe1a491a93822eb244f111ce83baa0b2c617c305",
               "createdAtBlock": "11492568",
               "updatedAtBlock": "11492585"
             }
           }
         }

       The task was created at block 11492568, assigned at block
       11492578, and updated to Done at block 11492585.

       This confirms that the same mutable Task entity was loaded and
       re-saved across multiple separate event handlers rather than
       being replaced with a new entity.

   3. Action: Query specifically for tasks that were created but NEVER
       assigned:

         {
           tasks(where: { assignedTo: null }) {
             id
             description
             status
             assignedTo
             createdAtBlock
             updatedAtBlock
           }
         }

       Expected result:

         {
           "data": {
             "tasks": [
               {
                 "id": "0",
                 "description": "Ship Week 27",
                 "status": "Open",
                 "assignedTo": null,
                 "createdAtBlock": "11422167",
                 "updatedAtBlock": "11422167"
               }
             ]
           }
         }

       The unassigned task appears with assignedTo genuinely set to
       null, rather than the zero address or an empty string.

       This confirms that the nullable assignedTo field correctly
       represents "never assigned" as a distinct queryable state.

   4. Action: In src/task-registry.ts, temporarily remove the
       `if (task == null) return;` guard from `handleTaskAssigned`,
       then attempt to assign a nonexistent task:

         cast send \
           0xef7EC7E600A1e8486915C8E0A87184A36073357c \
           "assignTask(uint256,address)" \
           999 \
           <ANY_ADDRESS> \
           --rpc-url sepolia \
           --account deployerKey

       Expected result: The transaction reverts because TaskRegistry's
       on-chain logic throws its TaskNotFound custom error for task ID
       999.

       Therefore, no TaskAssigned event is emitted and the subgraph
       receives no event to process. Nothing observable changes in the
       indexed data.

       This confirms that the `if (task == null) return;` guard is
       defensive-in-depth for an impossible event sequence under the
       current TaskRegistry implementation. It is still retained in the
       final mapping because the assignment explicitly requires the
       handler to fail gracefully if such an event were ever received.

       Restore the guard afterward so the final implementation matches
       the assignment requirements.
   ```
