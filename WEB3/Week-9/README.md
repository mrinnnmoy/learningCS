# List of things learned.

## 1. What lifetimes solve? (The problem the borrow checker needs a name for)

Week 6 established Rust's ownership rules (one owner, borrow via `&`/`&mut`) and Week 7's smart pointers deliberately sidestepped one piece of that story, its own scoping note said so directly.

_"This week deliberately avoids named lifetime syntax (`'a`) wherever a design choice could go either way... Where a struct in this week's code could have borrowed data instead, it owns a copy instead, specifically to sidestep needing lifetimes before Week 9 gets there properly."_

This week is that promise, paid off.

JavaScript and TypeScript don't have this problem at all.

A garbage collector keeps any object alive for as long as something still references it, full stop.

Rust has no garbage collector (Week 6, deterministic `drop`, no runtime cleanup pass), so it needs a different guarantee.

The compiler must prove, entirely at compile time, that no reference ever outlives the data it points to.

A reference to data that's already gone is called a **dangling reference** and it's exactly the class of bug lifetimes exist to make impossible before your program ever runs.

```rust
fn dangle() -> &String {          // won't compile: missing lifetime specifier
    let s = String::from("hello");
    &s                             // s is dropped when this function ends —
}                                   // this reference would point at freed memory
```

**Lifetimes** are the vocabulary the compiler (and you) use to describe how long a reference is guaranteed to stay valid.

Crucially, a lifetime annotation doesn't control or extend how long anything actually lives, it only _describes_, to the compiler, a relationship that already exists between references, so the borrow checker (Week 6) has enough information to verify it.

This is the same zero-runtime-cost promise Week 7's generics made every lifetime check happens at compile time and vanishes completely by the time your program runs.

---

## 2. Function Signatures. (Lifetime annotation syntax & Where it actually shows up)

A lifetime parameter looks like a generic type parameter (Week 7, Concept 2), but named with an apostrophe, `'a` and declared in the same angle-bracket list:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

Read `<'a>` here as: "for some lifetime `'a`, `x`, `y`, and the return value all share it."

This doesn't force `x` and `y` to have literally identical lifetimes, in practice the compiler picks the _smaller_ of the two overlapping regions and uses that as `'a`.

What it does guarantee is that the reference this function hands back is never valid for longer than the shorter-lived of its two inputs, since the compiler genuinely cannot know, just from reading the function body, whether the returned reference came from `x` or from `y`.

Try removing `<'a>` and the `'a` annotations from `longest`, keeping the body identical and the compiler refuses to guess: it reports a **missing lifetime specifier** error, because "which input does the output borrow from?" is exactly the ambiguity `'a` exists to resolve.

You'll trigger this exact error on purpose in this week's Easy assignment.

---

## 3. Lifetime elision rules. (Why most functions never need `'a` written out)

If every reference-returning function needed explicit lifetimes, virtually all Rust code from Weeks 1 through 8 would have been covered in `'a`s and it wasn't.

The compiler applies three rules first and only asks you to write lifetimes explicitly when these rules leave something ambiguous:

1. **Every elided input reference gets its own lifetime parameter**, implicitly assigned.

2. **If there's exactly one input lifetime**, it's assigned to every elided output lifetime.

3. **If one of the inputs is `&self` or `&mut self`**, `self`'s lifetime is assigned to every elided output lifetime (this rule exists specifically for methods).

```rust
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}
// Elided form the compiler actually sees, via Rule 1 then Rule 2:
// fn first_word<'a>(s: &'a str) -> &'a str
```

`first_word` compiles with zero lifetime syntax because Rule 2 applies cleanly: one input, so the output obviously borrows from it. `longest` (Concept 2) needed an explicit `'a` precisely because it has **two** input references.

Rule 1 gives each its own separate lifetime and no rule exists to pick one of them for the output.

Once you can name which rule applies (or doesn't), "does this function need an explicit lifetime" stops being a guessing game.

---

## 4. Structs with Lifetimes. (Borrowing instead of owning, on purpose)

A struct that holds a reference field must declare a lifetime parameter tying the struct's own validity to the data it borrows.

Exactly the syntax Week 7 deliberately routed around:

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

Read `Excerpt<'a>` as: "an `Excerpt` can never outlive the data `part` borrows from."

The compiler enforces this exactly like Week 6's `&`/`&mut` rules, just applied to the whole struct instance rather than a single local variable, an `Excerpt` cannot be kept alive past the point its source `&str` goes out of scope.

Methods on such a struct usually don't need extra lifetime annotations of their own, Concept 3's Rule 3 (the `&self` rule) covers most method signatures automatically:

```rust
impl<'a> Excerpt<'a> {
    fn part(&self) -> &str {   // elided — Rule 3 assigns self's lifetime here
        self.part
    }
}
```

This week's Medium assignment builds exactly this pattern for real, a struct that parses key-value pairs out of a config string by borrowing slices of it directly, with zero new allocation.

---

## 5. Lifetime bounds on generics.

Week 7's generics (`<T: Asset>`) and this week's lifetimes compose directly.

A bound like `T: 'a` means "whatever type `T` turns out to be, any reference it might contain lives at least as long as `'a`", relevant whenever a generic parameter could itself hold borrowed data.

The sharpest version of this shows up with trait objects (Week 7, Concept 3).

`Box<dyn Asset>` on its own is actually shorthand for `Box<dyn Asset + 'static>`, every trait object is assumed to live for the entire program unless told otherwise.

That default is exactly what blocks a `dyn Asset` from ever wrapping a type that borrows short-lived data:

```
Box<dyn Asset>              means   Box<dyn Asset + 'static>   (the DEFAULT)
Box<dyn Asset + 'a>         means   "this trait object is only guaranteed
                                      to live as long as 'a" — required the
                                      moment the concrete type behind it
                                      borrows anything shorter than 'static
```

This week's Hard assignment hits this directly.

A `BorrowedToken<'a>` (holding a `&'a str` instead of a `String`) genuinely cannot go into a plain `Vec<Box<dyn Asset>>`, the implicit `'static` bound rejects it outright and `Box<dyn Asset + 'a>` is the fix.

---

## 6. The `'static` lifetime. (A lifetime that means "forever")

`'static` is a specific, named lifetime meaning "valid for the entire remaining duration of the program."

String literals are `&'static str` for a very concrete reason: literal text gets baked directly into the compiled binary itself, so it's genuinely alive for as long as the program is running, no borrowing from any stack frame required.

```rust
let s: &'static str = "this text lives inside the compiled binary itself";
```

`'static` is easy to reach for as a way to silence a lifetime error and it's usually the wrong fix.

Slapping `'static` onto something that doesn't actually live forever doesn't make the underlying data live longer, it just makes a promise to the compiler that the _real_ fix (Concept 7, next) should have addressed instead, typically by restructuring ownership (cloning into owned data, or genuinely shortening how long you're trying to hold a borrow) rather than annotating your way past the checker.

---

## 7. Common borrow-checker errors and the fix each one is actually pointing at.

A short catalog worth recognizing on sight, since you'll meet all of these for real in this week's assignments:

- **`missing lifetime specifier`** : The compiler can't tell which input a returned reference borrows from (Concept 2).

  **Fix:** Add an explicit lifetime parameter connecting the relevant input(s) to the output.

- **`X does not live long enough`** / **`borrowed value does not live long enough`** : You're trying to keep a reference alive past the point its source data gets dropped (a dangling reference, Concept 1, or a struct outliving what it borrowed, Concept 4).

  **Fix:** Either shrink the reference's scope to fit inside its source's lifetime, or stop borrowing and own the data instead (clone it).

- **`cannot return value referencing local variable`** : A function tries to hand back a reference to something it created and owns locally, which is dropped the instant the function returns.

  **Fix:** Return an owned value (e.g. `String` instead of `&str`) instead of a reference.

- **`cannot borrow as mutable because it is also borrowed as immutable`** : Week 6's original borrow rule (any number of `&`, or exactly one `&mut`, never both at once), still enforced, just showing up alongside a lifetime that's longer than you expected.

  **Fix:** Shorten the immutable borrow's scope (often just by ending it a few lines earlier) so it doesn't overlap the mutable one.

Every one of these is the compiler refusing to let a dangling or conflicting reference exist, the exact same guarantee from Concept 1, just surfacing through a different specific message depending on which rule caught it.

---

## Assignment.

1. **Easy - Function Lifetimes: Comparing & Announcing.**

   **What you practice:**
   - Writing an explicit `<'a>` lifetime parameter on a function that takes two reference inputs and returns a reference tied to both of them
   - Recognizing, by name, which elision rule lets a different function skip lifetime annotations entirely
   - Triggering, and reading, the `missing lifetime specifier` error on purpose, by removing an annotation the compiler actually needs
   - Triggering, and reading, the `cannot return value referencing local variable` error on purpose, by returning a reference to data owned inside the function itself

   **Requirements:**
   - A `longest<'a>(x: &'a str, y: &'a str) -> &'a str` function returns whichever input string slice is longer, with an explicit lifetime parameter.
   - A `first_word(s: &str) -> &str` function returns the first whitespace-delimited word of its input, with lifetimes fully elided (no `'a` written anywhere in its signature).
   - An `announce_and_return_longest<'a>(x: &'a str, y: &'a str, announcement: &str) -> &'a str` function prints `announcement`, then returns `longest(x, y)`. Note `announcement`'s lifetime is deliberately left out of the shared `'a`, it's never part of the returned value, so it doesn't need to be.
   - The program calls all three functions and prints every result.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:
           Longest: Ethereum
           First word: the
           Announcement: Comparing chains
           Announced longest: Ethereum

   2. Command: Verify by hand.

       "Ethereum" (8 letters) is longer than "Solana" (6 letters),
       matching both printed "longest" results.

       "the" is the first whitespace-delimited word of "the quick
       brown fox", matching first_word's output exactly.

   3. Command: Apply How to Build Step 5 (remove <'a> and every 'a from
       longest's signature, leaving the body unchanged), then run

           cargo build.

       Expected output: A compile error reporting a missing lifetime
       specifier on longest's return type, with the compiler explicitly
       noting it can't tell whether the returned reference is borrowed
       from x or from y.

       Revert this change afterward.

   4. Command: Apply How to Build Step 6 (change longest's body to
       return a reference to a locally-created String), then run

           cargo build.

       Expected output: A compile error reporting that the function
       cannot return a value referencing a local variable (result) —
       result is dropped when longest returns, so any reference to it
       would dangle.

       Revert this change afterward.
   ```

2. **Medium - Structs with Lifetimes: A Zero-Copy Config Parser.**

   **What you practice:**
   - Declaring a struct with a lifetime parameter, tying every instance's validity to the data it borrows from
   - Parsing a string into a struct that borrows slices of the original, instead of allocating new `String`s for each field
   - Proving, with pointer arithmetic, that a "parsed" value is genuinely zero-copy, not just conceptually described as one
   - Triggering, and reading, a `does not live long enough` error caused by a struct instance outliving the data it borrowed from

   **Requirements:**
   - A `KeyValue<'a>` struct holds two `&'a str` fields, `key` and `value`.
   - `KeyValue::parse(line: &'a str) -> Option<KeyValue<'a>>` splits a `"key = value"` line on the first `=`, trims whitespace from both sides, and returns `None` if no `=` is present.
   - The program parses a multi-line config string (at least three `key = value` lines) into a `Vec<KeyValue>`, and prints every pair.
   - The program proves at least one parsed field is a genuine borrow into the original config string (not a fresh allocation), by comparing raw pointer addresses, and prints the result of that check.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:
           rpc_url -> https://api.mainnet-beta.solana.com
           commitment -> confirmed
           cluster -> mainnet-beta

           First value is borrowed directly from `config`: true

   2. Command: verify by hand.

       Each printed pair matches its source line with whitespace trimmed
       from both the key and the value, confirming .trim() ran on both
       sides of the `=` split.

   3. Command: verify the pointer check conceptually.

       `true` confirms value's pointer address falls within config's own
       buffer range — if parse had instead done
       value.to_string().as_str() anywhere, this would print false, since
       that would allocate a brand new String elsewhere in memory rather
       than borrowing config's existing bytes.

   4. Command: apply How to Build Step 5 (add the temporary block that
       tries to keep a KeyValue alive past short_lived's scope), then run

           cargo build.

       Expected output: A compile error reporting that short_lived does
       not live long enough — leaked, declared in the outer scope, would
       outlive the String it borrows from, exactly the struct-outliving-
       its-data problem Concept 4 describes.

       Revert this change afterward.
   ```

3. **Hard - Lifetime Bounds on Trait Objects: Mixing Borrowed & Owned Assets.**

   **What you practice:**
   - Giving a struct a lifetime parameter for one field while it owns its other fields outright, mixing borrowed and owned data in the same type
   - Writing `Box<dyn Trait + 'a>` explicitly and understanding exactly why the implicit `Box<dyn Trait + 'static>` default would reject a borrowing type
   - Reusing Week 7's trait-object pattern (`Vec<Box<dyn Asset>>`, dynamic dispatch) with a real, non-`'static` lifetime running through it
   - Triggering, and reading, the compile error that appears when a borrowing type is forced into a plain, implicitly-`'static` `Box<dyn Trait>`

   **Requirements:**
   - An `Asset` trait (same shape as Week 7's) requires a `symbol` method returning `&str` and a `value` method returning `f64`.
   - A `BorrowedToken<'a>` struct holds `symbol: &'a str` (borrowed) alongside owned `amount: f64` and `price: f64` fields, and implements `Asset`.
   - An `OwnedNft` struct holds only owned fields (`symbol: String`, `estimated_value: f64`) and implements `Asset`.
   - A `most_valuable(assets: &[Box<dyn Asset + '_>]) -> usize` function returns the index of whichever asset has the highest `value()`.
   - The program builds a `Vec<Box<dyn Asset + '_>>` containing at least one `BorrowedToken` and at least one `OwnedNft` together, calls `most_valuable` on it, and prints both the winner and every asset in the collection.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:
           Most valuable: MonkeyJPEG -> 2200.00

           All assets:
           SOL -> 1500.00
           MonkeyJPEG -> 2200.00

   2. Command: verify by hand.

       SOL's value is 10.0 * 150.0 = 1500.00. MonkeyJPEG's value is its
       flat estimated_value, 2200.00. 2200.00 > 1500.00, matching
       most_valuable's printed winner exactly.

   3. Command: apply How to Build Step 5 (change the Vec's declared type
       from Vec<Box<dyn Asset + '_>> to plain Vec<Box<dyn Asset>>), then
       run

           cargo build.

       Expected output: A compile error reporting that BorrowedToken<'_>
       (or the borrowed data symbol_data refers to) may not live long
       enough to satisfy the required 'static bound — confirming that
       Box<dyn Asset> alone really does mean Box<dyn Asset + 'static>,
       and a type borrowing anything shorter-lived than that genuinely
       cannot be coerced into it.

       Revert this change afterward.

   4. Command: Apply How to Build Step 6 (add a second BorrowedToken
       from a second owned String to the assets Vec), then run

           cargo run again.

       Expected output: Four total lines under "All assets:" (or however
       many you added), with most_valuable still correctly identifying
       the single highest-value asset among all of them.

       Confirming most_valuable and the Asset trait required zero changes
       to support an arbitrary number of mixed borrowed and owned assets.
   ```
