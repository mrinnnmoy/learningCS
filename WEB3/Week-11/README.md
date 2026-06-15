# List of things learned.

## 1. The Account model. (Everything is an account)

> Week 10's Cloudbreak (Concept 7) named where Solana's state physically lives, this week is about what actually sits inside it.

Solana's entire on-chain world,

- wallets,
- deployed programs,
- token balances,
- NFT metadata,
- staking positions,

is represented as one single, uniform data structure i.e., the **account**.

There's no separate concept of _"contract storage"_ living apart from _"wallet balances"_ the way Ethereum splits them (Week 26 covers Ethereum's account model directly and the contrast will be sharper once you've seen this one first).

```
    Ethereum (Week 26 preview):                 Solana (this week):
  EOA accounts (just balance)               ONE account type for everything —
  Contract accounts (code+storage)          wallets, programs, token balances,
  -- two different kinds                    NFT metadata, all the same shape
```

Every account, no matter what it's _"for,"_ has exactly the same handful of fields. Concept 2 is that structure, in full.

---

## 2. Anatomy of an Account. (`lamports`, `data`, `owner`, `executable`, `rent_epoch`)

Every Solana account carries precisely these fields, nothing more:

- **`lamports`** : The account's SOL balance, denominated in the smallest unit (1 SOL = 1,000,000,000 lamports, Week 10, Concept 8).

  Every account, even a program's own account, holds a lamport balance.

- **`data`** : A raw byte buffer, the account's actual content. For a wallet, this is typically empty.

  For a token account, it's Borsh-encoded balance/mint info (Week 5).
  For a deployed program, it's compiled BPF bytecode.

- **`owner`** : A program ID (Concept 3, next, gets this one in full).

- **`executable`** : A boolean.

  `true` means this account's `data` is loadable, runnable program bytecode;
  `false` means it's just data.

- **`rent_epoch`** : A legacy field from Solana's earlier periodic-rent-collection design.

  Modern accounts are almost universally rent-exempt (Concept 7) from creation, so in practice this field rarely does anything today, it's kept for backward compatibility.

```typescript
interface AccountInfo {
  lamports: number;
  data: Buffer;
  owner: PublicKey;
  executable: boolean;
  rentEpoch: number;
}
```

> This week's Easy assignment fetches this exact structure for three very different real accounts, a wallet, a native program and a deployed BPF program and the differences in these five fields are the entire lesson.

---

## 3. The `owner` field. (Program-owned vs. User-owned accounts)

This is the single most misleading piece of vocabulary in all of Solana and worth getting exactly right before anything else this week.

**`owner` does not mean "who controls this account" in the everyday sense.** It means, precisely, "which program is allowed to modify this account's `data`."

`owner` is always a **program ID**, never a person's wallet address.

The runtime enforces one absolute rule, only the program named in an account's `owner` field is permitted to write to that account's `data` or deduct its lamports below what it started a transaction with.

Every other program, even one you wrote yourself, is only allowed to _read_ an account it doesn't own.

```
Wallet account            owner: System Program        (Concept 4)
Token balance account     owner: SPL Token Program      (Week 17)
NFT metadata account      owner: Metaplex's program     (Week 21)
A program you deploy      owner: a BPF Loader program    (Week 14)
```

Notice none of these say _"owned by Alice"_ or _"owned by your wallet,"_ even for a token account that represents _your_ balance.

Your wallet doesn't own that account in the `owner`-field sense at all, the Token Program does, because the Token Program is the only code allowed to actually change the numbers inside it.

So what actually stops a stranger from telling the Token Program to move your tokens?

That's Concept 5 and it's a completely different mechanism from this one.

---

## 4. System Accounts & The System Program.

Week 4 built wallets, key pairs and addresses from first principles.

On-chain, every plain wallet address you generated is, structurally, just an ordinary account:

- `executable: false`,
- `data` typically empty and
- `owner` set to the **System Program**

(Solana's own built-in, native program, at a fixed, well-known address).

The System Program is what actually does the boring, load-bearing work every other program eventually depends on:

- **Creating new accounts** (allocating space, assigning an owner, Week 14's programs call this constantly when setting up their own accounts)

- **Transferring lamports** between accounts (Week 10's Hard assignment used exactly this, `SystemProgram.transfer`)

- **Assigning a different owner** to an account it currently owns (this is how a brand-new account gets handed off to your own program, Week 14)

A "system account" just means, an account still owned by the System Program, nothing more has been done to it yet.

---

## 5. Authority. (The human-facing permission concept `owner` deliberately isn't)

> Concept 3 left a real question hanging.

If the Token Program owns every token account and only the owner can write to it, what stops anyone from asking the Token Program to move _your_ tokens?

The answer is **authority** and it's worth being precise about exactly what kind of concept this is.

- **`owner` is a runtime-enforced field, checked automatically by the protocol itself.**

- **`authority` is not a special account field at all, it's a convention, a specific pubkey stored inside an account's `data`, that a program's own logic chooses to check before allowing an action.**

```
owner:      "which PROGRAM may write this account's data"       -- enforced by the RUNTIME, always
authority:  "which PUBKEY this program's own logic will         -- enforced by the PROGRAM's
             accept as permission to do something"                  own code, by convention
```

You'll meet several named authorities directly once Week 17 covers SPL tokens in full:

- **Mint authority** : The pubkey allowed to mint new tokens of a given type.

- **Freeze authority** : The pubkey allowed to freeze a specific token account, blocking transfers.

- **Update authority** : Common on NFT metadata accounts (Week 21), the pubkey allowed to modify the metadata after creation.

None of these are protocol-level fields the way `owner` is.

They're just pubkeys sitting inside an account's `data`, that the Token Program (or Metaplex's program) reads and compares against whoever _signed_ the current transaction (Concept 6, next), before deciding whether to proceed.

Swap out which pubkey is stored as an _"authority"_ and you've changed who can do that action, entirely within a program's own logic, no protocol-level permission ever moves.

---

## 6. Signer vs. Writable. (The two flags on every account reference)

Every account a transaction touches is referenced with two independent boolean flags and Week 10's Sealevel (Concept 2) already explained _why_ these need to be declared upfront.

The runtime uses exactly this writable/read-only information to schedule non-conflicting transactions in parallel.

- **`is_signer`** : This account's owner cryptographically signed the transaction (Week 3's digital signatures), proving authorization.

- **`is_writable`** : This transaction is allowed to modify this account's `data` or lamports.

These two flags are independent, all four combinations are legal and meaningful:

```
signer=true,  writable=true     -- typical fee payer: authorizes AND changes (loses lamports to fees)
signer=true,  writable=false    -- proves identity/authorization, but nothing about it changes
signer=false, writable=true     -- gets modified, but never had to prove anything itself
                                  (this is exactly Concept 5's point: a program checks the
                                   AUTHORITY stored inside such an account's data, separately,
                                   rather than requiring that account itself to sign)
signer=false, writable=false    -- read-only reference; the program only reads from it
```

> This week's Medium assignment inspects a real, compiled transaction and prints exactly which of these four categories each of its accounts falls into.

---

## 7. Rent, Rent-exemption & Account size limits.

> Week 10, Concept 8 introduced rent and rent-exemption briefly, on the way to explaining fees.

Here's the fuller picture.

Every account must hold a minimum lamport balance, proportional to how many bytes of `data` it occupies, to remain **rent-exempt**, permanently exempt from the (largely legacy today) periodic rent collection Concept 2's `rent_epoch` field is a holdover from.

That minimum is a deterministic formula based purely on byte count, which is exactly why Week 10's Hard assignment could read it directly via `getMinimumBalanceForRentExemption` and get a stable, reproducible number back.

There's also a hard ceiling, Solana enforces a **maximum account size of 10 MiB** (10,485,760 bytes) per account, a protocol-level constant, not something any RPC call returns, since it's compiled directly into the runtime itself.

Combined, these two facts explain a design pattern you'll see constantly from Week 14 onward:

- programs are deliberately economical about what they store per account,

- both because more bytes costs more rent-exempt SOL upfront and

- because there's a real, fixed ceiling on how large any single account can ever grow.

---

## 8. Sysvars & A first look at Cross-Program invocation.

Two last pieces of vocabulary, both of which get their own full treatment soon, worth naming now:

- **Sysvar accounts** are special, read-only accounts living at fixed, well-known addresses, that expose live runtime information, the current slot, the cluster's clock, the rent formula's parameters, as ordinary account data a program can read.

  The `Clock` sysvar, for instance, exposes Week 10's Proof of History-derived time (Concept 3) as literal bytes any program can read directly.

  Interestingly, sysvars predate Borsh (Week 5) as a data-format convention, they use a fixed-offset, raw binary layout instead, this week's Hard assignment decodes one by hand, offset by offset, specifically to make that contrast concrete.

- **Cross-program invocation (CPI)** is what makes Concept 3's ownership rule actually usable in practice.

  Since only the _owning_ program can modify an account's data, the only way for _your_ program to, say, move tokens on a user's behalf, is to call directly into the Token Program's own instruction, from within your program's code and let the Token Program do the actual write (since it's the one that owns that account).

  This is precisely how nearly every real Solana program composes with others, rather than reimplementing token transfers itself.

  Full CPI mechanics, actually writing one, arrive in **Week 14**; this week is purely about recognizing why the ownership model (Concept 3) makes CPI necessary in the first place, rather than optional.

---

## Assignment.

1. **Easy - Account Anatomy: Wallets, Native Programs & Deployed Programs.**

   **What you practice:**
   - Fetching a real account's full structure (`lamports`, `owner`, `executable`, `data.length`) via `getAccountInfo`, and reading TypeScript's own `AccountInfo<Buffer> | null` return type directly
   - Directly observing the difference in shape between a plain wallet (system account), a native program, and a real deployed BPF program, purely by comparing their `owner` and `executable` fields
   - Confirming, first-hand, that `owner` is always a program ID, never a person's address, even for an account that represents something as personal as your own wallet

   **Requirements:**
   - Generates a fresh `Keypair`, airdrops it 1 devnet SOL, confirms the airdrop (using the object-based confirmation strategy from Week 10), and prints its account info.
   - Fetches and prints the System Program's own account info, via `SystemProgram.programId` (never a hand-typed address string).
   - Fetches and prints the SPL Token Program's account info, via its well-known address `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.
   - A single reusable `describeAccount` function handles the fetch-and-print logic for all three, typed to accept a `label: string` and an `address: PublicKey`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (exact lamports/addresses will differ, but
       the RELATIONSHIPS between the three should not):

           Freshly airdropped wallet (7xKXt...)
               Lamports:   1000000000
               Owner:      11111111111111111111111111111111
               Executable: false
               Data length: 0 bytes

               System Program (11111111111111111111111111111111)
               Lamports:   1
               Owner:      NativeLoader1111111111111111111111111111111
               Executable: true
               Data length: 14 bytes

               SPL Token Program (TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA)
               Lamports:   1141440
               Owner:      BPFLoaderUpgradeab1e11111111111111111111111
               Executable: true
               Data length: 36 bytes

   2. Command: verify the invariants by hand.

       - The wallet's Owner should read exactly
           11111111111111111111111111111111, the System Program's own
           address — confirming Concept 4's claim directly: a plain wallet
           really is just an account owned by the System Program, nothing
           more.

       - The wallet's Executable must be false. Both program accounts'
           Executable must be true — this is the field that actually
           distinguishes "runnable code" from "plain data," regardless of
           what owns either account.

       - The System Program's Owner should show a loader-type address
           (something starting with NativeLoader or BPFLoader), NEVER a
           regular wallet-looking address — reinforcing Concept 3's core
           point, owner is always a program-category identifier, never a
           person.

       - Note the wallet's Owner and the System Program's OWN address are
           identical strings, while the System Program's Owner field is a
           completely different address — this is the exact distinction
           between "being owned by the System Program" and "being the
           System Program."

   3. Command: apply How to Build Step 6 (print the airdropped wallet
       twice instead of the Token Program), then re-run npx tsx index.ts.

       Expected output: the second and third printouts should be
       byte-for-byte identical (same lamports, owner, executable, data
       length) — confirming describeAccount is a pure function of
       whatever address you pass it, with no hidden state carried over
       between calls.

   4. Command: temporarily change describeAccount's label parameter
       type from `label: string` to `label: number`, then run

           npx tsc --noEmit.

       Expected output: a type error, at every call site that passes a
       string literal like "System Program" where describeAccount now
       expects a number — confirming the function's signature is actually
       being checked against its three call sites, not just written and
       ignored.

       Revert this change afterward.
   ```

2. **Medium - Signer & Writable Flags on a Real Transaction.**

   **What you practice:**
   - Compiling a real transaction message and reading its account metadata programmatically, via `MessageV0`'s own `isAccountSigner` / `isAccountWritable` methods, rather than manually decoding the message header by hand
   - Directly observing that a single transaction's accounts fall into genuinely different signer/writable categories, not just "signer" vs. "everything else"
   - Connecting Concept 6's four-way signer/writable matrix to Week 10's Sealevel explanation of _why_ the runtime needs this information declared upfront

   **Requirements:**
   - Airdrops and confirms devnet SOL to a fresh `payer` `Keypair` (reusing Week 10's confirmation pattern).
   - Builds a `SystemProgram.transfer` instruction from `payer` to a second, freshly generated `receiver` `Keypair`, and compiles it into a `v0` message.
   - Iterates every account in `message.staticAccountKeys`, and for each one prints its index, its base58 address, its `isAccountSigner` result, its `isAccountWritable` result, and a short plain-English label describing which of Concept 6's four categories it falls into.
   - The categorization logic (signer+writable, writable-only, signer-only, neither) is implemented as its own typed function, not inlined repeatedly.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (addresses will differ, roles will not):

           Accounts referenced by this transaction:

           [0] 7xKXt...   (payer's address)
                   signer=true  writable=true  -> signer + writable  (typical fee payer: authorizes AND changes)
           [1] 9pLmQ...   (receiver's address)
                   signer=false  writable=true  -> writable only      (gets modified, never had to prove anything itself)
           [2] 11111111111111111111111111111111
                   signer=false  writable=false  -> read-only          (just referenced, neither authorizes nor changes)

   2. Command: verify the invariants by hand.

       - Index 0 must always be the fee payer, with signer=true and
           writable=true — the runtime requires the fee payer to both
           authorize the transaction and be debited for the fee, matching
           Concept 6's first category exactly.

       - The receiver should show signer=false, writable=true — it never
           signed anything, but its lamport balance is about to increase,
           matching Concept 6's third category (a program, here the System
           Program, is free to credit an account that never had to prove
           anything about itself).

       - The System Program's own address should show signer=false,
           writable=false — it's only referenced so the runtime knows
           which program to hand the instruction to, its own account never
           changes as a result.

   3. Command: apply How to Build Step 6 (add a second transfer
       instruction to a third, freshly generated Keypair), then re-run

           npx tsx index.ts.

       Expected output: a fourth account entry appears in the list
       (the new recipient), correctly shown as signer=false,
       writable=true, with zero changes made to the categorize function
       — confirming it generalizes to however many accounts a message
       actually contains, rather than being hardcoded to three.

   4. Command: temporarily change `function categorize(isSigner: boolean,
       isWritable: boolean): string` to return `number` instead of
       `string` (i.e. change the return type only, leaving every `return`
       statement as-is), then run npx tsc --noEmit.

       Expected output: multiple type errors, one per `return` statement
       inside categorize, each reporting that a string literal isn't
       assignable to number — confirming the function's declared return
       type is actually enforced against its own body, not just decorative.

       Revert this change afterward.
   ```

3. **Hard - Decoding the Clock Sysvar & Pricing Rent Across Account Sizes.**

   **What you practice:**
   - Reading a sysvar account's raw bytes directly with `Buffer`'s fixed-offset methods (`readBigUInt64LE`, `readBigInt64LE`), rather than through any serialization library, and understanding why sysvars use this older, schema-less layout instead of Borsh (Week 5)
   - Cross-checking the on-chain `Clock` sysvar's `unix_timestamp` against your own machine's local clock, to confirm it's genuinely live data, not a cached or placeholder value
   - Pricing rent-exemption across a full range of account sizes, from empty up through the protocol's documented 10 MiB maximum, and confirming the cost scales as Concept 7 describes

   **Requirements:**
   - Defines a `ClockSysvar` interface (`slot`, `epochStartTimestamp`, `epoch`, `leaderScheduleEpoch`, `unixTimestamp`, all `bigint`) and a `decodeClockSysvar(data: Buffer): ClockSysvar` function that reads all five fields at their fixed byte offsets.
   - Fetches the real `Clock` sysvar account (`SysvarC1ock11111111111111111111111111111111`), decodes it with that function, and prints every field.
   - Compares the decoded `unixTimestamp` against the local machine's current unix timestamp, printing the absolute difference in seconds.
   - Defines `MAX_ACCOUNT_SIZE_BYTES` as the documented protocol constant `10_485_760`, and prints the rent-exemption minimum for at least five sizes, `0`, `165`, `1_000`, `10_000`, and `MAX_ACCOUNT_SIZE_BYTES` itself.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape (your actual numbers will differ, but see
       Test 2 for which specific figures should stay close to these):

           Clock sysvar, decoded directly from raw account bytes:
           Slot: 281000123
           Epoch: 650
           Leader schedule epoch: 651
           Unix timestamp (on-chain): 1732000000
           Local machine's unix timestamp: 1732000001
           Drift between on-chain clock and local clock: 1 seconds

           Rent-exemption cost by account size:
           0 bytes: 890880 lamports
           165 bytes: 2039280 lamports
           1000 bytes: 8952240 lamports (illustrative — verify it's
               proportionally larger than the 165-byte figure, not this
               exact number)
           10000 bytes: 73180800 lamports (illustrative)
           10485760 bytes (protocol max): 76472160240 lamports (illustrative)

   2. Command: verify the invariants by hand.

       - Slot and Epoch should roughly match whatever Week 10's
           assignments printed, if run around the same time — same live
           cluster state, same underlying numbers.

       - Drift between on-chain and local clock should typically be under
           30 seconds. A larger drift usually means your own machine's
           system clock is off, not that anything in the script is wrong.

       - Each successive rent-exemption figure in the list MUST be
           strictly larger than the one before it — 0 < 165 < 1,000 <
           10,000 < 10,485,760 bytes, and the lamport costs should increase
           in that same strict order, confirming Concept 7's "proportional
           to size" claim held across the entire range, not just the two
           sizes Week 10 originally checked.

   3. Command: apply How to Build Step 6 (add 5_000_000 to
       sizesToCheck), then re-run npx tsx index.ts.

       Expected output: a sixth line, sitting between the 10,000-byte and
       10,485,760-byte figures, roughly proportional to its size relative
       to those two — confirming the rent formula is a smooth, continuous
       function of byte count, not a set of fixed tiers.

   4. Command: temporarily change `data.readBigUInt64LE(0)` to
       `data.readBigUInt64LE("0")` (a string instead of a number), then

           run npx tsc --noEmit.

       Expected output: a type error, reporting that a string argument
       isn't assignable to Buffer.readBigUInt64LE's expected number
       parameter — Node's own bundled Buffer types (via @types/node) are
       what catch this, the exact same category of benefit Week 10's
       Assignment intro described for @solana/web3.js's own types.

       Revert this change afterward.
   ```
