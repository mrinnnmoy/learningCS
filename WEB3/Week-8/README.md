# List of things learned.

## 1. What is a derive macro? (Code that writes an `impl` block, before your code even compiles)

> Week 7, Concept 1 already let this slip in passing: `#[derive(Debug)]` _"auto-generates an `impl Debug for YourType` block for you."_ This week makes that mechanism the actual subject.

A **derive macro** is code that runs at compile time, before your crate is actually compiled into machine code.

It takes your struct or enum's definition as input and emits new Rust source, almost always one or more `impl` blocks, that gets spliced into your crate exactly as if you'd typed it yourself.

```rust
#[derive(Debug)]
struct Wallet {
    address: String,
    balance: u64,
}
```

expands, before compilation proper begins, into something equivalent to:

```rust
struct Wallet {
    address: String,
    balance: u64,
}

impl std::fmt::Debug for Wallet {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        // generated formatting logic
    }
}
```

TypeScript decorators are the closest cultural analog, annotate a class, attach behavior, but the mechanism is genuinely different.

A _TS decorator_ runs against already-compiled JavaScript, at runtime.

A _derive macro_ runs at **compile time**, generating literal new source code that becomes part of the compiled binary.

There is no runtime cost at all, the generated `impl` is exactly as fast as one you'd hand-written, for the same reason Week 7's generics carry zero runtime cost, by the time your program actually runs, the macro is long gone.

> You've already been using derive macros without naming them. In Week 5's `#[derive(BorshSerialize, BorshDeserialize)]` and Week 6/7's `#[derive(Debug)]`, `#[derive(Clone)]`. This week is about understanding what's actually happening at that moment and by the Hard assignment, writing one yourself.

---

## 2. A tour of the built-in derives.

Each of these unlocks a specific capability your struct or enum wouldn't have otherwise, and each has a small print of conditions attached:

- **`Debug`** : Enables `{:?}` formatting. Requires every field's type to also implement `Debug` (all of Rust's primitive and standard library types do).

- **`Clone`** : Adds a `.clone()` method producing a deep, independent copy. Requires every field's type to also implement `Clone`.

- **`Copy`** : Makes a value duplicate implicitly on assignment/pass, instead of moving (Week 6, Concept 3). Only legal for types made entirely of stack-only data, no `String`, `Vec`, or anything else that owns heap memory, and it requires `Clone` as well.

- **`PartialEq`** / **`Eq`** : Enables `==`/`!=`. `PartialEq` alone is enough for types like `f64`, where two `NaN` values are never equal to each other, even themselves. Adding `Eq` is a promise that equality is fully reflexive (every value equals itself), which is required before a type can be used as a `HashMap`/`HashSet` key.

- **`PartialOrd`** / **`Ord`** : Enables `<`, `>` and `.sort()`. For a struct, comparison proceeds field-by-field in **declaration order**, the first field is compared first and later fields only get compared to break ties.

- **`Default`** : Adds a `Self::default()` constructor, using each field type's own default (`0` for numbers, `""` for `String`, empty for `Vec`).

- **`Hash`** : Makes a value usable as a `HashMap`/`HashSet` key. Almost always derived alongside `Eq`, since a `HashMap` needs both, "which bucket does this go in" (`Hash`) and "is this the same key I already have" (`Eq`), and they need to agree with each other on what "equal" means.

```rust
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default, Hash)]
struct Card {
    power: u32,
    name: String,
}
```

None of this is new syntax, just seven new trait `impl`s, generated instead of hand-written, exactly Concept 1's mechanism, seven times over.

---

## 3. Declarative vs. Procedural. (The wider macro landscape)

Rust actually has two entirely different macro systems and derive macros are only one corner of one of them:

- **Declarative macros** (`macro_rules!`) work by pattern-matching against the token trees you pass them, similar in spirit to a `match` expression (Week 6, Concept 5), but matching against _code shapes_ instead of values. `vec![1, 2, 3]` is a declarative macro; it's not a real function; there's no way to call a function with that trailing-comma, bracketed syntax.

- **Procedural macros** are different, instead of pattern-matching, they're ordinary Rust functions that take a stream of tokens as input and programmatically build a new stream of tokens as output, using real Rust code (loops, conditionals, helper functions) to decide what to generate. There are three flavors:

```
#[derive(Describe)]        <- DERIVE macro: reads a type definition,
struct Foo { .. }             adds new impl block(s) alongside it

#[my_attribute]             <- ATTRIBUTE macro: can rewrite the
fn foo() { .. }                 item it's attached to, not just add to it

my_macro!(foo, bar, baz)    <- FUNCTION-LIKE macro: called like a
                                function, but runs arbitrary compile-time
                                logic over its own custom input syntax
```

This week's own two custom macros (Medium and Hard) are both the first kind, derive macros, the most common of the three by far and the one Anchor leans on hardest (Concept 6).

---

## 4. How a custom derive macro actually works. (`TokenStream`, `syn` and `quote`)

A derive macro lives in its own special kind of crate (`[lib] proc-macro = true` in `Cargo.toml`) and exports a function shaped like this:

```rust
#[proc_macro_derive(Describe)]
pub fn derive_describe(input: TokenStream) -> TokenStream {
    // ...
}
```

`TokenStream` is, quite literally, the raw sequence of tokens the compiler sees for whatever you annotated, unparsed, unstructured, closer to a list of lexer output than to a struct definition you could inspect field-by-field.

```
Your source code                 syn::parse_macro_input!            quote! { ... }
struct Token {          ---->    turns raw tokens into      ---->   builds a NEW TokenStream,
  symbol: String,                a structured DeriveInput           interpolating values from
  amount: f64,                   (struct name, fields,               the DeriveInput into a
}                                 attributes, all as data)            template-like block

                                                                      returned TokenStream is
                                                                      spliced into your crate,
                                                                      as if you'd typed it
```

Two crates do the heavy lifting and virtually every derive macro in the ecosystem (including Serde's, and, later, Anchor's) is built on exactly this pair:

- **`syn`** parses the incoming `TokenStream` into `DeriveInput`, a proper Rust data structure you can pattern-match against, `input.ident` for the type's name, `input.data` for its fields, variants and so on, instead of manually walking raw tokens yourself.

- **`quote`** does the reverse: `quote! { ... }` lets you write what looks like ordinary Rust code directly in your macro, with `#some_variable` interpolating a parsed value (a name, a list of field idents) directly into the generated output. It hands back a `TokenStream` ready to return.

One more detail worth knowing now, so it doesn't seem like a bug later is Rust macros are **hygienic**, a variable name your macro generates internally can't accidentally collide with a variable of the same name in the code that invoked the macro.

You get to generate code freely without worrying about naming clashes with whatever struct you're annotating.

## 5. Attribute macros & Function-like macros. (When derive isn't enough)

A derive macro can only ever **add** something alongside your type, it can never change the struct or enum definition itself.

Sometimes that's not enough:

- **Attribute macros** (`#[my_attribute]`) can rewrite the entire item they're attached to, not just add to it. The most common one you've likely already seen in other people's code, `#[tokio::main]`, actually rewrites an `async fn main()` into an ordinary, synchronous `fn main()` that sets up an async runtime and blocks on your original function internally. A derive macro could never do that, it can only add new code beside your struct, never replace or restructure what you wrote.

- **Function-like macros** (`my_macro!(...)`) are called with function-call syntax, but, like every procedural macro, run real Rust logic over their input at compile time. The key difference from `macro_rules!` (Concept 3): a `macro_rules!` macro can only pattern-match token _shapes_ that already look somewhat Rust-like. A function-like proc macro can parse **any** custom syntax you invent inside those parentheses, since you're writing an actual parser in Rust, not declaring a pattern to match against.

```
derive macro:        adds to a type          (struct stays as-is, gets a new impl beside it)
attribute macro:      can REPLACE a type      (the item itself can be entirely rewritten)
function-like macro:  no type/item required   (works on arbitrary custom input syntax)
```

> This week's assignments stay entirely within derive macros, the most common and most approachable of the three, but recognizing these other two shapes now means Anchor's `#[program]` (an attribute macro, Concept 6) won't look like an unrelated new concept when Week 15 arrives.

---

## 6. Preview. (How exactly Anchor's macros work)

Every one of this week's mechanics reappears, at larger scale, the moment Week 15 introduces the Anchor framework:

- **`#[derive(Accounts)]`** is a custom derive macro, structurally identical in kind to this week's Medium and Hard assignments, that reads a struct's fields (each representing one account a Solana instruction needs) and generates the validation and deserialization code for all of them, instead of you hand-writing it per instruction.

- **`#[program]`** is an attribute macro (Concept 5), it rewrites a plain Rust module into Solana's actual instruction-dispatch logic.

- **`#[account]`** is an attribute macro that marks a struct as Solana account data, wiring it up to Borsh serialization automatically, the exact format Week 5 covered by hand.

- **`#[error_code]`** works like a derive macro over an enum, generating error codes and messages from its variants.

None of this is a new category of magic.

It's `syn`, parsing your struct into a `DeriveInput`; `quote`, generating an `impl` block from it; the exact two crates and the exact mechanism from Concept 4, just aimed at generating Solana-specific boilerplate instead of a `describe()` method.

Having built a smaller version of this yourself this week is exactly what turns Anchor's macros, in Week 15, from "magic annotations" into "oh, I know what this is doing under the hood."

---

## Assignment.

1. **Easy - Built-in Derives: A Trading Card Collection.**

   **What you practice:**
   - Deriving `Debug`, `Clone`, `PartialEq`, `Eq`, `PartialOrd`, `Ord`, `Default`, and `Hash` on a single struct, and understanding exactly what each one unlocks
   - Confirming a derived `Clone` produces a deep, independent copy, not a shared reference
   - Using a derived `Ord` to sort a `Vec`, and a derived `Hash` + `Eq` pair to deduplicate values via a `HashSet`
   - Directly triggering, and reading, the compile error that appears when a derive some code depends on is removed

   **Requirements:**
   - A `Card` struct with a `power: u32` field and a `name: String` field, deriving `Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Default, Hash`, with `power` declared before `name`.
   - The program prints a card with `{:?}`, clones it, mutates only the clone's `power`, and prints both afterward to show they're independent.
   - The program builds a `Vec<Card>` of four differently-powered cards, sorts it in place with `.sort()`, and prints the result.
   - The program builds on that same set of cards, adds one exact duplicate, collects everything into a `HashSet<Card>`, and prints its length, showing the duplicate wasn't counted twice.
   - The program prints `Card::default()`.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   1. Command: cargo run

       Expected output, in this exact order:
           Original: Card { power: 75, name: "Phoenix" }
           Original after clone: Card { power: 75, name: "Phoenix" }
           Cloned (mutated):     Card { power: 85, name: "Phoenix" }

           Sorted deck (ascending by power):
           Card { power: 10, name: "Slime" }
           Card { power: 50, name: "Goblin" }
           Card { power: 65, name: "Griffin" }
           Card { power: 90, name: "Dragon" }

           Cards before dedup: 5, after dedup: 4

           Default card: Card { power: 0, name: "" }

   2. Command: verify the clone behaviour by hand.

       The original stays at power 75 after the clone is bumped to 85 — a
       derived Clone deep-copies every field, so mutating the clone can
       never affect the original.

       If Card were instead wrapped in an Rc (Week 7), both handles would
       have shown 85.

   3. Command: verify the sort and dedup by hand.

       10 < 50 < 65 < 90, matching the printed ascending order exactly.

       The pushed duplicate (power: 90, name: "Dragon") is structurally
       identical to the existing Dragon entry, so derived Hash + Eq
       collapse the 5-item Vec down to 4 unique entries.

   4. Command: apply How to Build Step 5 (remove Ord and PartialOrd from
       Card's derive list, leaving deck.sort() in place), then run
       cargo build.

       Expected output: a compile error at the deck.sort() call, reporting
       that the trait bound `Card: Ord` is not satisfied — confirming
       .sort() only exists on a Vec<T> because T: Ord was derived, not
       because Vec provides it unconditionally.

       Revert this change afterward.
   ```

2. **Medium - Writing a Custom Derive Macro: `#[derive(Describe)]`.**

   **What you practice:**
   - Setting up a proc-macro crate (`[lib] proc-macro = true`) inside a Cargo workspace, separate from the crate that consumes it
   - Parsing a struct's definition into a structured `syn::DeriveInput`, instead of working with raw tokens directly
   - Building new source code with `quote!`, interpolating parsed values (the struct's name and field names) into a generated `impl` block
   - Confirming the generated method exists and works exactly as if hand-written, because after macro expansion, it effectively was

   **Requirements:**
   - A `describe_derive` proc-macro crate exports a `#[proc_macro_derive(Describe)]` function that reads a struct's name and its named fields via `syn`.
   - The macro generates, via `quote!`, an `impl` block adding a `describe() -> String` associated function to the annotated struct, returning the struct's name and a comma-separated list of its field names (not values, just names, this assignment stays at the shape level).
   - A separate `describe_demo` binary crate depends on `describe_derive` via a workspace path dependency, applies `#[derive(Describe)]` to a `Token` struct (fields: `symbol`, `amount`, `price`), and prints `Token::describe()`.
   - The macro panics with a clear message if applied to anything other than a struct with named fields (a tuple struct or an enum).

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   1. Command: cargo run -p describe_demo (from the workspace root)

       Expected output:
           Token { symbol, amount, price }

   2. Command: verify by hand.

       Field names appear in exactly the order they're declared — symbol,
       then amount, then price — confirming the macro walked syn's
       Fields::Named list in declaration order, not any other order.

   3. Command: apply How to Build Step 6 (add an Nft struct, fields
       collection and id, deriving Describe; print Nft::describe() too),
       then run cargo run -p describe_demo again.

       Expected output: a second line, Nft { collection, id }, appearing
       correctly with zero changes to describe_derive itself — confirming
       the macro is genuinely generic over any named-field struct's shape.

   4. Command: temporarily add #[derive(Describe)] to a tuple struct
       anywhere in describe_demo/src/main.rs, e.g.:
           #[derive(Describe)]
           struct Bad(u32, u32);
       Then run cargo build.

       Expected output: a compile error surfacing the macro's own panic
       message ("Describe only supports structs with named fields") at
       the derive invocation — proc-macro panics are reported by the
       compiler as ordinary compile errors, not runtime panics, since the
       macro runs entirely before your program exists as a binary.

       Revert this change afterward.
   ```

3. **Hard - A Custom Derive Meets Traits & Trait Objects: `#[derive(Summary)]`.**

   **What you practice:**
   - Writing a second custom derive macro that generates an `impl` of a hand-written trait, connecting Week 7's traits directly to this week's macros
   - Reading field _values_ (not just field names) out of `self` inside macro-generated code, via `quote!`'s `#(...),*` repetition syntax
   - Using the generated trait implementations exactly as Week 7 used hand-written ones: through a generic function with a trait bound, and through a `Vec<Box<dyn Summary>>` holding multiple distinct concrete types together
   - Directly observing that macro-generated code carries ordinary trait-bound obligations, by adding a field whose type doesn't implement `Debug` and reading the resulting compile error

   **Requirements:**
   - A hand-written `Summary` trait declares one method: `fn summary(&self) -> String`. Naming the trait `Summary` and the derive macro `Summary` is deliberate, not a collision — derive macros and traits live in separate namespaces in Rust, this is the exact same pattern Serde itself uses.
   - A `summary_derive` proc-macro crate exports `#[proc_macro_derive(Summary)]`, generating `impl Summary for <Struct>`, where `summary()` returns the struct's name plus every field's name and its `{:?}` (Debug) representation, joined into one string.
   - Two distinct structs (`Token`: `symbol`, `amount`; `Nft`: `collection`, `id`) derive `Summary`.
   - A generic function `print_summary<T: Summary>(item: &T)` is called once for each concrete type.
   - A `Vec<Box<dyn Summary>>` holds instances of both structs together, and the program iterates it, calling `.summary()` through dynamic dispatch on each.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   1. Command: cargo run -p summary_demo (from the workspace root)

       Expected output, in this exact order:
           Token { symbol: "SOL", amount: 12.5 }
           Nft { collection: "MonkeyJPEG", id: 42 }

           Via Vec<Box<dyn Summary>>:
           Token { symbol: "SOL", amount: 12.5 }
           Nft { collection: "MonkeyJPEG", id: 42 }

   2. Command: verify by hand.

       The first two lines come from calling print_summary<T: Summary>
       once per concrete type — static dispatch, monomorphized per type
       (Week 7, Concept 2).

       The last two lines come from iterating a Vec<Box<dyn Summary>> —
       dynamic dispatch via a vtable (Week 7, Concept 3).

       Same output, two different dispatch mechanisms, both
       resolving to the exact same macro-generated summary().

   3. Command: apply How to Build Step 6 (add a Potion struct with
       fields name: String and healing: u32, deriving Summary, and push
       one instance into the Vec<Box<dyn Summary>> list). Make no changes
       to summary_derive itself. Re-run cargo run -p summary_demo.

       Expected output: a third line in the Vec<Box<dyn Summary>>
       section, Potion { name: "...", healing: N }, confirming the macro
       required zero changes to support a brand new concrete type.

   4. Command: apply How to Build Step 7 (add a metadata: Metadata field
       to Nft, where Metadata is a bare struct with no derives at all —
       struct Metadata { uri: String } — and update every place Nft is
       constructed accordingly). Run cargo build.

       Expected output: a compile error reporting that the trait bound
       `Metadata: Debug` is not satisfied, pointing at the generated
       format!("{}: {:?}", ..., self.metadata) line inside Summary's
       expansion for Nft — confirming that macro-generated code carries
       ordinary trait-bound obligations, exactly like hand-written code;
       the macro never bypasses Rust's checking, it just writes the code
       that gets checked.

       Revert this change afterward.
   ```
