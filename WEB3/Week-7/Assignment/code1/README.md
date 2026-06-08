# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new asset-portfolio --bin
     cd asset-portfolio

2. Confirm Cargo.toml matches the Solution section below.

   See the Solution section below — this is the same [package] shape
   as every previous Rust project this course, just with the name
   updated.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read the comments directly above total_value and total_value_dyn
   before running anything — they're this assignment's actual point:
   one function gets specialized per type at compile time, the other
   decides which method to call at runtime via a vtable.

4. Build and run it.

   Run:
     cargo run

   You should see the generic-version total printed first, followed by
   a per-asset breakdown and the mixed-portfolio total, with no
   warnings or errors.

5. Try adding a third concrete Asset type.

   Define a small third struct (e.g. a Stake { symbol: String,
   staked_amount: f64 } whose value() just returns staked_amount),
   implement Asset for it, add one instance to mixed_portfolio's vec!
   literal, and re-run cargo run. Confirm the mixed total increases by
   exactly that new instance's value, and that total_value (the
   generic, non-dyn version) still compiles unchanged — it never had
   to know a third type would exist.
```