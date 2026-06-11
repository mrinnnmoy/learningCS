# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new bounded-assets --bin
     cd bounded-assets

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read the comments directly above BorrowedToken and
   most_valuable's signature before running anything — the `+ 'a`
   on Box<dyn Asset + 'a> is this assignment's actual point, not a
   stylistic choice.

4. Build and run it.

   Run:
     cargo run

   You should see the winning asset printed first, followed by every
   asset in the collection, with no warnings or errors.

5. Temporarily change the Vec's declared type in main() from
   Vec<Box<dyn Asset + '_>> to plain Vec<Box<dyn Asset>>, leaving
   everything else unchanged. Run cargo build.

   Read the compiler error closely — Box<dyn Asset> alone means
   Box<dyn Asset + 'static>, and BorrowedToken<'a> (borrowing from
   symbol_data, which is not 'static) cannot satisfy that. Revert
   this change afterward.

6. Add a second BorrowedToken, built from a second, separate owned
   String, to the assets Vec. Make no changes to most_valuable or
   the Asset trait. Re-run cargo run and confirm it now prints four
   assets total (or however many you added), with the winner still
   correctly identified among all of them.
```