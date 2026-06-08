# List of things learned.

## 1. Traits. (Shared behavior across different types)

A **trait** defines a set of methods a type promises to implement.

Conceptually close to a TypeScript `interface`, except a trait can also provide default method bodies that implementing types get for free and a function can require _"any type that implements this trait"_ as a parameter constraint.

```rust
trait Asset {
    fn symbol(&self) -> &str;
    fn value(&self) -> f64;
}

struct Token { /* fields */ }

impl Asset for Token {
    fn symbol(&self) -> &str { &self.symbol }
    fn value(&self) -> f64 { self.amount * self.price }
}
```

Any type can implement any trait, including types you don't own yourself in some cases.

This is how Week 6's `#[derive(Debug)]` actually works under the hood:

- it auto-generates an `impl Debug for YourType` block for you.

---

## 2. Generics. (One function, many types, zero runtime cost)

A **generic** function or struct is written once, parameterized over a type that isn't fixed until it's actually used.

`<T: Asset>` means _"some concrete type_ `T`, _constrained to types that implement the_ `Asset` _trait"_.

The bound is what tells the compiler which methods are actually available to call on values of type `T` inside the function body.

```rust
fn total_value<T: Asset>(assets: &[T]) -> f64 {
    let mut total = 0.0;
    for asset in assets {
        total += asset.value();
    }
    total
}
```

This is a meaningfully different guarantee than TypeScript generics give you.

- TypeScript's generics are a compile-time-only type-checking convenience, by the time your code actually runs as JavaScript, all generic type information is erased and there's exactly one piece of compiled code regardless of what `T` was.

- Rust generics are real. The compiler generates a separate, specialized copy of `total_value` for every distinct concrete type it's ever called with (a process called **monomorphization**), each one compiled as if you'd hand-written that specific version yourself.

You get genuine zero-cost abstraction, the generic version runs exactly as fast as a hand-written non-generic one would. At the cost of every element in a single call needing to be the exact same concrete type.

---

## 3. Trait objects & Dynamic dispatch. (Trading compile-time specialization for runtime flexibility)

Monomorphization's requirement, every element must be the same concrete type which is sometimes exactly what you don't want.

If you need one `Vec` to genuinely hold different types together (a `Token` and an `Nft`, say, both implementing `Asset`), generics can't do that on their own and there's no single concrete `T` to monomorphize against.

`dyn Trait` (almost always seen behind a pointer, as `Box<dyn Asset>` or `&dyn Asset`) solves this by deliberately giving up compile-time specialization.

Instead of the compiler knowing exactly which `impl Asset` to call at compile time, it stores a pointer to a **vtable**. A small table of function pointers and looks up the right method to call at runtime.

```
STATIC DISPATCH (generics)                  DYNAMIC DISPATCH (dyn Trait)
fn total_value<T: Asset>(&[T])              fn total_value_dyn(&[Box<dyn Asset>])

Compiler generates a separate,              Compiler generates ONE version of the
specialized copy of the function            function. Which method actually runs is
for every T it's called with.               decided at runtime via a vtable lookup.

+ zero runtime cost                         + one Vec can hold genuinely different
- every element must be the same                types together
  concrete type                             - small runtime cost per call
```

Not every trait can be used this way, a trait is only usable as `dyn Trait` if it's "object safe" (roughly: no methods that take `Self` by value or return `Self` and no generic methods).

Both methods on this week's `Asset` trait take `&self` and return ordinary, non-generic types, so it qualifies without any extra work.

---

## 4. Closures & Iterators. (Functions as values and lazy chains instead of manual loops)

A **closure** is an anonymous function that can capture variables from the scope it's defined in.

The Rust equivalent of a JS arrow function, but with the same ownership and borrowing rules from Week 6 applying to whatever it captures.

Three traits describe how a closure is allowed to use what it captured and you'll mostly recognize which one you need from how you're using the closure rather than memorizing the distinction up front:

- `Fn` (can be called repeatedly, only needs to borrow its environment),

- `FnMut` (can be called repeatedly, needs to mutate its environment) and

- `FnOnce` (can only be called once, since it consumes something it captured).

This week's code only needs `Fn`, the least restrictive of the three.

Rust's `Iterator` trait, the same trait Week 6's `Option`/`Result` material didn't need, but this week's custom-iterator assignment implements directly.

Powers adapter chains like `.filter(...)`, `.map(...)` and `.sum()`.

These chains are **lazy**:

- unlike JavaScript's `Array.prototype.filter`/`.map`, which each immediately build a whole new array,

- a chain of Rust iterator adapters does essentially nothing until something actually consumes it like a `for` loop, `.collect()`, `.sum()` and so on.

Nothing gets iterated twice and no intermediate collections get allocated just to be thrown away.

```
JavaScript (eager):                      Rust (lazy):
arr.filter(f).map(g)                     iter.filter(f).map(g)
  -> builds a full new array               -> builds nothing yet — just
     after .filter, THEN builds               describes the chain of steps
     another one after .map                -> .sum() (or .collect(), or a
                                               for loop) is what actually
                                               walks the data, once, applying
                                               both steps per element
```

---

## 5. Smart pointers: `Box`, `Rc` and `RefCell`. (Three different escapes from ownership's normal rules)

Week 6's ownership model - one owner, borrow via `&`/`&mut` covers most code. But three situations come up often enough that the standard library provides purpose-built types for them:

- **`Box<T>`** simply puts a value on the heap instead of the stack. You'll reach for it when a type needs a fixed, known size at compile time but logically contains something whose size can't be known ahead of time, which is exactly the situation `Box<dyn Asset>` from Concept 3 was in: a `dyn Asset` could be a `Token`, an `Nft` or any other size, so it has to live behind a pointer.

- **`Rc<T>`** ("reference counted") allows **multiple owners** of the same value, for the single-threaded case where Week 6's "exactly one owner" rule genuinely doesn't fit. Cloning an `Rc` doesn't clone the underlying data — it creates a new pointer to the same data and increments a count; the data is only actually dropped once every `Rc` pointing at it has been dropped.

- **`RefCell<T>`** provides **interior mutability**: the ability to mutate a value through a shared (`&`) reference. Week 6's borrow rules (any number of `&` or exactly one `&mut`, never both) still apply — `RefCell` just moves the _enforcement_ of those same rules from compile time to runtime. Calling `.borrow_mut()` while another borrow is still active doesn't fail to compile — it **panics** while the program is running.

```
Week 6's &mut:  checked by the COMPILER, before your program ever runs.
                Violation = a build error. Nothing unsafe ever executes.

RefCell:        checked while the program RUNS, every time you call
                .borrow() / .borrow_mut().
                Violation = a panic. The rule is identical — only WHEN
                it gets checked has changed.
```

`Rc<RefCell<T>>`, the two combined is a common single-threaded pattern for "several independent parts of a program all need to read and mutate the same shared piece of state," and is exactly what this week's Hard assignment builds.

---

## Assignment.

1. **Easy - Traits, Generics & Dynamic Dispatch: An Asset Portfolio.**

   **What you practice:**
   - Defining a trait and implementing it for more than one distinct struct
   - Writing a generic function constrained by a trait bound, and understanding that every call to it must use one single concrete type
   - Building a `Vec<Box<dyn Asset>>` that holds genuinely different types together, and calling a function written against the trait object form
   - Directly observing, in one program, both the constraint generics impose and the flexibility trait objects trade for it

   **Requirements:**
   - An `Asset` trait requires a `symbol` method returning a string slice and a `value` method returning an `f64`.
   - At least two distinct structs (this week: `Token` and `Nft`) implement `Asset`, each computing `value` differently.
   - A generic function computes the total value of a slice containing only one concrete `Asset`-implementing type.
   - A separate function computes the total value of a `Vec<Box<dyn Asset>>` containing more than one concrete type mixed together in the same collection.
   - The program prints both totals, and the mixed-type total must include contributions from at least two different concrete types.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:

           Generic version (all Tokens, same concrete type):
           Total token value: 2000.00
           (a blank line)
           Trait object version (mixed Token and Nft in one Vec):
           SOL -> 1500.00
           USDC -> 500.00
           MonkeyJPEG -> 2200.00
           Total portfolio value: 4200.00

   2. Command: verify the numbers by hand.

           10 SOL at 150.0 each = 1500.00. 500 USDC at 1.0 each = 500.00.

           1500.00 + 500.00 = 2000.00, matching the generic version's total.

           Adding the 2200.00 Nft on top gives 1500.00 + 500.00 + 2200.00 =
           4200.00, matching the trait object version's total exactly.

   3. Command: Apply How to Build Step 5 (add a third Asset-implementing
           struct and one instance of it to mixed_portfolio).

           Then run again : cargo run

       Expected output: A fourth line in the per-asset breakdown for your
       new type and "Total portfolio value:" increased by exactly that
       instance's value().

       Confirming total_value_dyn required no changes at all to support a
       brand new concrete type, since it only ever depends on the Asset
       trait, never on which concrete types exist.

   4. Command: Try changing mixed_portfolio's declared type from
           Vec<Box<dyn Asset>> to Vec<Token> and see what happens when
           you run cargo build.

       Expected output: A compile error at the line constructing the Nft
       instance (or your Step 3 addition, if still present).

       Something like a type mismatch, expected Token found Nft — confirming
       directly that a plain Vec<T> (no dyn) genuinely cannot hold more
       than one concrete type, which is the entire reason Box<dyn Asset>
       was needed in the first place.

       Revert this change afterward.
   ```

2. **Medium - Closures & Iterators: A Transaction Pipeline.**

   **What you practice:**
   - Passing a closure into a function as a parameter, constrained by the `Fn` trait bound
   - Building multi-step lazy iterator chains (`.filter().map().sum()`) instead of manual loops
   - Implementing the `Iterator` trait directly for a custom struct, and using it anywhere a normal iterator works (a `for` loop, `.last()`) for free
   - Comparing this week's idiomatic iterator-based running balance against Week 6 Easy's manual, hand-written loop version of the same idea

   **Requirements:**
   - The program filters a list of transactions into deposits and withdrawals using iterator adapters, and prints the summed total of each.
   - A function accepts a closure (constrained by `Fn(&Transaction) -> bool`) as a parameter, and uses it as a filter predicate to compute the total for one specific category, without that function needing to know about categories in any way itself.
   - A custom struct implements the `Iterator` trait to lazily yield the running balance after each transaction, one value per call to `.next()`, rather than pre-computing a `Vec` of every step up front.
   - The custom iterator is used both in a `for` loop (printing every step) and via `.last()` (retrieving only the final balance) — showing it working as a genuine, general-purpose iterator, not just a one-off loop.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

        Expected output, in this exact order:

            Total deposits: 3500
            Total withdrawals: -1430
            Total spent on groceries: -230

            Running balance, via a custom Iterator:
            3000
            2850
            1650
            2150
            2070

            Final balance (via .last() on a fresh iterator): Some(2070)

   2. Command: verify the numbers by hand.

        Deposits: 3000 + 500 = 3500. Withdrawals: -150 + -1200 + -80 =
        -1430.

        Groceries: -150 + -80 = -230. Running balance: 0+3000=3000,
        3000-150=2850, 2850-1200=1650, 1650+500=2150, 2150-80=2070

        Five values, matching the five printed lines exactly and the final one
        (2070) matching the .last() result.

   3. Command: Add a sixth transaction, Transaction { category:
        "groceries".to_string(), amount: -45 }, to the end of the vec!
        literal in main().

        Then run cargo run again.

        Expected output: "Total spent on groceries:" is now -275 (-230 -
        45), "Total withdrawals:" is now -1475, a sixth running-balance line
        reading 2025 appears and the final .last() balance is now
        Some(2025).

        Confirming every part of the pipeline (the closure-
        based filter, the plain iterator chains and the custom iterator)
        all correctly picked up the new data with no other code changes.

   4. Command: In total_matching's filter line, change matches(*t) to
        just matches(t) (removing the dereference).

        Then run cargo build.

        Expected output: A compile error, the closure parameter `t` inside
        filter is of type &&Transaction (a reference to the iterator's
        &Transaction item), while `matches` expects exactly &Transaction;
        removing the deref leaves a type mismatch the compiler reports
        directly.

        Revert this change afterward.
   ```

3. **Hard - Smart Pointers: A Shared, Mutable Account.**

   **What you practice:**
   - Wrapping a struct in `Rc<RefCell<T>>` so multiple independent parts of a program can share real, mutable access to the same underlying data
   - Cloning an `Rc` and observing that it increases a reference count rather than duplicating the underlying data
   - Calling `.borrow()`/`.borrow_mut()` through a shared `&self` method, and understanding why that's only possible because `RefCell` checks borrow rules at runtime instead of compile time
   - Deliberately triggering, reading, and understanding a `RefCell` runtime borrow-rule panic, and contrasting it directly with Week 6's compile-time ownership errors

   **Requirements:**
   - An `Account` struct holds an owner name and balance, with ordinary `deposit`/`withdraw` methods that take `&mut self`.
   - An `AccountHandle` struct wraps a label (identifying which part of the program it represents) together with an `Rc<RefCell<Account>>`, and exposes `deposit`, `withdraw`, and `print_balance` methods that all take `&self` — despite two of them mutating the account.
   - The program creates two or more `AccountHandle`s that all wrap clones of the _same_ `Rc`, and demonstrates that a deposit or withdrawal made through one handle is immediately visible through every other handle.
   - The program prints `Rc::strong_count` at least three times: right after creation, after cloning it for each handle, and after explicitly dropping one handle — showing the count go up and then back down.
   - The source file includes a commented-out demonstration of holding two simultaneous mutable borrows of the same `RefCell`, along with a comment explaining exactly why uncommenting it causes a runtime panic rather than a compile error.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

        Expected output for the first two lines:

            Rc strong count after creation: 1
            Rc strong count after cloning twice: 3

        (1 for shared_account itself, plus one clone each for teller and
        mobile_app, giving 3 total.)

   2. Command: same run, reading the deposit/withdraw section.

        Expected output:

            [Teller] deposited 50
            [Mobile App] sees balance: 150
            [Mobile App] withdrew 30
            [Teller] sees balance: 120
            [Teller] withdrawal of 1000 REJECTED (insufficient funds)

            [Mobile App] sees balance: 120
        Every balance reported through EITHER handle reflects every change
        made through the OTHER handle — starting at 100, +50 = 150 (seen by
        Mobile App), -30 = 120 (seen by Teller) and the rejected 1000
        withdrawal correctly leaves it at 120 (seen again by Mobile App).

   3. Command: same run, reading the final strong-count line.

        Expected output:

            Rc strong count after dropping one handle: 2

        Down from 3 to 2 — dropping mobile_app dropped its Rc clone, but
        shared_account and teller's clone are both still alive.

   4. Command: apply How to Build Step 5 (uncomment the three lines at
       the bottom of main()), then run cargo run.

        Expected output: Every line from test cases 1 through 3 prints
        completely normally first and only then does the program panic,
        with a message containing the phrase "already borrowed".

        Since first_borrow (from the first .borrow_mut() call) is still
        alive and in scope when the second .borrow_mut() call executes.

        Confirm the process exits with a non-zero status (echo $?) after
        the panic.

   5. Command: re-comment those same three lines, then run cargo run
        again.

        Expected output: Identical to test cases 1 through 3, with no
        panic, confirming the project is back in its normal working state.

   6. Command: Change AccountHandle's print_balance method to take
        &mut self instead of &self (leave every call site in main()
        unchanged), then run cargo build.

        Expected output: A compile error at every call site that calls
        print_balance on a plain (non-mut) AccountHandle binding.

        Since teller and mobile_app in main() were never declared with let mut,
        calling a &mut self method on them isn't allowed.

        This confirms RefCell's runtime borrowing is doing real work
        here: the ORIGINAL version's print_balance (correctly using &self,
        then internally calling the RefCell's own .borrow()) is precisely what
        avoids needing every AccountHandle binding in main() to be mut in the
        first place.

        Revert this change afterward.
   ```
