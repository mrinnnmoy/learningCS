# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new transaction-pipeline --bin
     cd transaction-pipeline

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read RunningBalance's next() method closely before running
   anything: it returns None once index reaches the end, which is
   what tells a for loop (or .last(), or .collect()) to stop — this
   single method is the entire contract a type needs to fulfil to
   become a fully-featured Rust iterator.

4. Build and run it.

   Run:
     cargo run

   You should see total deposits, total withdrawals, the groceries-
   only total, five running-balance lines, and a final balance printed
   via .last() on a separate instance — with no warnings or errors.

5. Compare this against Week 6.

   Open Week 6 Easy's print_running_balance function side by side with
   this week's RunningBalance struct. Both compute the exact same
   sequence of values from the exact same kind of input — one as a
   function that immediately prints everything with no way to pause or
   reuse the sequence elsewhere, the other as a genuine, reusable
   iterator you could just as easily .collect() into a Vec, sum, or
   pass into any other function expecting an Iterator.
```
