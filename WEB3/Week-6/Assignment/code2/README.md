# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new account-model --bin
     cd account-model

2. Confirm Cargo.toml matches Easy's, with the project name updated.

   See the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read apply() closely before running anything: notice each match arm
   immediately re-binds `amount` to a plain i64 with
   let amount = *amount;, rather than working with the reference
   match ergonomics hands you directly. This keeps the rest of each
   arm's arithmetic (self.balance += amount, and so on) simple i64-to-
   i64 arithmetic with nothing to dereference by hand later in the
   block.

4. Build and run it.

   Run:
     cargo run

   You should see the starting account, five lines (one per applied
   operation) each showing the operation and its outcome, and the
   final account state — with no warnings or errors.

5. Try adding a sixth operation.

   Add Operation::Deposit(0) to the end of the operations vec! in
   main(), then run cargo run again. Confirm it's reported as an
   invalid amount, the same way Operation::Deposit(-10) already is —
   this checks that your apply() method's "amount <= 0" check, not
   just "amount < 0", is doing the rejecting.
```