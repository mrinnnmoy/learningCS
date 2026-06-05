# List of things learned.

## 1. Cargo & The Anatomy of a Rust project.

Every previous week's code ran through `tsx`. TypeScript gets type-checked and executed on the fly, with no separate compile step you think about.

Rust works differently, it's compiled ahead of time by `rustc` and you'll almost never invoke `rustc` directly.

Instead, you use **Cargo**, Rust's build tool and package manager. The same way `npm` sat in front of Node.

```
your-project/
├── Cargo.toml      <- manifest: name, version, edition, dependencies
├── Cargo.lock      <- exact resolved dependency versions (like package-lock.json)
├── src/
│   └── main.rs     <- entry point for a binary crate: fn main() { ... }
└── target/         <- build output (created by cargo build/run, never checked in)
```

A **crate** is Rust's unit of compilation and distribution, roughly the same idea as an npm package.

- `cargo new my-project` scaffolds all of the above.

- `cargo build` compiles it.

- `cargo run` compiles (if anything changed) & then runs it in one step.

- `cargo check` is worth knowing about even though this week's assignments don't require it: it type-checks your code without producing a runnable binary, which is noticeably faster and is what most Rust developers reach for while actively writing code, saving the full `cargo build`/`cargo run` for when they actually want to run something.

---

## 2. Variables, Mutability & Basic types.

Rust flips a default you've relied on since Week 1 in TypeScript:

- `let` is mutable and you opt into immutability with `const`.

In Rust:

- `let` is **immutable by default** and you opt into mutability explicitly with `let mut`.

```rust
let x = 5;
let mut y = 5;

y = 6;  // fine — y was declared mut
x = 6;  // compile error: cannot assign twice to an immutable variable
```

Rust also has no implicit numeric coercion, an explicit-width integer like `i32` and another like `i64` cannot be mixed in an expression without an explicit `as` cast and none of Rust's numeric types silently convert into each other the way JavaScript numbers do.

Those explicit widths (`u8`, `u16`, `u32`, `u64`, `u128` for unsigned; `i8` through `i128` for signed) are worth recognizing immediately.

They're the exact same type names Week 5's Borsh schemas used (`'u8'`, `'u64'` and so on).

_That wasn't a coincidence:_ Borsh's type names are Rust's own primitive type names, because Borsh was designed to mirror Rust's type system directly.

One more distinction that matters from your very first line of Rust code:

- `String` is an owned, growable, heap-allocated piece of text,

- while `&str` is a borrowed _view_ into text someone else owns (a literal like `"hello"`, or a slice of a `String`).

You'll see both throughout this week's code and Concept 3 below is what actually explains why the distinction exists.

---

## 3. Ownership & Borrowing.

This is the concept every other Rust concept this week ultimately depends on and it doesn't have a real equivalent in TypeScript.

**Every value has exactly one owner**, the variable it's bound to.

When you assign that value to another variable, or pass it into a function by value, one of two things happens, depending on the type:

- For simple, fixed-size scalar values (integers, `bool`, `char` and tuples made only of these) types that implement Rust's `Copy` trait, the value is **copied**. Both the original and new variable remain independently valid.

- For everything else (`String`, `Vec<T>` and any custom struct that doesn't explicitly opt into `Copy`), the value **moves**. Ownership transfers to the new variable and the original variable becomes invalid to use. The compiler enforces this at compile time, not with a runtime crash, but with a build error that stops you before the program ever runs.

```rust
// Copy type — both remain valid
let a = 5;
let b = a;
println!("{}", a);   // fine: a still owns its own value

// Non-Copy type — ownership moves
let a = String::from("hi");
let b = a;
println!("{}", a);   // compile error: value used after move
```

**Borrowing** lets you use a value without taking ownership of it, via references:

- `&T` is a shared reference, you can have as many of these pointing at the same value at once as you want, but none of them can modify it.

- `&mut T` is an exclusive reference, you can have exactly one of these active at a time, and it cannot coexist with any `&T` reference to the same value at the same time.

```
Borrowing rules, enforced entirely at compile time, with zero runtime cost:
  - any number of &T (shared) references at once,  OR
  - exactly one &mut T (exclusive) reference at a time
  - never both kinds on the same value at the same time
```

This is Rust's actual pitch: memory safety and data-race freedom, without a garbage collector, by having the compiler prove these rules hold before your program is even allowed to run.

> Easy's assignment this week is built entirely around feeling this directly, including deliberately triggering the "value used after move" error above, on purpose, so it stops being an abstract idea.

---

## 4. Structs & Enums.

A **struct** groups named fields into one type, conceptually close to a TypeScript `interface`, except a struct also has a real, defined memory layout, which is exactly what let Week 5's Borsh schemas describe a byte-for-byte encoding of one.

```rust
struct Account {
    owner: String,
    balance: i64,
}
```

An **enum** in Rust is considerably more powerful than a TypeScript enum. Rather than just naming a fixed set of values, each variant of a Rust enum can carry its own, different data:

```rust
enum Operation {
    Deposit(i64),   // carries one i64
    Withdraw(i64),  // carries a different one i64
}
```

This is closer to a TypeScript discriminated union than to a TypeScript `enum`.

You'll see in Concept 5 below that `Option` and `Result`, the two types that replace null and exceptions are themselves just ordinary enums defined in Rust's standard library, with nothing magic about them.

Methods are attached to a struct or enum via a separate `impl` block, rather than being written inline inside the type definition:

```rust
impl Account {
    fn new(owner: &str, opening_balance: i64) -> Account {
        Account { owner: owner.to_string(), balance: opening_balance }
    }
}
```

> Adding `#[derive(Debug)]` directly above a struct or enum definition automatically generates a printable representation usable with the `{:?}` formatting placeholder. You'll use this constantly for inspecting values while learning and every solution this week relies on it.

---

## 5. Pattern Matching, Option & Result. (No null, No exceptions)

Rust has no `null`, no `undefined` and no exceptions for ordinary error handling.

Two standard library enums replace both:

```rust
enum Option<T> { Some(T), None }     // replaces null/undefined
enum Result<T, E> { Ok(T), Err(E) }  // replaces throw/catch
```

`Option<T>` represents "a value that might be absent", similar in spirit to TypeScript's `T | undefined`, except the compiler will not let you use the inner value at all until you've explicitly handled the `None` case.

There's no way to accidentally skip the check and get a null-pointer-style crash later.

`Result<T, E>` represents "an operation that might fail" and replaces exceptions entirely for expected, recoverable errors.

An error becomes a plain value returned from a function, not something thrown from deep inside a call stack and caught somewhere unrelated.

`match` is Rust's primary pattern-matching control-flow construct and the mechanism that actually enforces both of the above: **it's exhaustive**. The compiler refuses to build code that doesn't handle every possible variant.

```rust
match some_result {
    Ok(value) => { /* use value */ }
    Err(error) => { /* handle error */ }
}
// Missing the Err arm here is a COMPILE ERROR, not a bug you discover
// later — this is what "the compiler forces you to handle errors"
// actually means in practice.
```

> One piece of syntax worth previewing before Hard's assignment uses it: the `?` operator, placed after an expression of type `Result<T, E>` (or `Option<T>`), means "if this is `Err`/`None`, return it from the current function immediately; otherwise, unwrap and continue with the `Ok`/`Some` value." It's shorthand for a `match` that only wants to handle the success case inline, letting failure cases propagate upward automatically.

---

## Assignment.

1. **Easy — Ownership & Borrowing: A Token Balance Calculator.**

   **What you practice:**
   - Declaring immutable vs. mutable variables with `let` and `let mut`
   - Passing values into functions by reference (`&T`) vs. by ownership, and understanding exactly what changes between the two
   - Deliberately triggering, reading, and understanding a real "value used after move" compiler error
   - Iterating over a borrowed `Vec<T>` and working with the references that produces

   **Requirements:**
   - The program stores an account owner's name and a list of transaction amounts (positive for deposits, negative for withdrawals).
   - The program prints the owner's name, then the total balance, then a running (step-by-step) balance after each individual transaction — using the owner name and transaction list normally after passing them into helper functions, without the compiler complaining.
   - Every helper function that only needs to read data, rather than consume it, takes a reference (`&`) rather than ownership.
   - The source file includes a commented-out demonstration of what happens when a function takes ownership of the transaction list instead of borrowing it, along with a comment explaining exactly why uncommenting it fails to compile.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

        Expected output, in this exact order:

            Account owner: Alice
            Total balance for Alice: 300
            (a blank line)
            Step-by-step balance:
            +100 -> balance: 100
            -30 -> balance: 70
            +50 -> balance: 120
            -20 -> balance: 100
            +200 -> balance: 300

        The total (300) is 100 - 30 + 50 - 20 + 200 worked out by hand.

        If your total doesn't match, re-check sum_transactions against the
        Solution before continuing.

   2. Command: uncomment the two lines at the bottom of main() as
        described in How to Build Step 5, then run cargo build.

        Expected output: A compilation failure.

        Somewhere in the error output you should see the phrase "value moved"
        or "borrow of moved value" referring to `transactions`, along with a
        note pointing at the take_ownership_demo(transactions) line as where
        the move happened and a second note pointing at the println! line
        immediately below it as where the now-invalid value was used again.

        No binary is produced, and cargo build exits with a non-zero status
        (confirm with echo $?).

   3. Command: re-comment those same two lines, then run cargo run again.

        Expected output: identical to test case 1.

        Confirming the project is back in a working state and the earlier
        failure was caused specifically by those two lines, nothing else.

   4. Command: in print_running_balance, temporarily change the parameter
        type from &Vec<i64> to Vec<i64> (removing the &), leave the call
        site in main() unchanged, then run cargo build.

        Expected output: Another compile error, this time pointing at the
        print_running_balance(&transactions) call site in main().

        Because you're now passing a reference (&Vec<i64>) to a function that
        expects an owned Vec<i64>, the two types no longer match.

        Revert this change afterward; this test case exists to show that
        ownership mismatches are caught immediately, in either direction.
   ```

2. **Medium — Structs, Enums & Pattern Matching: Account Modeling.**

   **What you practice:**
   - Defining a struct to hold state, and enums to model a fixed set of possible operations and outcomes
   - Attaching behavior to a struct with an `impl` block, including a method that mutates `self`
   - Using `match` on both a custom enum's variants and on values carried inside them
   - Returning a different enum variant to represent each distinct outcome of an operation, instead of using error codes or sentinel values

   **Requirements:**
   - An `Account` struct holds an owner name and a balance.
   - An `Operation` enum represents either a deposit or a withdrawal, each carrying the amount involved.
   - A `TransactionResult` enum represents every possible outcome of applying an operation: success (carrying the new balance), insufficient funds (carrying both the attempted and available amounts), or an invalid (non-positive) amount.
   - An `Account::apply` method takes an `Operation` by reference, mutates the account's balance only when the operation should actually succeed, and returns the matching `TransactionResult` variant in every case.
   - The program applies a fixed sequence of five operations — including at least one that should succeed, one that should fail with insufficient funds, and one that should fail with an invalid amount — printing a human-readable description of each outcome as it happens, followed by the account's final state.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:

           Starting account: Account { owner: "Alice", balance: 100 }

           Deposit(50) -> OK — new balance: 150
           Withdraw(30) -> OK — new balance: 120
           Withdraw(1000) -> REJECTED — tried to withdraw 1000 but only 120 available
           Deposit(-10) -> REJECTED — amount must be greater than zero
           Withdraw(120) -> OK — new balance: 0

           Final account: Account { owner: "Alice", balance: 0 }

   2. Command: Trace the balance by hand alongside the output from test
           case 1: start at 100, +50 = 150, -30 = 120, the 1000 withdrawal is
           rejected so it stays at 120, the -10 deposit is rejected so it
           stays at 120, then -120 = 0.

           Expected output: Your hand-traced balance after each line matches
           the "new balance" reported on that same line exactly and matches
           balance: 0 in the final "Final account" line.

           Confirming apply() only mutates self.balance on the Success path,
           never on a rejected operation.

   3. Command: Apply How to Build Step 5 (add Operation::Deposit(0) as a
           sixth operation), then run cargo run again.

           Expected output: A sixth line reading

           "Deposit(0) -> REJECTED — amount must be greater than zero",

           and the final balance unchanged from test case 1's 0 — confirming zero
           is correctly treated as invalid, not as a no-op deposit.

   4. Command: Temporarily change the condition inside the Withdraw arm
           from if amount > self.balance to if amount >= self.balance.

           Then run cargo run again (keep the sixth operation from test case 3
           or remove it, either way).

           Expected output: The Withdraw(120) line now reads "REJECTED — tried
           to withdraw 120 but only 120 available" instead of succeeding —
           demonstrating that withdrawing an amount exactly equal to the
           current balance is a meaningful boundary condition worth testing
           deliberately, not an edge case to gloss over.

           Revert this change afterward.
   ```

3. **Hard - A Multi-Account Ledger with Real Error Handling.**

   **What you practice:**
   - Modeling multiple named accounts with a `HashMap<String, i64>`
   - Defining a custom error enum and implementing the `Display` trait for it, so errors print as readable messages rather than raw Debug output
   - Using `Result<T, E>`, `Option<T>`, and the `?` operator together in functions that can fail for several distinct reasons
   - Designing a multi-step operation (a transfer between two accounts) so that a failure partway through never leaves the ledger in a half-changed, inconsistent state

   **Requirements:**
   - A `Ledger` struct wraps a `HashMap<String, i64>` mapping account names to balances.
   - `withdraw` and `deposit` methods each return `Result<i64, LedgerError>` (the new balance on success), and each correctly reports a distinct error variant for a nonexistent account and for a non-positive amount.
   - `withdraw` additionally reports a distinct error variant, carrying the attempted amount and the actually-available amount, when the requested amount exceeds the balance.
   - A `transfer` method moves funds from one named account to another, returning `Result<(), LedgerError>`, and internally uses the `?` operator to propagate any failure from the underlying `withdraw`/`deposit` calls.
   - `transfer` verifies the destination account exists _before_ attempting to withdraw anything from the source account — a transfer to a nonexistent destination must leave the source account's balance completely unchanged, not reduced.
   - `LedgerError` implements `Display`, producing a distinct, readable message for each of its variants, and the program prints that message (not the raw `Debug` form) whenever a `transfer` fails.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output for the opening section:

               Opening balances:
               alice: Some(200)
               bob:   Some(50)

   2. Command: Same run, reading the "Transfer 1" section.

       Expected output:

           Transfer 1: alice sends 75 to bob
           OK
           alice: Some(125)
           bob:   Some(125)
       (200 - 75 = 125 for alice, 50 + 75 = 125 for bob.)

   3. Command: Same run, reading the "Transfer 2" section.

       Expected output:

           Transfer 2: bob sends 1000 to alice (should fail: insufficient funds)
           FAILED: account "bob" has 125 available, cannot withdraw 1000
           alice: Some(125)
           bob:   Some(125)

       Both balances are UNCHANGED from test case 2 — confirming a failed
       withdraw() never partially modifies the balance it failed to debit.

   4. Command: Same run, reading the "Transfer 3" section.

       Expected output:

           Transfer 3: alice sends 20 to carol (should fail: no such account)
           FAILED: account "carol" does not exist
           alice: Some(125)
       Alice's balance is still exactly 125.

       The same value as test cases 2 and 3.

       Confirming the contains_key(to) check caught this before
       withdraw() ever ran, so nothing was deducted from alice for a
       transfer that never actually happened.

   5. Command: Same run, reading the final section.

       Expected output:

           Looking up a nonexistent account directly:
           carol: None

       Not Some(0), not an error — None, since balance_of returns
       Option<i64> and carol was never opened as an account at all.

   6. Command: Apply How to Build Step 6 (comment out the contains_key
       check in transfer), then run cargo run again and re-read the
       "Transfer 3" section specifically.

       Expected output: it now reads

       "FAILED: account "carol" does not exist" still (deposit() catches
       the missing account too), BUT alice's balance directly below it now
       reads Some(105) instead of Some(125) — 20 was withdrawn from alice
       during the failed transfer, with nowhere for it to have gone.

       This is the exact bug the removed check was preventing: the transfer as
       a whole still correctly reports failure, but it no longer leaves
       the ledger in a consistent state.

       Revert the change before moving on to Week 7.
   ```
