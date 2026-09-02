# List of things learned.

## 1. Move-based chains: The object-centric model (Aptos, Sui).

Every account model this course has built against, Solana's own (Week 11) and the EVM's own (Week 27, Concept 2).

Turns out to be two answers to the same underlying question, "where does a contract's own state actually live."

**Move**, the language behind both Aptos and Sui, answers a related but genuinely different question. Instead of state living in a mapping or an account's own byte-array, Move state is made of **resources**.

First-class, individually-owned objects with a real, compiler-_enforced_ property neither Solidity nor ordinary Rust-on-Solana programs have natively.

A resource **cannot be copied, and cannot be silently dropped**, by the type system itself, not by convention or by a developer's own discipline.

```move
module counter_addr::counter {
    struct Counter has key {
        value: u64,
    }

    public fun create(account: &signer) {
        // the Counter now BELONGS to this account : linearly, enforced
        move_to(account, Counter { value: 0 });
    }

    public fun increment(addr: address) acquires Counter {
        let counter = borrow_global_mut<Counter>(addr);
        counter.value = counter.value + 1;
    }

    public fun get(addr: address): u64 acquires Counter {
        borrow_global<Counter>(addr).value
    }
}
```

`has key` marks `Counter` as storable directly under an account;

`move_to` genuinely **moves** it there, the same linear-ownership discipline Rust's own borrow checker enforces for local values, now extended to _persistent, on-chain_ state.

Something neither Solidity's own mappings (Week 27, Concept 7, freely readable and overwritable by any function with the right access) nor a Solana account (Week 11, ownership is a convention the runtime checks, not a type-level guarantee) actually offer.

`acquires Counter` is a real, compiler-checked effect declaration, a function has to state up front exactly which global resources it touches, catching an entire class of "this function secretly reads storage nobody expected it to" bugs (Week 40's own data-model-design concerns, now caught by the compiler itself rather than left to careful review) before the code ever runs at all.

---

## 2. Cosmos SDK and IBC, a real payoff for Week 36's own deferred concept.

Cosmos takes a genuinely different structural bet than either general-purpose chain this course has built on.

Rather than many apps sharing one virtual machine (the EVM, Week 26 onward) or one runtime (Solana, Week 10), the **Cosmos SDK** lets each app build its _own_, fully sovereign, purpose-built blockchain.

Its own validator set, its own governance, its own fee token, from day one.

**IBC** (Inter-Blockchain Communication) is the real, live, standardized protocol connecting these many separate sovereign chains and it's genuinely the concrete, working version of exactly what Week 36, Concept 6 named and deliberately left at overview level.

A real, live, **light-client-based** bridge, where a destination chain's own logic directly verifies a cryptographic proof of the source chain's own consensus, no separate trusted relayer set (Week 36, Concept 5's own multisig row) required at all.

Where Week 37's own hands-on bridge needed a real, live off-chain relayer service watching one chain and signing for another, IBC's own security model rests on the _chains themselves_ verifying each other directly.

A real, working instance of the exact trust-minimized end of Week 36's own spectrum this course only ever built toward, not fully reached, in its own from-scratch bridge weeks.

---

## 3. Bitcoin L2s, in overview. (Lightning, Stacks, Rootstock)

Bitcoin's own base layer is deliberately far simpler than the EVM (Week 26 onward).

Not Turing-complete, no general-purpose contract execution at all, which means "Layer 2" means something genuinely different here than Week 43's own rollup-centric definition.

- **Lightning Network**: Not a rollup at all, a network of bilateral **payment channels**, two parties locking funds together on-chain once, then transacting instantly and freely off-chain between themselves, settling back to the base chain only when the channel eventually closes.

  An entirely different scaling mechanism from anything Week 43 covered, no shared sequencer or prover (Week 43, Concepts 6-8) involved anywhere.

- **Stacks**: A separate smart-contract layer with its own novel consensus mechanism, settling state back to Bitcoin's own base layer.

- **Rootstock (RSK)**: An EVM-_compatible_ sidechain, merge-mined alongside Bitcoin itself.

  Genuinely the most familiar of the three to this entire course, since ordinary Solidity (everything since Week 27) runs on it largely unchanged, while its own security model is a real, separate question from Bitcoin's own base-layer security, worth understanding precisely rather than assuming "EVM-compatible" implies "as secure as Ethereum mainnet."

---

## 4. App-specific chains vs. General-purpose chains, the full picture.

Week 43, Concept 10 already named this trade-off from the rollup/RaaS side specifically.

This week's own material completes it.

A **general-purpose chain** (Ethereum L1, Solana) shares one execution environment, one security budget and one ecosystem's own tooling and liquidity across _every_ app built on it.

Real, genuine network effects, at the real, shared cost of that one environment's own fee market and throughput being contended by everyone at once (Week 26, Concept 3's own gas-price-under-contention reality).

An **app-specific chain**, whether a Cosmos SDK chain (Concept 2), a dedicated Ethereum/Solana L2 rollup (Week 43) or an app-chain launched via a real RaaS provider (Week 43, Concept 10).

Trades that shared benefit away in exchange for full, sovereign control over its own execution environment, fee token and governance, entirely insulated from unrelated activity elsewhere.

Neither is universally correct, the identical "shared vs. sovereign" tension this course has now shown up in at least three genuinely different technical shapes, across three genuinely different weeks.

---

## 5. When to choose a non-EVM/non-Solana stack.

A real, concrete answer, not "it depends" left unresolved.

Move (Concept 1) earns real consideration when an application's own core logic is fundamentally about _uniquely-owned, non-duplicable assets_.

Real estate, high-value collectibles, anything where a resource accidentally existing twice or silently vanishing, would be a genuinely catastrophic bug class rather than an inconvenience, since Move's own linear-type system prevents that class of bug at compile time in a way neither Solidity nor Solana's own Rust programs structurally can.

Cosmos (Concept 2) earns real consideration when an app genuinely needs its own sovereign governance and its own native fee token from day one, not just its own dedicated execution lane the way an app-chain rollup (Week 43) already provides while still settling to and drawing security from a shared L1.

A Bitcoin L2 (Concept 3) earns real consideration specifically when an application's own core value proposition depends on Bitcoin's own particular brand of base-layer security or its own deep, singular liquidity, not generic "blockchain" security broadly.

Hard's own assignment applies exactly this reasoning to three real, specific hypothetical projects, rather than leaving the framework abstract.

---

## 6. The full landscape, on one table.

|                                | Solana (Weeks 10-25)                              | EVM (Weeks 26-50)                                         | Move (Aptos/Sui)                                                   | Cosmos SDK                                                            | Bitcoin L2s                                                                           |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Execution model                | Sealevel — parallel (Week 10)                     | Sequential (Week 26, Concept 2)                           | Parallel-friendly (object ownership makes conflicts explicit)      | Sequential, per-chain                                                 | Varies by L2 (Concept 3)                                                              |
| State/account model            | Accounts, owner field (Week 11)                   | Contract storage, mappings (Week 27)                      | Resources — linearly owned, compiler-enforced (Concept 1)          | App-specific, per-chain                                               | Varies (channels, separate VM, sidechain)                                             |
| Cross-chain approach           | Bridges built by hand (Weeks 36, 37)              | Bridges built by hand (Weeks 36, 37)                      | Chain-specific bridge infrastructure                               | IBC — light-client-based, standardized (Concept 2)                    | Varies (Lightning has none in the general sense; RSK bridges to Bitcoin specifically) |
| Real, specific fit (Concept 5) | Latency-sensitive, high-throughput apps (Week 10) | Maximum tooling maturity, biggest ecosystem (Weeks 27-50) | Uniquely-owned, high-value assets needing compiler-enforced safety | Apps needing sovereign governance and a native fee token from day one | Apps whose core value depends on Bitcoin's own specific security or liquidity         |

---

## 7. Closing the loop. (Where this course's own 51 weeks actually connect)

This week's own five real concepts turn out to be direct payoffs of specific, earlier weeks, not new, disconnected material.

Worth stating explicitly as the actual final concept of this entire course.

- Move's own linear resources (Concept 1) are the concrete answer to a data-modeling question Week 40 raised and left to disciplined convention rather than compiler enforcement.

- IBC (Concept 2) is the real, live version of the light-client bridge Week 36, Concept 6 named and deliberately deferred.

- Bitcoin's own Lightning Network (Concept 3) is a genuinely different scaling answer to the identical throughput problem Week 43's entire rollup arc solved a different way.

- App-specific vs. general-purpose (Concept 4) is the same tension this course first raised in Week 1's own "blockchain landscape" concept, now closed with the full, real picture available.

- And Concept 5's own decision framework is, in miniature, exactly the kind of real, argued, concept-citing document this course has asked for since Week 31's own `SECURITY_CHECKLIST.md`.

Hard's own final assignment is that same discipline, applied one last time, at the largest possible scale. Not one contract's own design, but a real technology stack, for a real project, reasoned from everything this course has actually built.

---

## Assignment.

1. **Easy - The Same Counter, in Solidity and Move, Side by Side.**

   **What you practice:**
   - Real, correct Move syntax, studied directly against Week 27's own already-familiar `Counter.sol` (Concept 1)
   - Precisely which safety property Move's own linear-type system provides that neither Solidity nor a plain Solana program structurally guarantees

   **Requirements:**
   - Week 27's own `Counter.sol`, unchanged, with a real, passing `forge test` suite (reuse Week 27's own Easy tests directly).
   - The real Move module from Concept 1's own Contents, `counter.move`, unchanged.
   - A written `COMPARISON.md`, mapping each Move construct (`has key`, `move_to`, `acquires`, `borrow_global_mut`) to its own closest Solidity/EVM equivalent, and stating explicitly, for each one, whether Solidity's own version is enforced by the compiler, or only by convention and careful review.

   [Solution](./Assignment/code1/)

   **Manual Test Cases.**

   ```
   1. Command: forge test -vv (from solidity/)

       Expected output: Week 27's own Easy tests pass, exactly as they
       did the first time — confirming this week's own comparison starts
       from genuinely working, already-verified code on the Solidity side.

   2. Action: read move/counter.move's own `increment` function line by
       line, and identify precisely which line would need an EXPLICIT,
       manual access-control check in Solidity (Week 27, Concept 4) to
       achieve the SAME "only this account's own Counter is ever touched"
       guarantee `acquires`/`borrow_global_mut` provide automatically.

       Expected result: there isn't a single Solidity line that provides
       this automatically — a Solidity mapping's own `counters[someAddress]`
       is reachable and mutable from ANY function with the right access,
       by construction; Move's own resource has to be explicitly passed an
       address and explicitly `acquire`d, a real, structural difference
       worth writing directly into COMPARISON.md's own final section.

   3. Action: fill in COMPARISON.md's own table completely, with real,
       specific answers — not "similar" or "roughly the same" for any row.

       Expected result: at least one row (linear ownership) has a real,
       honest "NO" in the compiler-enforced column for Solidity — the
       entire, concrete point Concept 1 makes, now stated in your own words.

   4. Action: re-read Week 40, Concept 5 (schema versioning) and Week 27,
       Concept 2 (storage) directly, then add one more real sentence to
       COMPARISON.md answering: would Move's own `acquires` declaration
       have made ANY of Week 40's own versioning work easier, harder, or
       genuinely unaffected?
   ```

2. **Medium - IBC vs. This Course's Own Bridges: A Real, Concrete Comparison.**

   **What you practice:**
   - Arguing precisely how a real, live, standardized protocol (IBC) differs from the from-scratch bridge infrastructure this course actually built (Weeks 36, 37)
   - Referencing real, already-written code from earlier weeks directly, rather than describing bridges generically

   **Requirements:**
   - Re-read Week 36's own `MultisigBridge.sol` (the M-of-N relayer model) and Week 37's own real, two-chain relayer script (`relayer.ts`) directly before writing anything.
   - A written `IBC_VS_CUSTOM_BRIDGE.md`: for each of Week 36's own real trust-spectrum rows (a single trusted relayer, an M-of-N multisig relayer set, light-client verification), state explicitly where IBC actually sits, and why — not a generic "IBC is trustless" claim, a specific one referencing Week 36's own real table.
   - A section explaining, specifically, what Week 37's own relayer script (`relayer.ts`, watching one chain, signing for another) would and would NOT still need to do if the bridge it served were replaced with a real IBC connection instead.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   1. Action: read IBC_VS_CUSTOM_BRIDGE.md's own first section aloud to
       yourself, checking specifically whether it names the ACTUAL row
       from Week 36's own real table, not a paraphrase.

       Expected result: the answer should be "light-client verification,"
       with a real, specific reason citing that row's own actual
       description — not "IBC is very secure," which restates the
       conclusion without the reasoning.

   2. Action: confirm the second section's own answer is specific to
       `relayer.ts`'s own real functions (`pollForLockedEvents`,
       `CONFIRMATIONS_REQUIRED`) rather than a generic statement about
       "relayers in general."

   3. Action: confirm the third section names a REAL, specific missing
       piece in `MultisigBridge.sol` (a light-client verifier contract,
       or equivalent) rather than a vague "it would need to be more
       trustless."

   4. Action: re-read Week 43, Concept 9 (based rollups) and add one
       final sentence to IBC_VS_CUSTOM_BRIDGE.md: does a based rollup's
       own "no separate sequencer, use L1's own validators directly"
       idea share anything real and structural with IBC's own "chains
       verify each other directly, no separate relayer set" idea — or
       are the two only superficially similar?
   ```

3. **Hard - The Full-Course Capstone: A Real Stack-Selection Framework, Applied.**

   **What you practice:**
   - Building one real, structured decision framework drawing on concepts from across the entire 51-week course
   - Applying it concretely to three specific, real hypothetical projects, with a real, argued recommendation for each — not "it depends" left unresolved

   **Requirements:**
   - A `STACK_SELECTION_FRAMEWORK.md`: a real, structured set of decision questions (not fewer than six), each one explicitly citing the specific week and concept it draws on — covering at minimum execution model (Weeks 10, 26), account/data model (Weeks 11, 27, 40, this week's own Concept 1), cross-chain needs (Weeks 36, 37, this week's own Concept 2), security/trust model (Weeks 31, 38, 42, 48), upgradability/governance needs (Weeks 33, 39, 42), and cost/scalability needs (Weeks 43, 45, 46).
   - Applied to three real, specific hypothetical projects: **(1)** a real-estate-deed NFT platform representing legal, unique, high-value ownership; **(2)** a cross-border micropayment remittance app; **(3)** a high-frequency perpetuals trading exchange.
   - For each of the three, a real, specific stack recommendation (naming an actual chain or family from this week's own landscape, or explicitly Solana/EVM from the rest of the course), with the framework's own questions answered concretely against that specific project, not generically.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Action: read back all three project recommendations and confirm
       each one is a REAL, specific stack name (e.g. "Sui," "a Cosmos SDK
       app-chain with IBC," "an Ethereum L2 optimistic rollup") — not
       "it depends" or "any of these could work" left as the final answer.

   2. Action: confirm each of the six framework questions is answered
       DIFFERENTLY, at least in some real respect, across the three
       projects — if all three projects produce identical answers to
       every question, the framework itself isn't actually discriminating
       between real, different project needs, and is worth revising.

   3. Action: for Project 3 specifically, confirm the answer references
       Week 45's own real MEV material by name, not just "MEV is a
       concern" — which specific MEV source (Week 45, Concepts 2-4, 10)
       is most relevant to a HIGH-FREQUENCY trading venue specifically,
       and does the recommended stack's own real architecture (Week 45,
       Concepts 6-8) make that specific source better or worse?

   4. Action: read the whole document once more, start to finish, and
       confirm it reads as a genuine, real capstone — citing specific,
       real weeks and concepts throughout, the same standard this course
       has held every design document to since Week 31's own
       `SECURITY_CHECKLIST.md` — rather than a generic "how to choose a
       blockchain" article that happens to mention this course's own week
       numbers in passing.
   ```
