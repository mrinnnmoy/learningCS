# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new trading-cards --bin
     cd trading-cards

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read the derive list on Card before running anything — all eight
   derives are doing real work in this one file, not just Debug.

4. Build and run it.

   Run:
     cargo run

   You should see the original/clone printout, the sorted deck, the
   dedup count, and the default card, with no warnings or errors.

5. Temporarily remove Ord and PartialOrd from Card's derive list,
   leaving the deck.sort() call untouched, and run cargo build.

   Read the compiler error carefully — it names the exact trait bound
   that's missing, and points at the .sort() call itself, not at the
   struct definition. Revert the derive list afterward.
```