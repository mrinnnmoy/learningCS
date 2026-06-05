# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new simple-ledger --bin
     cd simple-ledger

2. Confirm Cargo.toml matches the previous two assignments, with the
   project name updated.

   See the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read transfer() first, before the rest of the file — it's short,
   and the comment directly above the "contains_key(to)" check
   explains the single most important design decision in this entire
   assignment: checking the destination account exists BEFORE calling
   withdraw. Understanding why that ordering matters is worth more
   than memorizing the rest of the file.

4. Build and run it.

   Run:
     cargo run

   Read the output top to bottom: opening balances, three transfer
   attempts (one that should succeed, one that should fail on
   insufficient funds, one that should fail on a missing account), and
   a final direct lookup of a nonexistent account.

5. Confirm the "no partial transfer" guarantee by hand.

   After Transfer 3 in the output (alice attempting to send funds to
   nonexistent "carol"), confirm alice's printed balance is exactly
   the same both immediately before and immediately after that failed
   transfer — nothing should have been silently deducted.

6. Break the safety check on purpose, to see why it was needed.

   Comment out the three lines that check
   "if !self.balances.contains_key(to) { ... }" at the top of
   transfer(), then run cargo run again. Watch alice's balance in the
   "Transfer 3" section: it now decreases even though the transfer as
   a whole still fails — money was withdrawn from alice with nowhere
   valid for it to go. Revert this change afterward; this is the exact
   bug the check exists to prevent.
```