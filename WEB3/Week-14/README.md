# List of things learned.

## 1. Program entrypoint structure.

Every native Solana program exports exactly one fixed entry point, there's no `main()` the way Week 6's binaries had one.

The `entrypoint!` macro (from the `solana-program` crate) generates the low-level plumbing the runtime actually calls and wires it to a function you write with this exact signature:

```rust
use solana_program::{account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    Ok(())
}
```

Three parameters, always:

- **`program_id`** (this program's own address, Week 11's `owner` field from the _inside_),
- **`accounts`** (every account the transaction listed, in order, each still carrying its `is_signer`/`is_writable` flags from Week 11, Concept 6) &
- **`instruction_data`**, a raw, unparsed `&[u8]`.

That last one is Concept 2 (next), in full.

---

## 2. Instruction data parsing.

Anchor (Week 8's macro preview, and Week 15's full treatment) generates instruction parsing for you automatically from a Rust function signature.

A native program has no such macro, `instruction_data` arrives as raw bytes and parsing it is entirely your own code.

The standard shape:

- define an `enum` of every instruction this program supports,
- derive Borsh (Week 5) on it &
- parse with `try_from_slice`.

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    Initialize,
    Increment,
}

let instruction = CounterInstruction::try_from_slice(instruction_data)
    .map_err(|_| ProgramError::InvalidInstructionData)?;
```

Borsh encodes an enum as a single leading byte (the variant's index, `0` for the first variant, `1` for the second and so on), followed by that variant's fields, if any.

This week's client-side code builds that exact byte layout by hand, no `borsh` npm package needed, since a one-byte discriminant plus a `u64` is simple enough to write directly with `Buffer.writeUInt8`/`writeBigUInt64LE`, the same manual style Week 11's sysvar decoding already used.

---

## 3. Account Validation. (entirely by hand)

Week 8's Anchor preview showed `#[derive(Accounts)]` generating account validation automatically.

Native programs get none of that, every check Anchor would have generated is code you write yourself, directly applying Week 11's concepts:

```rust
if !payer_account.is_signer {
    return Err(ProgramError::MissingRequiredSignature);   // Week 11, Concept 6
}
if counter_account.owner != program_id {
    return Err(ProgramError::IllegalOwner);                // Week 11, Concept 3
}
```

This week adds one more validation that matters specifically because these programs use PDAs (Week 13):

- **never trust a client-supplied address (or bump) for a PDA without re-deriving it yourself.**

```rust
let (expected_pda, bump) = Pubkey::find_program_address(&[SEED, payer.key.as_ref()], program_id);
if expected_pda != *counter_account.key {
    return Err(ProgramError::InvalidArgument);
}
```

This is Week 13, Concept 5's canonical-bump warning, no longer abstract, every program in this week's assignments does exactly this before trusting a PDA account it was handed.

---

## 4. Processing Instructions.

Once parsed (Concept 2) and validated (Concept 3), dispatching is a plain `match`, Week 6, Concept 5's pattern matching, doing real work:

```rust
match instruction {
    CounterInstruction::Initialize => { /* ... */ }
    CounterInstruction::Increment => { /* ... */ }
}
```

There's no framework routing this for you, the `match` **is** the entire routing layer.

This is worth sitting with for a moment: everything Anchor's `#[program]` macro (Week 8, Concept 6's preview) will generate for you starting next week is, underneath, exactly this, parse an instruction, validate some accounts, `match` on a variant.

Week 15 doesn't introduce a new mental model, it automates this one.

---

## 5. State management without a framework.

An account's `data` field (Week 11, Concept 2) is just bytes, reading and writing your program's own state means Borsh-serializing directly into it and deserializing directly out of it, by hand:

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub count: u64,
}

// Reading:
let counter = CounterAccount::try_from_slice(&counter_account.data.borrow())?;

// Writing:
counter.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;
```

That doubled `&mut &mut` on the write side looks unusual the first time, but it's mechanical.

`serialize` needs a `&mut W where W: Write` and a mutable byte slice `&mut [u8]` implements `Write` directly, so the outer `&mut` borrows the `RefMut<[u8]>` returned by `.borrow_mut()` and the inner `&mut` (via `[..]`) reborrows it as the actual slice `serialize` writes into.

No `#[account]` macro (Week 15) is doing any of this for you, this is the literal mechanism that macro will eventually hide.

---

## 6. Cross-program Invocation. (without Anchor's `CpiContext`)

> Week 11, Concept 8 and Week 13, Concept 7 both previewed this conceptually;

Here it's real code, two functions from `solana_program::program`:

- **`invoke(instruction, accounts)`** : A plain CPI, used when every required signer is a _real_ signer already present in the transaction (this week's `Deposit` instruction: the depositor genuinely signs, so authorizing a transfer _from_ their own account needs nothing special).

- **`invoke_signed(instruction, accounts, seeds)`** : Used when the CPI needs a **PDA** to act as a signer. You hand the runtime the exact seeds (Week 13) that derive that PDA; the runtime re-derives the address itself and, on a match, treats that account as having signed, for the duration of that one call only.

This week's `Withdraw` instruction is the first time in this course a PDA actually authorizes moving real lamports, Week 13, Concept 7's preview, paid off in full.

---

## 7. Error handling in native programs.

Every fallible operation in a native program returns `Result<(), ProgramError>` (that's what `ProgramResult` actually is), and `ProgramError` is a fixed enum covering the common cases you've already seen above: `MissingRequiredSignature`, `IllegalOwner`, `InvalidArgument`, `InvalidAccountData`, `InsufficientFunds`, `ArithmeticOverflow`.

The `?` operator (Week 6, Concept 5's preview, Week 7 in full) propagates these exactly the way it propagates any other `Result`, a failed Borsh deserialization, a failed CPI, an arithmetic overflow via `checked_add`, all bubble straight up and abort the instruction, with no state changes committed.

Anchor's `#[error_code]` macro (Week 8, Concept 6's preview) will later generate custom, named error variants for you; a native program either reuses `ProgramError`'s built-in variants (what this week's code does) or defines its own enum implementing `Into<ProgramError>`, more boilerplate Anchor exists specifically to remove.

---

## 8. Deploying native programs.

A native program isn't compiled with plain `cargo build`, it's compiled to Solana's own bytecode format (SBF, Solana Bytecode Format) using a Solana-provided toolchain:

```
cargo build-sbf
```

This produces a `.so` file and a matching keypair file (`*-keypair.json`), the deploy keypair's public key becomes the program's own on-chain address, deployed with:

```
solana program deploy target/deploy/your_program.so --url devnet
```

The deployed program account itself is executable (Week 11, Concept 2), owned by one of Solana's BPF Loader programs (Week 11's Easy assignment observed exactly this shape for the real SPL Token Program).

Deployment costs meaningfully more than an ordinary transaction, the program account must be rent-exempt (Week 11, Concept 7) for its entire compiled size, easily several times a typical transfer's cost.

Budget real devnet SOL for this before starting this week's assignments.

---

## 9. Testing native programs. (`solana-program-test`, instead of deploying every time).

Deploying to devnet for every single code change during development would be painfully slow and would burn through devnet SOL for no reason.

`solana-program-test` solves this by running your program's logic **in-process**, against a simulated, local bank, no real cluster, no deployment, no network call and no faucet involved at all:

```rust
let mut program_test = ProgramTest::new("counter_program", program_id, processor!(process_instruction));
let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
```

That `payer` is a `Keypair` `ProgramTest` generates and pre-funds automatically, entirely inside this simulated environment.

It has nothing to do with a real devnet wallet or the devnet faucet, it's the Rust-native equivalent of an in-memory test fixture and using it here is the _correct_, idiomatic pattern, categorically different from generating a throwaway keypair against a real, live network.

This week's Medium assignment uses `solana-program-test` for exactly this reason, fast iteration on program logic, entirely separate from the slower, costlier deploy-and-test cycle Easy and Hard both still need for a genuinely deployed, live program.

---

## Assignment.

1. **Easy - A PDA-Backed Counter: Initialize & Increment.**

   **What you practice:**
   - Writing a complete native program from scratch: entrypoint, Borsh-based instruction parsing, manual account validation, and Borsh-based state read/write, Concepts 1–5 in one small program
   - Creating a PDA-owned account via CPI (`invoke_signed`, Concept 6) inside the program's own `Initialize` instruction, rather than requiring the client to pre-create it with a throwaway keypair
   - Building and sending instructions from a TypeScript client using your real local wallet, and manually decoding the resulting account's Borsh-encoded state

   **Requirements:**
   - A `CounterAccount { count: u64 }` struct and a `CounterInstruction` enum (`Initialize`, `Increment`), both deriving `BorshSerialize`/`BorshDeserialize`.
   - `Initialize` re-derives the canonical `["counter", payer_pubkey]` PDA itself (never trusting the client's account list blindly), creates it via `invoke_signed` if the derived address matches what was passed in, and writes an initial `count: 0`.
   - `Increment` validates the counter account is owned by this program, reads the current count, increments it with `checked_add` (never a raw `+= 1`), and writes it back.
   - A TypeScript client loads your local wallet, derives the same PDA client-side, sends `Initialize` then `Increment` as two separate transactions, and prints the decoded `count` after each.

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

       Count must read 0 immediately after Initialize and 1 after
       Increment — confirming CounterAccount's Borsh-encoded bytes are
       being written and read back correctly (Concept 5) and that the
       client's manual readBigUInt64LE(0) decoding matches exactly what
       the program's serialize() call wrote.

   3. Command: apply How to Build Step 10 (re-run npx tsx index.ts a
       second time, unchanged).

       Expected output: "Counter already initialized, skipping
       Initialize.", then Count: 1, then a successful Increment taking it
       to Count: 2 — confirming the PDA (and its state) persisted
       correctly between separate script invocations, exactly as any
       real on-chain account would.

   4. Command: temporarily change `counter.count.checked_add(1)` to
       `counter.count + 1` (a raw, unchecked addition), then run

           cargo build-sbf.

       Expected output: this specific change actually still compiles —
       checked_add's real value is a RUNTIME safety net against overflow,
       not a compile-time one. To see the actual difference, read
       Concept 7 again: with the raw `+ 1`, a counter already at
       u64::MAX would panic the whole program on overflow instead of
       returning a clean ProgramError::ArithmeticOverflow. Revert this
       change afterward — this test case is about recognizing the
       distinction, not triggering a compiler error.
   ```

2. **Medium - Testing the Counter Program with `solana-program-test`.**

   **What you practice:**
   - Writing a `#[tokio::test]` integration test against `solana-program-test`'s `BanksClient`, entirely in-process, no deployment, no devnet, no real network at all
   - Using the `no-entrypoint` feature-gate pattern, a genuine, common gotcha, needed because `entrypoint!`'s generated code conflicts with the native test binary if left unconditional
   - Directly experiencing why Concept 9's "test locally first" advice is practical, not just theoretical, by comparing this assignment's iteration speed against Easy's deploy-and-check cycle

   **Requirements:**
   - Adds `solana-program-test`, `solana-sdk`, and `tokio` as **dev-dependencies** to Easy's existing `counter-program` crate (this assignment extends that project directly, it isn't a separate one).
   - A `tests/counter_test.rs` integration test starts a `ProgramTest`, sends an `Initialize` instruction, asserts the resulting account's decoded `count` is `0`, sends an `Increment` instruction, and asserts `count` is now `1`.
   - The test runs entirely via `cargo test --features no-entrypoint`, with no `solana program deploy` step anywhere in this assignment.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: cargo test --features no-entrypoint

       Expected output: test_initialize_and_increment ... ok, with the
       whole run completing in well under a second — no network activity,
       no waiting on confirmations, no devnet involved at all.

   2. Command: verify by hand.

       Both assert_eq! calls passing confirms the exact same program
       logic Easy deployed for real also behaves correctly here, in a
       fast, hermetic, local environment — the SAME process_instruction
       function, imported directly, not a reimplementation.

   3. Command: temporarily change the program's Increment logic in
       src/lib.rs (counter_program's own file, not the test) from
       checked_add(1) back to a hardcoded counter.count = 5 (deliberately
       wrong),

           then re-run cargo test --features no-entrypoint.

       Expected output: test_initialize_and_increment ... FAILED, with an
       assertion failure reporting count was 5, not the expected 1 —
       confirming the test suite actually catches a real logic error,
       not just a syntax one. Revert this change afterward.

   4. Command: temporarily remove `--features no-entrypoint` and run
       plain cargo test.

       Expected output: a build/link failure, referencing the
       entrypoint's generated symbols conflicting with the test harness —
       confirming the feature-gate genuinely does something, rather than
       being cargo-cult boilerplate copied for no reason.
   ```

3. **Hard - A PDA-Owned SOL Vault: Deposit & Withdraw via CPI.**

   **What you practice:**
   - Writing a program where a PDA genuinely holds real lamports, deposited and withdrawn by two DIFFERENT CPI patterns, `invoke` (a real signer authorizes) and `invoke_signed` (the PDA itself authorizes, Week 13's Concept 7 fully realized)
   - Handling a real, expected failure case (withdrawing more than the vault holds) with a proper `ProgramError`, rather than letting the program panic
   - Building a two-instruction TypeScript client against a second, separately deployed program, reusing every pattern from Easy without re-explaining them

   **Requirements:**
   - A `VaultInstruction` enum with `Deposit { amount: u64 }` and `Withdraw { amount: u64 }` variants.
   - Both instructions re-derive the canonical `["vault", depositor_pubkey]` PDA themselves and reject any mismatch, exactly Easy's pattern.
   - `Deposit` moves lamports from the depositor to the vault PDA via a plain `invoke` of `system_instruction::transfer` (the depositor is a real signer, no PDA authorization needed to receive funds).
   - `Withdraw` checks the vault's current lamport balance first, returning `ProgramError::InsufficientFunds` cleanly if the requested amount exceeds it, then moves lamports back to the depositor via `invoke_signed`, the vault PDA authorizing its own outgoing transfer.
   - A TypeScript client loads your local wallet, derives the vault PDA, deposits a small amount, prints the vault's balance, withdraws half of it back, and prints the updated balance.

   [Solution](./Assignment/code3)

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

       Vault balance must read exactly 2000000 after deposit, and exactly
       1000000 after withdrawing 1000000 back — confirming both the plain
       invoke() (deposit) and invoke_signed() (withdraw) paths moved
       exactly the requested lamport amounts, no more, no less.

   3. Command: temporarily change withdrawAmount from 1_000_000n to
       50_000_000n (far more than the vault holds), then re-run

           npx tsx index.ts.

       Expected output: the deposit succeeds as before, but the withdraw
       transaction fails, surfacing a custom program error corresponding
       to ProgramError::InsufficientFunds — confirming the vault's
       balance check runs BEFORE attempting invoke_signed, rather than
       letting the CPI itself fail with a less specific error. Revert
       this change afterward.

   4. Command: temporarily remove the `if vault_account.lamports() <
       amount { ... }` check entirely from the Withdraw arm in
       vault-program/src/lib.rs, then run cargo build-sbf.

       Expected output: this still compiles cleanly — the check is a
       program-level safety net, not something the compiler can enforce
       for you, exactly Week 6/7's broader lesson about checked
       arithmetic applied here to a real balance instead of a number.
       Revert this change afterward, redeploying isn't necessary for this
       test case, the point is recognizing what does and doesn't get
       caught at compile time.
   ```
