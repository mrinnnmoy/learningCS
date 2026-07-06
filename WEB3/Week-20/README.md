# List of things learned.

## 1. Common Solana vulnerabilities.

The mental model this whole week rests on, once an instruction reaches your program, **the attacker fully controls both the instruction data and the entire account list** passed alongside it.

Anchor's constraint system (Week 15, Concept 3's `#[derive(Accounts)]`, Concept 9's safety defaults) only protects what you actually _declare_ — a field typed `Signer<'info>` or `Account<'info, T>` gets real, automatic checks.

A field typed `UncheckedAccount<'info>` or a raw `AccountInfo` (Week 14's native style) gets none at all, by design, since Anchor has no way to know what you intended to check.

Every vulnerability class this week is really one instance of the same root cause, a real constraint the program logic _implicitly_ depends on, that was never made _explicit_ to Anchor, or was never checked manually in native code.

---

## 2. Missing signer checks.

Week 11, Concept 7 named the distinction directly.

**signer vs. writable**, a transaction's signature proves the holder of a specific private key authorized this transaction, nothing more or less.

An instruction that performs a privileged action (withdrawing funds, changing an admin field) _must_ verify the relevant party actually signed, not merely that their pubkey was _listed_ as an account.

Anchor's `Signer<'info>` type performs this check automatically the moment the account is deserialized into that field; native Week 14-style code has to check `account.is_signer` by hand and forgetting it is a completely silent failure; the instruction still runs, using whatever pubkey the attacker supplied, unsigned.

---

## 3. Missing owner checks.

A different field of Week 11, Concept 2's account anatomy.

The **owner field**, which program is allowed to write to an account's data.

Anchor's `Account<'info, T>` wrapper checks two things on deserialization: that the account's `owner` field equals the current program's ID, and (Week 15, Concept 4) that its leading 8-byte discriminator matches type `T`.

Skip both, by typing a field as `UncheckedAccount` or `AccountInfo` and deserializing its raw bytes manually (Week 14's `try_from_slice` pattern) and an attacker can hand your program an account they themselves control, with data shaped to look plausible and your program will trust it completely.

---

## 4. Account substitution attacks.

A narrower, easy-to-miss cousin of Concept 3.

Swapping in a _different account of the exact same type and owner_ than the one the program's logic actually intended.

A `TokenAccount` passed as a "vault" might genuinely be owned by the Token Program (passing Concept 3's check cleanly) while belonging to the _wrong mint_, or the _wrong authority_, entirely undetected unless the program explicitly constrains that relationship.

This is exactly what Anchor's `token::mint = X` and `token::authority = Y` constraints (used without comment since Week 17, Week 19) exist to close, they aren't just convenience syntax, they're the actual fix for this specific attack class.

---

## 5. PDA seed collisions.

Week 13, Concept 6's collision-avoidance note, made concrete.

If a PDA's seeds don't uniquely identify what they're meant to represent, two logically distinct entities resolve to the _same_ on-chain address.

Week 19's `StakePosition` seeds, `["position", staker_pubkey]`, were correct specifically because they included the staker's own key.

A program that instead seeded a per-user account with something global, or omitted the user's key entirely, would have every user collide onto one shared account, silently overwriting each other's state, no error, no warning, just wrong behavior.

---

## 6. Integer overflow/underflow.

Rust's own semantics (Week 6, Concept 2's basic types) have a sharp edge here.

In a `--release` build, arithmetic overflow **wraps silently** by default rather than panicking and Solana's on-chain programs are always compiled in release mode.

Anchor's generated workspace `Cargo.toml` sets `overflow-checks = true` under `[profile.release]` specifically to turn this back into a hard runtime error instead of silent wraparound, but that's a project-level default, not a language guarantee, and it's worth never depending on it alone.

`checked_add`, `checked_sub`, and `checked_mul` (Week 19's reward-math pattern, `Option<T>` returned per Week 6, Concept 5) make the overflow check explicit and _portable_ to any build configuration, which is the actually-safe habit.

---

## 7. Re-initialization attacks.

Anchor's `init` constraint (used in every stateful account since Week 14, Week 19) already refuses to run twice against the same address, the exact _"account already in use"_ error this course's own Week 19 changelog hit directly when a script re-ran against an already-initialized vault.

The real risk lives in `init_if_needed`, an opt-in Anchor feature that silently _skips_ creation on a second call rather than erroring, if the instruction's own body doesn't separately guard against _"this account was already set up,"_ an attacker (or just a careless second call) can re-run initialization logic mid-lifecycle and reset fields a program's later logic assumed were immutable after first setup.

---

## 8. Arbitrary CPI vulnerabilities.

Every CPI this course has written (Week 14, Concept 7's `invoke`/`invoke_signed`, Week 15's `CpiContext`) ultimately trusts whatever program account it's handed to actually _be_ the program it claims to be.

Anchor's typed `Program<'info, Token>` (used since Week 15) validates this: the account's own pubkey is checked against `Token::id()` before the instruction body ever runs.

A field instead typed `UncheckedAccount<'info>` for what's meant to be "the token program" gets no such check, an attacker can substitute _any_ deployed program's address there and if that substitute program implements a matching instruction discriminator, your program will happily CPI into it, fully believing it's talking to the real Token Program.

---

## 9. Type confusion.

Related to Concept 3, but specifically about _deserialization_.

Anchor's 8-byte discriminator (Week 15, Concept 4) exists so that account type `A`'s bytes can never be successfully parsed as account type `B`, even if both happen to share a similar layout.

This protection is automatic for any field typed `Account<'info, T>`; it evaporates completely the moment code manually calls `try_from_slice` or reads raw bytes at fixed offsets (Week 14's native pattern) without checking a discriminator first, an attacker can then craft bytes that are valid as _some_ type, positioned so that misreading them as a _different_ type produces attacker-favorable field values.

---

## 10. Rent-exemption bypass issues.

Week 11, Concept 8's rent-exemption threshold isn't just an economic detail, it's a _liveness_ guarantee.

An account below the threshold is subject to garbage collection by the runtime.

A program that lets an account's lamport balance drop below that threshold mid-lifecycle (draining a PDA-owned vault via CPI without accounting for its own rent-exempt minimum, for instance) risks that account disappearing out from under later instructions that assumed it would persist.

Anchor's `close = recipient` constraint, when used to deliberately close an account, has to zero its data _and_ transfer out its full lamport balance in the same atomic instruction, doing either half without the other leaves a corrupt, half-closed account behind.

---

## 11. Security audit checklists.

Concepts 2 through 10, formalized into a repeatable review pass.

For every `#[derive(Accounts)]` struct in a program, walk each field and ask explicitly,

- is this a `Signer` where a signer is actually required (Concept 2)?
- Is this an `Account<'info, T>` where ownership/type actually matters (Concept 3, 9)?
- Do any two accounts of the same type need an explicit relationship constraint (Concept 4)?
- Are PDA seeds actually unique to what they represent (Concept 5)?
- Does every arithmetic operation use a checked variant (Concept 6)?

This is the same discipline Week 15, Concept 9 introduced as Anchor's _default_ posture, applied here as a deliberate, manual pass rather than something to simply trust the framework for.

---

## 12. Fuzzing programs (Trident/Honggfuzz).

A structurally different approach from Concept 11's manual checklist.

Rather than a human enumerating specific exploit scenarios, a fuzzer generates large volumes of structured-random instruction sequences and inputs, then watches for panics, failed invariants, or unexpected state, cases a checklist's author simply didn't think to check by hand.

**Trident** is Anchor-aware, it can read a program's IDL (Week 16, Concept 1) to generate well-formed instruction sequences automatically;

**Honggfuzz** operates at a lower level, closer to Week 14's raw native style, with less built-in structure but broader applicability.

> This week's Hard assignment sets up the account-level vulnerabilities fuzzing is good at finding; genuinely running a fuzzing campaign is Week 49's territory ("fuzzing strategies beyond basic fuzzing"), not this week's.

---

## Assignment.

1. **Easy - Integer Overflow/Underflow: A Vault Balance, Checked Correctly.**

   **What you practice:**
   - Building an Anchor program where every arithmetic operation on a stored balance uses `checked_add`/`checked_sub` (Concept 6) rather than raw operators, with descriptive custom errors instead of a generic runtime panic
   - Directly observing the difference between Anchor's `overflow-checks = true` default catching a raw operator's overflow as an opaque panic, versus a `checked_*` call surfacing a clear, named program error instead
   - Confirming an underflow (withdrawing more than the stored balance) is rejected with an explicit error, not a `u64` wraparound to a near-`u64::MAX` "balance"

   **Requirements:**
   - A `VaultAccount` PDA (seeds `["vault", owner_pubkey]`) storing `owner: Pubkey` and `balance: u64`, tracked entirely as an internal ledger number, no real SPL token transfer involved, keeping this assignment isolated to the overflow/underflow concept alone.
   - `initialize(ctx)` creates the `VaultAccount` with `balance = 0`.
   - `deposit(ctx, amount)` adds `amount` to `balance` using `checked_add`, returning a custom `Overflow` error on failure rather than panicking.
   - `withdraw(ctx, amount)` subtracts `amount` from `balance` using `checked_sub`, returning a custom `InsufficientBalance` error on failure.
   - A TypeScript client initializes a vault, deposits a real amount, withdraws part of it, and prints the resulting balance; it also attempts an over-withdrawal and catches the resulting error explicitly, printing it rather than crashing.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: npx tsx index.ts

       Expected output shape:
           Vault initialized: 6nBWg...

           Deposited 500.
           Withdrew 200.
           Balance after normal operations: 300

           Caught expected error on over-withdrawal:
           InsufficientBalance, as expected.

           Final balance (unchanged by the failed withdrawal): 300

   2. Command: verify by hand.

       The final balance must equal 300, not some wrapped-around near-
       u64::MAX value — confirming checked_sub genuinely rejected the
       over-withdrawal rather than silently underflowing the stored
       balance (Concept 6).

   3. Command: run npx tsx index.ts a second time without modifying
       anything.

       Expected output: "Vault already initialized," then deposit/
       withdraw proceed against the EXISTING balance from the prior run
       (now 300, becoming 600 then 400) — confirming the vault genuinely
       persists state correctly across runs rather than silently
       resetting.

   4. Command: temporarily replace the checked_add call in `deposit`
       with raw addition:

           vault.balance = vault.balance + amount;

       then run `anchor build` and attempt a deposit large enough to
       overflow (e.g. call deposit with an amount near u64::MAX using a
       throwaway test, or simply reason through it): with
       overflow-checks = true still set in Cargo.toml, this still panics
       at runtime rather than wrapping, since Anchor's workspace default
       remains in effect regardless of this one line. Now ALSO
       temporarily comment out `overflow-checks = true` in the root
       Cargo.toml's [profile.release] section, rebuild, and redeploy: the
       same large deposit now wraps the balance around silently instead
       of erroring at all, confirming the checked_* call was never
       optional, it's the only overflow protection that doesn't depend on
       a project-level build setting. Revert BOTH changes afterward.
   ```

2. **Medium - Missing Owner/Signer Checks: An Admin-Gated Config, Exploited Then Fixed.**

   **What you practice:**
   - Building an admin-gated `update_fee` instruction whose correctness depends entirely on an explicit `has_one` constraint tying the config account to a specific signer
   - Directly observing, in the same test run, both the fixed version correctly rejecting a non-admin caller, and (by deliberately weakening the code) the exact same call succeeding when that one constraint is removed
   - Practicing Concept 11's audit-checklist habit concretely: reading a real `#[derive(Accounts)]` struct and identifying exactly which line is doing the actual authorization work

   **Requirements:**
   - Extends the pattern from Week 19's Medium: this assignment is **test-only**, run via `anchor test`, since demonstrating a genuine non-admin caller requires a second, illegitimate-on-live-devnet signer, exactly the course's established two-party rule (Week 19's Assignment intro).
   - A `Config` PDA (seeds `["config"]`, a single global config) storing `admin: Pubkey` and `fee_bps: u16`.
   - `initialize(ctx, fee_bps)` creates `Config`, setting the calling signer as `admin`.
   - `update_fee(ctx, new_fee_bps)` requires the signer be the account already stored as `admin`, enforced via `#[account(mut, has_one = admin)]` on `config` together with `admin: Signer<'info>` in the same struct, and updates `fee_bps`.
   - A test performs: (1) a successful `update_fee` call by the real admin, (2) a call by a second, non-admin `Keypair` attempting the same instruction, asserted to fail.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: anchor test

       Expected output:
           config-program
           ✓ lets the real admin update the fee (....ms)
           ✓ rejects a non-admin caller — Concept 2 + Concept 3 enforced
               together (....ms)

           2 passing

   2. Command: verify by hand.

       The second test's final assertion confirms fee_bps is STILL 750
       after the rejected attempt, not 9999 — confirming the rejection
       happened before any state mutation, not merely that an error was
       thrown after the fact.

   3. Command: temporarily change the attacker's airdrop amount from
       LAMPORTS_PER_SOL to 0, then re-run anchor test.

       Expected output: the second test still passes, for a DIFFERENT
       reason now (insufficient funds for the attacker to even pay
       transaction fees, rather than the has_one rejection) — a useful
       reminder that a passing test doesn't always mean it's testing what
       you think; revert this change and confirm the original
       ConstraintHasOne assertion is what's actually firing.

   4. Command: temporarily remove `has_one = admin` from the `UpdateFee`
       struct in src/lib.rs (leaving `admin: Signer<'info>` in place),

           rebuild, and re-run anchor test.

       Expected output: 1 failing — the second test's assert.fail() line
       now fires, because update_fee SUCCEEDED for the non-admin attacker.
       `admin: Signer<'info>` alone only proves SOMEONE signed; without
       has_one tying that signer to config.admin specifically, ANY signer
       is accepted, exactly Concept 3's point. Revert this change
       afterward and confirm both tests pass again.
   ```

3. **Hard -PDA Seed Collisions and Arbitrary CPI: A Per-User Vault, Exploited Then Fixed.**

   **What you practice:**
   - Building a custodial token vault whose per-user isolation depends entirely on including the owner's pubkey in its PDA seeds (Concept 5), and whose CPI safety depends entirely on typing `token_program` as `Program<'info, Token>` rather than `UncheckedAccount` (Concept 8)
   - Demonstrating, in an Anchor test, that two distinct users' vaults resolve to genuinely distinct addresses, and that substituting an arbitrary program in place of the real Token Program is rejected before any transfer logic runs
   - Demonstrating the legitimate single-user flow live, on devnet, with your real wallet, reusing Week 19's mint-persistence and vault-existence-check patterns directly

   **Requirements:**
   - A `UserVault` (a real SPL `TokenAccount`, PDA-owned, seeds `["vault", owner_pubkey]`, **not** `["vault"]` alone, the fix for Concept 5's collision) and a `["vault-authority", owner_pubkey]` PDA as its signing authority.
   - `initialize_vault(ctx)` creates the per-user vault token account.
   - `deposit(ctx, amount)` transfers `amount` from the owner's ATA into their vault, owner signs directly (no CPI-authority concern on deposit, since the owner already holds authority over their own ATA).
   - `withdraw(ctx, amount)` transfers `amount` from the vault back to the owner's ATA, signed by the `vault-authority` PDA via `CpiContext::new_with_signer`, with `token_program` typed `Program<'info, Token>` (the fix for Concept 8's arbitrary-CPI risk — an `UncheckedAccount` here would accept any program silently).
   - An Anchor test confirms: two different owners' vaults are distinct addresses; a `withdraw` call substituting the System Program's address in place of `token_program` is rejected with a constraint error, not merely a downstream transfer failure; and a legitimate `withdraw` with the real Token Program succeeds normally.
   - A live TypeScript client creates a mint (persisted across runs, Week 19's fix), initializes your own vault (guarded against re-init, Week 19's fix), deposits, withdraws part of it, and prints your vault's balance before and after.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: anchor test --skip-deploy (Rust tests)

       Expected output:
           per-user-vault
           ✓ gives two different owners distinct vault addresses — no
               seed collision (....ms)
           ✓ rejects an arbitrary program substituted for token_program
               (....ms)

           2 passing

   2. Command: npx tsx index.ts (live client)

       Expected output shape (first run):
           Mint created: 6nBWg...
           Minted 1000 tokens to your ATA.
           Vault initialized: BfuUk...

           Vault balance before: 0
           Deposited 200.
           Withdrew 50.

           Vault balance after: 150

   3. Command: run npx tsx index.ts a second time.

       Expected output: "Reusing existing mint," "ATA already funded" (if
       still above the 500 threshold), "Vault already initialized," then
       balance before shows 150 (persisted from the prior run), ending at
       300 (150 + 200 - 50) — confirming both the mint-persistence and
       vault-existence-check fixes are genuinely working together across
       runs, not just on a single execution.

   4. Command: in per-user-vault/programs/per-user-vault/src/lib.rs,
       temporarily change the `Withdraw` struct's token_program field
       from:

           pub token_program: Program<'info, Token>,

       to:

           /// CHECK: intentionally weakened for this test only
           pub token_program: UncheckedAccount<'info>,

       rebuild, and re-run the Rust test suite (Test 1's second test
       specifically).

       Expected output: 1 failing — the assert.fail() line now fires,
       because the System-Program substitution is no longer rejected at
       the account-resolution stage. Anchor still forwards to the
       instruction body, where the actual CPI into the (wrong) program
       fails downstream instead, a strictly worse failure mode: the
       rejection moved from "immediately, with a clear constraint error"
       to "deep inside a CPI, with a confusing one," and against a
       REAL malicious program (rather than the harmless System Program
       used here for a safe demonstration) it might not fail at all.

       Revert this change afterward and confirm both tests pass again.
   ```
