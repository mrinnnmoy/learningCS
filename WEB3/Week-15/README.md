# List of things learned.

## 1. Anchor project structure. (next to Week 14's bare `cargo new`)

Week 14 built a native program from a plain `cargo new counter-program --lib`,

- one crate,
- one `lib.rs`,
- one `Cargo.toml`.

Anchor scaffolds an entire workspace instead:

```
anchor init counter-anchor
```

produces:

```
counter-anchor/
├── Anchor.toml          -- workspace config: cluster, wallet path, program IDs
├── programs/
│   └── counter-anchor/
│       ├── Cargo.toml
│       └── src/lib.rs    -- the actual program, same role as Week 14's lib.rs
├── tests/
│   └── counter-anchor.ts -- TypeScript tests, Concept 8
└── migrations/
    └── deploy.ts
```

One detail worth setting correctly before anything else:

- `Anchor.toml`'s `[provider]` section already defaults to `wallet = "~/.config/solana/id.json"`,

- the exact same local CLI wallet every assignment this course has used since Week 12.

This week's assignments only change `cluster` to `"devnet"` (Anchor defaults to `"localnet"`), nothing else about wallet handling needs touching at all.

---

## 2. The `#[program]` macro. (Week 14's entrypoint and dispatch, generated)

Week 14, Concept 1 built the entrypoint by hand, one `entrypoint!` call, one `process_instruction` function, one `match` routing to handlers (Week 14, Concept 4).

Anchor's `#[program]` attribute macro (Week 8, Concept 5's "attribute macros can rewrite the item they're attached to" preview, now literal) generates all of that from a plain-looking module:

```rust
#[program]
pub mod counter_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(CounterError::Overflow)?;
        Ok(())
    }
}
```

Every `pub fn` inside becomes one instruction.

There is no hand-written `entrypoint!`, no Borsh-decoded instruction enum (Week 14, Concept 2), no `match`, the function name and its position in the file **are** the routing.

`Result<()>` here is Anchor's own `Result` alias, layered over the same `ProgramResult`/`ProgramError` machinery Week 14, Concept 7 used directly.

---

## 3. `#[derive(Accounts)]` & Account constraints. (Week 14's manual checks, declared instead of written)

This is the single largest amount of boilerplate Anchor removes.

Every account validation Week 14, Concept 3 wrote by hand, signer checks, writable checks, owner checks, PDA re-derivation, becomes a **constraint** in a struct's field attributes:

```rust
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 8,
        seeds = [b"counter", payer.key().as_ref()],
        bump,
    )]
    pub counter: Account<'info, CounterAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Read this next to Week 14's `Initialize` handler:

- `init` replaces the manual `invoke_signed(&system_instruction::create_account(...))` call entirely,
- Anchor generates that CPI itself. `seeds = [...] , bump` replaces the manual `Pubkey::find_program_address` re-derivation and address-equality check,
- Anchor performs that check before your function body ever runs &
- rejects the transaction outright if it fails.

`Signer<'info>` replaces the manual `if !payer_account.is_signer` check, the _type itself_ only compiles into a valid struct if the runtime confirms that account actually signed.

One new detail with no Week 14 equivalent, `space = 8 + 8`.

Every Anchor `#[account]` type (Concept 4) is automatically prefixed with an **8-byte discriminator**, a hash-derived tag identifying the account's Rust type, so Anchor can refuse to deserialize the wrong kind of account into the wrong struct.

Week 14's raw `CounterAccount` had zero such prefix, just the bare `u64`, this is a genuinely new mechanism, not just hidden syntax for an old one.

---

## 4. Anchor's typed account wrappers.

- `Account<'info, T>`,
- `Signer<'info>`,
- `Program<'info, T>`,
- `SystemAccount<'info>`.

Each replaces a specific manual check from Week 14 with a type the Rust compiler itself can reason about:

```
Week 14 (Concept 3)                    Anchor (Concept 3-4)
------------------                     ---------------------
if !x.is_signer { return Err(...) }    x: Signer<'info>
if x.owner != program_id { ... }       x: Account<'info, CounterAccount>
raw AccountInfo, manually deserialized x: Account<'info, T>  (deserializes AND
                                          discriminator-checks automatically)
```

`#[account]` on `CounterAccount` itself (Concept 3's example) is a derive-like macro generating the Borsh serialize/deserialize implementations Week 14, Concept 5 wrote by calling `.serialize()`/`try_from_slice()` directly, plus that 8-byte discriminator handling.

---

## 5. Anchor IDL generation.

Running `anchor build` produces an **IDL** (Interface Description Language file, JSON), a complete, machine-readable description of every instruction, account type and error this program exposes, generated directly from the `#[program]` and `#[derive(Accounts)]` macros, with no separate step required.

This is what actually eliminates Week 14's manual client-side instruction encoding (`Buffer.writeUInt8`, `Buffer.writeBigUInt64LE`, hand-built `TransactionInstruction`):

- Anchor's TypeScript client reads the IDL and generates a fully-typed `program.methods.increment().accounts({...}).rpc()` call,
- the exact byte layout is handled entirely behind that call, not written by you at all.

---

## 6. Anchor error handling. (`#[error_code]`)

Week 14, Concept 7 relied on `ProgramError`'s small, fixed set of built-in variants (`InsufficientFunds`, `InvalidArgument`, and so on).

Anchor's `#[error_code]` (Week 8, Concept 6's Anchor preview, now real) generates named, numbered, custom errors directly from a plain enum:

```rust
#[error_code]
pub enum CounterError {
    #[msg("Counter overflowed")]
    Overflow,
}
```

Returned with `.ok_or(CounterError::Overflow)?`, exactly Week 14's `?`-propagation pattern, just against your own domain-specific error instead of a generic built-in one.

Anchor also surfaces this error's exact name and message back to the client automatically, in place of Week 14's opaque numeric error codes a client would otherwise have to look up by hand.

---

## 7. CPI with Anchor. (`CpiContext`, over the same `invoke`/`invoke_signed`)

Week 14, Concept 6 called `invoke` and `invoke_signed` directly.

Anchor wraps the exact same two functions in a typed struct:

```rust
let cpi_ctx = CpiContext::new_with_signer(
    system_program.to_account_info(),
    system_program::Transfer { from: vault.to_account_info(), to: depositor.to_account_info() },
    &[&[b"vault", depositor.key().as_ref(), &[bump]]],
);
system_program::transfer(cpi_ctx, amount)?;
```

Worth being direct about this one:

- `CpiContext` is not a different mechanism,
- it is `invoke_signed` underneath,
- with the accounts list and
- signer seeds bundled into one typed value instead of passed as separate positional arguments.

Having built Week 14's vault program with raw `invoke_signed` first is exactly what makes this recognizable as sugar, rather than a second thing to learn from scratch.

---

## 8. Anchor's testing framework. (And a third tier between Week 14's two)

Week 14, Concept 9 drew one line:

- `solana-program-test`'s in-process `BanksClient` (fast, no real cluster) versus actually deploying to devnet (slow, costs real SOL).

Anchor's own test flow, `anchor test`, running TypeScript against the IDL-generated client (Concept 5), sits at a **third** point on that spectrum:

- by default it spins up a genuinely separate,
- disposable **local validator** (`solana-test-validator`),
- a real, full Solana runtime,
- just running entirely on your own machine,
- auto-funding your configured wallet with local-only SOL that has no relationship whatsoever to real devnet SOL.

Slower than Week 14's in-process `BanksClient`, since it's a real (if local) validator process, but faster and free compared to devnet and closer to production fidelity than pure in-process simulation.

This week's Medium assignment uses exactly this tier.

---

## 9. Trade-offs. (Anchor vs. native & when each actually makes sense)

Neither approach is simply _"better,"_ each trades specific things for others:

```
                            Native (Week 14)                    Anchor (this week)
Boilerplate             Every check, by hand                Constraints generate checks

Safety default          Only as safe as you wrote it        Whole classes of Week 14's
                                                            mistakes are structurally
                                                            harder to make by accident

Binary size / CU        Minimal, exactly what you           Slightly larger, constraint
                        wrote                               checks cost real compute

Low-level control       Full                                Reduced, some CPI/account
                                                            shapes are awkward to
                                                            express outside Anchor's
                                                            own conventions

Client integration      Manual instruction encoding         IDL-generated, typed,
                        (Week 14)                           automatic

Learning value          Forces understanding the real       Can be used productively
                        mechanism (this whole course's      without ever seeing the
                        reason for teaching Week 14         mechanism underneath
                        first)
```

_In practice:_

Most production Solana programs today use Anchor, the safety defaults and development speed are hard to argue with for the large majority of use cases.

Native is chosen deliberately when compute-unit budget is extremely tight, when a program's account shapes genuinely don't fit Anchor's conventions well, or, as this course has done, specifically to learn the real mechanism before automating it away.

Neither choice is a referendum on skill, they're a tradeoff, made explicitly, the same way Week 7's trait objects vs. generics or Week 9's `Box<dyn Trait>` vs. `impl Trait` were tradeoffs, not right-vs-wrong answers.

---

## Assignment.

1. **Easy - The Counter Program, Rebuilt in Anchor.**

   **What you practice:**
   - Scaffolding and structuring an Anchor workspace, and setting `Anchor.toml`'s `cluster` to `devnet` while leaving `wallet` at its already-correct default
   - Expressing Week 14's exact manual account validation (signer, PDA re-derivation, account creation via CPI) as declarative constraints instead
   - Using Anchor's IDL-generated TypeScript client (`program.methods...rpc()`, `program.account...fetch()`) in place of Week 14's hand-built instructions and manual Borsh decoding

   **Requirements:**
   - A `CounterAccount { count: u64 }` type (via `#[account]`) and two instructions, `initialize` and `increment`, inside a `#[program]` module.
   - `Initialize`'s `Accounts` struct uses `init`, `payer`, `space` (accounting for the 8-byte discriminator, Concept 3), and `seeds`/`bump` constraints to create the same `["counter", payer_pubkey]` PDA Week 14 used.
   - `increment` uses `checked_add`, returning a custom `CounterError::Overflow` (via `#[error_code]`) on failure, never a raw `+= 1`.
   - A TypeScript client loads your local wallet, derives the PDA client-side (still done manually, Anchor's IDL doesn't remove this part), and calls `initialize` then `increment` through the generated `program.methods` client, printing the decoded count after each.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts (first run)

       Expected output shape:
           Payer: 7xKXt...
           Counter PDA: 4mNpQ...

           Initialized. Signature: 5f3G...
           Count: 0

           Incremented. Signature: 2kLp...
           Count: 1

   2. Command: verify by hand.

       Count reads 0 then 1, exactly Week 14's result — confirming the
       Anchor version and the raw version are computing the SAME thing,
       just via different amounts of your own code (Concept 9).

   3. Command: re-run npx tsx index.ts a second time, unchanged.

       Expected output: "Counter already initialized, skipping
       Initialize.", Count: 1, then a successful Increment to Count: 2 —
       same persistence behavior Week 14's Easy assignment confirmed.

   4. Command: temporarily change `space = 8 + 8` to `space = 8` (only
       the discriminator, no room for the u64 at all), delete the
       already-deployed counter PDA's on-chain data isn't possible from
       here, so instead: apply this change, run anchor build, then
       attempt a fresh Initialize against a DIFFERENT wallet's PDA (or
       revert and skip live testing this one).

       Expected outcome: this is a genuine account-sizing mistake — with
       too little space allocated, Initialize would fail on-chain with a
       serialization/space error the moment it tried to write a full
       CounterAccount into an undersized account. The purpose of this
       test case is recognizing that `space` is exactly as easy to get
       wrong in Anchor as a raw COUNTER_SPACE constant was in Week 14,
       the macro doesn't compute it FOR you, it just gives you a place to
       state it.

       Revert this change afterward.
   ```

2. **Medium - Testing the Anchor Counter with `anchor test`.**

   **What you practice:**
   - Writing a TypeScript test against Anchor's IDL-generated client, using `anchor.workspace` and Mocha/Chai, Concept 8's third testing tier
   - Running `anchor test`, which spins up its own disposable local validator automatically, funding your configured wallet with **local-only** SOL that has no relationship to devnet
   - Comparing this tier directly against Week 14 Medium's `solana-program-test` (fully in-process, Rust-only) and Easy's live-devnet deployment, all three now experienced first-hand

   **Requirements:**
   - Extends Easy's existing `counter-anchor` project (this assignment adds to that workspace, it isn't a separate one, exactly the relationship Week 14's Medium had to Week 14's Easy).
   - A `tests/counter-anchor.ts` file uses `anchor.workspace.CounterAnchor` to get a typed `Program` handle, without loading any IDL file by hand.
   - The test calls `initialize`, asserts the fetched `count` is `0`, calls `increment`, asserts the fetched `count` is `1`, in one `it(...)` block.
   - The test runs via `anchor test` with no manual `solana-test-validator` setup, and without ever touching devnet.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: anchor test

       Expected output: a local validator starts, the program deploys to
       it, then:
           counter-anchor
           ✓ initializes and increments the counter (...ms)

           1 passing

   2. Command: verify by hand.

       Both assert.equal calls passing confirms the SAME program logic
       Easy deployed to real devnet also behaves correctly here, against
       a fresh local validator instead — the identical .so binary, not a
       reimplementation, exactly Week 14 Medium's point, one tier over.

   3. Command: temporarily change the program's increment logic in
       programs/counter-anchor/src/lib.rs from checked_add(1) to a
       hardcoded `counter.count = 5;`, then re-run anchor test (this
       rebuilds and redeploys to the fresh local validator automatically).

       Expected output: 1 failing, with chai's assertion error reporting
       count was 5, not the expected 1 — confirming this test suite
       genuinely catches a real logic error. Revert this change
       afterward.

   4. Command: temporarily rename accounts({ counter: counterPda, payer })
       in the initialize call to accounts({ counter: counterPda }) (omit
       payer entirely), then re-run anchor test.

       Expected output: a TypeScript compile error (this test file is
       itself type-checked against the IDL-derived types before anchor
       test ever runs it), reporting that the accounts object is missing
       the required payer property — confirming the IDL's typed client
       (Concept 5) catches a missing-account mistake at compile time,
       something Week 14's manually-built TransactionInstruction objects
       had no equivalent protection against at all.

       Revert this change afterward.
   ```

3. **Hard - The Vault Program in Anchor: `CpiContext` & a Direct Boilerplate Comparison.**

   **What you practice:**
   - Rebuilding Week 14 Hard's PDA-owned SOL vault (`Deposit`/`Withdraw`, `invoke`/`invoke_signed`) using Anchor's `CpiContext` and account constraints, Concept 7 made concrete
   - Returning a custom `#[error_code]` variant for the exact same insufficient-funds case Week 14 handled with a built-in `ProgramError`
   - Directly counting and comparing how much of Week 14's hand-written validation and CPI plumbing simply disappears, turning Concept 9's trade-off table into something you measured yourself

   **Requirements:**
   - A `VaultInstruction`-equivalent pair of instructions, `deposit(amount: u64)` and `withdraw(amount: u64)`, inside `#[program]`.
   - Both instructions' `Accounts` structs use `seeds = [b"vault", depositor.key().as_ref()], bump` constraints on the vault PDA, exactly Week 14's seed layout, so the two programs' PDAs are derived identically.
   - `withdraw` checks the vault's lamport balance before transferring, returning a custom `VaultError::InsufficientVaultFunds` (via `#[error_code]`) if the requested amount exceeds it, mirroring Week 14's `ProgramError::InsufficientFunds` check exactly.
   - `withdraw`'s actual transfer uses `CpiContext::new_with_signer(...)` with the vault's seeds, calling the System Program's transfer, Concept 7's pattern, not a manual `invoke_signed` call.
   - A TypeScript client loads your local wallet, derives the vault PDA, deposits a small amount, prints the balance, withdraws half back, and prints the updated balance, structurally identical to Week 14 Hard's client.
   - A short written comparison (a `COMPARISON.md` file, or a comment block at the top of `lib.rs`) listing every manual check or CPI call Week 14's raw `vault-program` needed that this Anchor version does **not** write explicitly.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Depositor: 7xKXt...
           Vault PDA: 9pLmQ...

           Deposited. Signature: 4hRt...
           Vault balance: 2000000 lamports

           Withdrew. Signature: 8kNw...
           Vault balance: 1000000 lamports

   2. Command: verify by hand.

       Identical numbers to Week 14 Hard's Test 2 — same amounts moved,
       same fee behaviour — confirming CpiContext really is invoke/
       invoke_signed underneath, not a different transfer mechanism with
       different rounding or fee handling.

   3. Command: temporarily change withdrawAmount from new BN(1_000_000)
       to new BN(50_000_000) (far more than the vault holds), then re-run

           npx tsx index.ts.

       Expected output: deposit succeeds as before, withdraw fails,
       surfacing VaultError::InsufficientVaultFunds by name (Concept 6),
       a readable custom error message rather than Week 14's generic
       numeric ProgramError::InsufficientFunds code. Revert this change
       afterward.

   4. Command: verify COMPARISON.md (How to Build Step 9) by hand
       against Week 14's actual vault-program/src/lib.rs.

       Expected outcome: every item you listed should correspond to a
       REAL block of code that exists in Week 14's file and has no
       equivalent block in this week's lib.rs — if an item on your list
       doesn't map to an actual removed block, Concept 9's trade-off
       table is more abstract than it needs to be; go find the specific
       lines Week 14 wrote for each item and confirm they're genuinely
       absent here.
   ```
