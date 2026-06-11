# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new lifetimes-basics --bin
     cd lifetimes-basics

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Before running anything, read longest's signature next to
   first_word's — one spells out <'a> explicitly, the other doesn't,
   and Concept 3's elision rules are the entire reason why.

4. Build and run it.

   Run:
     cargo run

   You should see all three results printed, with no warnings or
   errors.

5. Temporarily remove <'a> and every 'a from longest's signature only
   (leave the body untouched), so it reads:
     fn longest(x: &str, y: &str) -> &str
   Run cargo build.

   Read the compiler error closely — it names the ambiguity directly:
   it cannot tell whether the returned reference borrows from x or
   from y. Revert this change afterward.

6. Temporarily change longest's body to return a reference to a
   locally-created String instead of x or y:
     fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
         let result = String::from("tie");
         if x.len() == y.len() {
             result.as_str()
         } else if x.len() > y.len() {
             x
         } else {
             y
         }
     }
   Run cargo build.

   Read the compiler error closely — result is owned locally and
   dropped when the function returns, so returning a reference to it
   is exactly the dangling-reference problem from Concept 1. Revert
   this change afterward.
```