# List of things learned.

## 1. What are PDA's & the exact problem they solve.

> Week 11, Concept 3 drew a hard line.

An account's `owner` field says which _program_ may write its data, while Concept 5's `authority` is just a pubkey a program's logic chooses to trust.

Both of those still assume a real person (or another program acting on a person's behalf) is the one actually signing transactions.

But plenty of accounts genuinely need to be controlled by a **program itself**, with no human key involved at all, a token vault that only releases funds when a program's own logic says so (Week 19),

- a staking pool's escrowed balance,
- a counter no individual should be able to unilaterally overwrite.

A **Program Derived Address (PDA)** is exactly that, an address deliberately constructed so that **no private key for it exists, or could ever exist.**

Nobody, not even the program's own developer, can produce a signature for a PDA the ordinary way (Week 3), because there is no private key to sign with.

The only way to authorize an action _as_ a PDA is for the owning program itself to prove, to the runtime, that it derived this exact address from its own known seeds, which Concept 7 covers directly.

> This week is entirely about how that guarantee is actually constructed and Week 14 is where you'll use one for real inside a deployed program.

---

## 2. Off-curve Addresses. (The actual mechanism behind "no private key can exist")

> Week 3, Concept 4 covered Ed25519.

Eery ordinary public key is a point that lands **on** a specific elliptic curve, produced by multiplying a real private key against a fixed base point on that curve.

This is a one-way operation (Week 3's core theme), but it always lands on-curve, that's simply what the math produces.

A PDA is constructed to deliberately land **off** that curve instead, at a point no private-key-to-public-key derivation could ever produce.

This is checked directly and cheaply.

`PublicKey.isOnCurve(address)` returns `false` for a genuine PDA and `true` for essentially every real wallet address you'll ever generate.

That single boolean is the entire guarantee, off-curve means _"structurally impossible to have a matching private key,"_ not _"nobody has published one yet."_

```
Ordinary address:       private key --(Ed25519 math)--> ALWAYS lands ON the curve
PDA:                    seeds + programId --(hashing)--> deliberately forced OFF the curve
```

> This week's Easy assignment computes both cases directly and checks `isOnCurve` on each, rather than taking this on faith.

---

## 3. Seeds & The Bump. (Forcing a result off the curve on purpose)

A PDA is derived from **seeds**, arbitrary byte sequences you choose, a string, a `PublicKey`, a number, hashed together with the owning program's ID.

The raw result of that hash lands on-curve roughly half the time, purely by chance, since the hash output is effectively random from the curve's perspective.

That's a problem, an on-curve result would mean a private key for it _could_, in principle, exist somewhere.

The **bump** is the fix. One extra byte (0–255) appended to the seeds before hashing.

Different bump values produce entirely different hash outputs, so the derivation process tries bump `255`, checks if the result is off-curve and if not, tries `254`, then `253`, and so on, until it finds one that lands off-curve.

That successful bump value becomes part of the address's derivation, permanently.

---

## 4. Deterministic Address derivation.

The actual algorithm (roughly):

`PDA = SHA256(seeds + bump + programId + "ProgramDerivedAddress")`,

checked against the curve, exactly Week 5's hashing and Week 2's one-way-function properties, applied to produce an address instead of to chain a block.

The critical consequence, **the same seeds, the same programId, always produce the exact same PDA, computed by anyone, anywhere, with no network call at all.**

This is genuinely different from Week 11's account lookups, which needed a live `Connection` to ask the cluster _"what's stored at this address."_

A PDA needs nothing of the sort, a client can compute it entirely offline, then later ask the chain what (if anything) lives there.

This week's three assignments never open a `Connection` or touch devnet at all, for exactly this reason, PDA derivation is pure, local computation.

---

## 5. `findProgramAddressSync` and The Canonical Bump.

`@solana/web3.js` exposes this search directly:

```typescript
const [pda, bump] = PublicKey.findProgramAddressSync(seeds, programId);
```

It tries bump `255` downward and returns the **first** (highest) bump that lands off-curve, plus the resulting address.

That specific bump is called the **canonical bump** and it matters more than it might first appear:

- since roughly half of all 256 possible bump values land off-curve,
- \*\*multiple different,
- equally "valid" off-curve PDAs typically exist for the same seeds\*\*,
- just at different bump values.

`PublicKey.createProgramAddressSync(seeds, programId)` (no search, no `find`) computes the address for one _specific_ seed set directly and will happily return a different, non-canonical PDA if you hand it a different valid bump.

This is a real, documented security pattern, not a hypothetical.

**A program must only ever trust the canonical bump**, recomputed itself via `findProgramAddressSync`, never a bump number supplied by a client or stored carelessly.

Accepting an arbitrary client-supplied bump would let an attacker point a program at a _different_, still-technically-valid PDA for the same logical seeds, sidestepping whatever state the program expected to find there.

> Week 20's program security week returns to this exact class of bug in more depth; this week's Medium assignment demonstrates the underlying fact directly, an alternate, non-canonical, equally valid PDA really does exist for the same seeds.

---

## 6. Common PDA patterns. (Per-user accounts & vaults)

Two shapes account for the large majority of real PDA usage:

```
Per-user account:       seeds = ["user-profile", userPubkey]
                        -> one deterministic PDA per user, computable by
                            anyone who knows the user's pubkey, no lookup
                            table or database needed to find "whose account
                            is this."

Program vault:          seeds = ["vault", mintPubkey]  (or similar)
                        -> one program-controlled pool per resource,
                            holding funds no individual signer can move
                            unilaterally (Week 19's staking/escrow work
                            depends on exactly this pattern).
```

The deeper reason this pattern is so common, because derivation is deterministic and offline (Concept 4), a client never needs to _ask_ the chain _"where's this user's account,"_ it can simply recompute the same PDA itself, locally and then check what's there.

> This week's Medium and Hard assignments both build per-user PDAs using your own real wallet's public key as the seed, exactly this pattern, just without a live program behind it yet.

---

## 7. PDA as signer. (A preview of `invoke_signed`).

Concept 1 left one thread hanging.

If no private key exists for a PDA, how does a program ever move funds _out_ of a PDA-owned vault?

The answer is a runtime-level mechanism called **signing invocation** (`invoke_signed`) and it's worth understanding the shape of it now.

Even though writing it for real is Week 14 and Week 16's job:

When a program performs a cross-program invocation (Week 11, Concept 8) and needs to act _as_ a PDA it owns, it doesn't produce a cryptographic signature at all, it hands the **original seeds** to the runtime alongside the CPI call.

The runtime re-derives the PDA from those seeds itself, confirms it matches the account being used and if so, treats that account as "signed" for the duration of that single instruction, entirely a bookkeeping trick performed by the runtime, never an actual Ed25519 signature (Week 3) the way every other signer in this course has worked.

This is precisely why Concept 5's canonical-bump discipline matters so much, the seeds a program hands to `invoke_signed` must exactly reproduce the address it already owns, or the runtime's re-derivation check fails and the whole instruction is rejected.

---

## 8. PDA collision avoidance & Solana's hard seed limits.

Two practical constraints round out this week:

- **Collision avoidance**: If two conceptually different account _types_ within the same program used identical seed patterns, they could land on the same PDA and stomp on each other's data.

  The fix is always the same, a distinguishing prefix seed, a plain string literal like `"vault"` or `"user-profile"`, combined with the entity-specific seeds (a pubkey, a mint address).

  This week's Hard assignment derives three different account types for the exact same owner pubkey and confirms all three land on genuinely different addresses, purely because their prefixes differ.

- **Hard limits**: Solana enforces a **maximum of 32 bytes per individual seed** and a **maximum of 16 seeds total** per derivation.

  These aren't soft guidelines, they're enforced constraints (the 32-byte-per-seed limit is checked directly by `@solana/web3.js` itself, locally, before any network call is even possible).

  This week's Hard assignment deliberately violates both limits on purpose, to see the resulting errors firsthand rather than just reading about them.

---

## Assignment.

1. **Easy - Deriving a PDA: Determinism & the Off-Curve Guarantee.**

   **What you practice:**
   - Calling `findProgramAddressSync` directly, and confirming the same seeds and `programId` produce an identical address and bump on every call, with no network round-trip involved
   - Using `PublicKey.isOnCurve` to directly verify Concept 2's core claim, a derived PDA lands off-curve, while a real wallet address does not
   - Loading your own real wallet's public key from `~/.config/solana/id.json`, reading only `.publicKey`, never signing anything

   **Requirements:**
   - Derives a PDA from a single string seed against the Memo Program's address, twice, and confirms both the address and the bump are identical across both calls.
   - Prints `PublicKey.isOnCurve(...)` for the derived PDA (expected `false`) and, separately, for your own real wallet's public key, loaded from `~/.config/solana/id.json` (expected `true`).
   - Uses a small, reusable `loadLocalWalletPublicKey(): PublicKey` function to load the wallet file, reading only its `.publicKey`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (addresses/bump will differ based on your
       own wallet and the seed used, the RELATIONSHIPS will not):

           Seed: demo-seed
           Program ID: MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr

           First derivation:  9xJk2...  bump: 254
           Second derivation: 9xJk2...  bump: 254
           Identical both times: true

           Is the derived PDA a valid on-curve public key? false
           Your wallet address: 7xKXt...
           Is your own real wallet address on-curve? true

   2. Command: verify the invariants by hand.

       - "Identical both times" MUST read true — this is Concept 4's
           entire point, made directly observable: no randomness, no
           network state, nothing but the seeds and programId determine
           the result.

       - The PDA's on-curve check MUST read false, and your real
           wallet's MUST read true — this is the literal, checkable
           difference between "an address with no possible private key"
           and "an address that demonstrably has one."

   3. Command: apply How to Build Step 6 (change the seed string,
   re-run).

       Expected output: a completely different PDA and bump than Test 1,
       with the "on-curve" result still false — confirming the
       derivation is sensitive to the exact seed bytes (Week 2's
       avalanche-effect intuition, applied here), while the off-curve
       guarantee itself holds regardless of which seed you chose.

   4. Command: temporarily change `const seeds = [Buffer.from("demo-seed")];`
       to `const seeds = ["demo-seed"];` (a plain string instead of a
       Buffer, inside the array), then run npx tsc --noEmit.

       Expected output: a type error, reporting that a string isn't
       assignable to findProgramAddressSync's expected
       Array<Buffer | Uint8Array> seed type — confirming @solana/web3.js's
       own types catch this mistake before you'd ever see a confusing
       runtime error instead.

       Revert this change afterward.
   ```

2. **Medium - The Canonical Bump: Proving an Alternate Valid PDA Exists.**

   **What you practice:**
   - Building a per-user PDA (Concept 6) using your own real wallet's public key as a seed component, alongside a distinguishing string prefix
   - Using `createProgramAddressSync` (the non-searching form) to directly test specific bump values by hand, rather than letting `findProgramAddressSync` search for you
   - Directly proving Concept 5's security claim: a non-canonical bump can produce a _different_, still off-curve, still "valid" PDA for the exact same seeds

   **Requirements:**
   - Derives a canonical PDA and bump from the seeds `["user-profile", ownerPublicKey]`, where `ownerPublicKey` is loaded from `~/.config/solana/id.json`.
   - Starting from `canonicalBump - 1` and searching downward, calls `createProgramAddressSync` with each candidate bump appended to the same seeds, inside a `try`/`catch`, until it finds one that succeeds (lands off-curve) without throwing.
   - Prints that alternate PDA, and explicitly confirms (via `.equals()`) that it differs from the canonical PDA.
   - If no alternate is found by bump `0`, prints a message saying so rather than crashing.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your own addresses/bumps will differ):

           Owner (your real wallet): 7xKXt...
           Canonical PDA:  4mNpQ...
           Canonical bump: 253 (the highest bump that lands off-curve)

           Searching lower bumps for an alternate valid PDA...
           Bump 251 is ALSO valid (off-curve): 8pRst...
           Different from the canonical PDA: true

   2. Command: verify the invariant by hand.

       "Different from the canonical PDA" MUST read true — this is
       Concept 5's actual point: the alternate PDA is a real, off-curve,
       structurally valid address and it is NOT the same address a
       program computing the canonical bump would arrive at.

       Two genuinely different addresses, both technically "valid" for the
       same seeds, is exactly the ambiguity the canonical-bump rule
       exists to eliminate.

   3. Command: apply How to Build Step 6 (change the seed prefix to
   "vault"), then re-run npx tsx index.ts.

       Expected output: a completely different canonical PDA than Test 1,
       despite your wallet's pubkey (the second seed) being unchanged —
       confirming Concept 8's collision-avoidance claim directly: the
       prefix alone is enough to move to an entirely unrelated address
       space, even with every other seed held constant.

   4. Command: temporarily change `PublicKey.createProgramAddressSync(
       [...seeds, Buffer.from([bump])], MEMO_PROGRAM_ID)` to pass `bump`
       directly instead of `Buffer.from([bump])`, then run

           npx tsc --noEmit.

       Expected output: a type error, reporting that a plain number isn't
       assignable to the expected Buffer | Uint8Array seed element type —
       confirming the mistake of forgetting to wrap a raw bump number as
       bytes is caught before runtime, not after.

       Revert this change afterward.
   ```

3. **Hard - Multiple Account Types & Solana's Hard Seed Limits.**

   **What you practice:**
   - Writing a small, typed `derivePda` helper that accepts strings, `Buffer`s, and `PublicKey`s interchangeably as seeds, via a `SeedInput` union type
   - Deriving several different logical account types (a vault, a user profile, a counter) for the exact same owner, and confirming Concept 8's collision-avoidance claim directly, all three come out distinct
   - Deliberately violating Solana's 32-byte-per-seed limit, and observing exactly how (and whether) it's caught

   **Requirements:**
   - Defines a `type SeedInput = string | Buffer | PublicKey` and a `toSeedBuffer(seed: SeedInput): Buffer` converter function.
   - Defines a `derivePda(seeds: SeedInput[], programId: PublicKey): [PublicKey, number]` helper built on top of `toSeedBuffer` and `findProgramAddressSync`.
   - Using that helper, derives three PDAs, `["vault", owner]`, `["user-profile", owner]`, and `["counter", owner]`, all against the same `programId` and the same real wallet `owner` (loaded from `~/.config/solana/id.json`), and confirms all three addresses are pairwise distinct.
   - Deliberately calls `derivePda` with a single 33-byte seed (one byte over Solana's 32-byte-per-seed limit), inside a `try`/`catch`, and prints whichever outcome actually occurs.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your own addresses/bumps will differ):

           Owner (your real wallet): 7xKXt...

           Vault PDA:         4mNpQ...  bump: 254
           User-profile PDA:  9xJk2...  bump: 253
           Counter PDA:       2wYbZ...  bump: 255

           All three PDAs are pairwise distinct: true

           Testing the 32-byte-per-seed limit with a 33-byte seed...
           Correctly rejected: Max seed length exceeded

   2. Command: verify the invariants by hand.

       - "All three PDAs are pairwise distinct" MUST read true — same
           owner, same programId, three genuinely different addresses,
           purely because of the "vault" / "user-profile" / "counter"
           prefix strings. This is Concept 8's collision-avoidance pattern,
           proven rather than just described.

       - The 33-byte seed test should print "Correctly rejected" with
           some message referencing a seed length limit — @solana/web3.js
           enforces the 32-byte-per-seed rule locally, before any network
           call is even possible, since it's needed for the hashing itself.

   3. Command: apply How to Build Step 6 (add a fourth account type,
       "achievements", using the existing derivePda helper unchanged),
       then re-run npx tsx index.ts.

       Expected output: a fourth PDA printed, distinct from the other
       three — confirming derivePda generalizes to however many account
       types you actually need, with zero changes to the helper itself.

   4. Command: temporarily change `function toSeedBuffer(seed:
       SeedInput): Buffer` to `function toSeedBuffer(seed: SeedInput):
       number`, leaving its body's `return` statements unchanged, then

           run npx tsc --noEmit.

       Expected output: multiple type errors, one per return statement in
       toSeedBuffer, each reporting that a Buffer isn't assignable to
       number — confirming the helper's declared return type is actually
       checked against its own implementation, not just decorative.

       Revert this change afterward.
   ```
