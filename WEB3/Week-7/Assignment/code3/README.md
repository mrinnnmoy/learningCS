# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new shared-account --bin
     cd shared-account

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read AccountHandle's deposit method first: self.account.borrow_mut()
   is what actually allows a method taking only &self to mutate the
   Account underneath — this single line is this entire assignment's
   central idea. Everything else in the file exists to demonstrate it
   from a few different angles.

4. Build and run it.

   Run:
     cargo run

   You should see the strong count printed after creation (1), after
   cloning twice (3), a sequence of deposits/withdrawals visible across
   both handles, and the strong count again after dropping one handle
   (2) — with no warnings, errors, or panics, since the risky
   double-borrow demonstration starts out commented out.

5. Deliberately trigger the RefCell panic, on purpose.

   Uncomment the three lines at the bottom of main() (the two
   .borrow_mut() lines and the println! below them), then run:
     cargo run

   Read the panic message rustc's runtime prints — it should describe
   the value as already being borrowed. Unlike Week 6's ownership
   errors, this failure happens while the program is RUNNING (the
   first several lines of output still print normally before the
   panic), not while it's being compiled.

6. Fix it back.

   Re-comment those same three lines so the project runs cleanly
   again, then confirm with:
     cargo run
```
