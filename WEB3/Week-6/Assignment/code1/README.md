# How to build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new token-balance --bin
     cd token-balance

   This scaffolds Cargo.toml and a src/main.rs containing a placeholder
   "Hello, world!" program — you'll replace the contents of main.rs
   entirely in the next step.

2. Confirm Cargo.toml matches the Solution section below.

   cargo new fills in the [package] section (name, version, edition)
   automatically based on today's installed toolchain — open it and
   confirm edition = "2024" specifically, adjusting it if your
   installed Cargo defaulted to an older edition.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read through every function before running anything. Pay particular
   attention to the difference between print_owner's and
   take_ownership_demo's parameter types (&String vs String) — that
   one difference is this entire assignment's core lesson.

4. Build and run it.

   Run:
     cargo run

   You should see the owner's name, the total, and five step-by-step
   balance lines, with no warnings or errors.

5. Deliberately break it, on purpose, to see the ownership error.

   Uncomment the two lines at the bottom of main() (the
   take_ownership_demo(transactions); line and the println! line
   directly below it), then run:
     cargo build

   Read the full compiler error rustc prints — it names the exact
   variable, the exact line where it was moved, and the exact line
   where you tried to use it afterward. This level of detail in error
   messages is one of Rust's most distinctive practical features.

6. Fix it back.

   Re-comment those same two lines so the project builds cleanly
   again, then confirm with:
     cargo run
```