# How to Build.

```
1. Create a new Cargo binary project.

   Run:
     cargo new config-parser --bin
     cd config-parser

2. Confirm Cargo.toml matches the Solution section below.

3. Replace the entire contents of src/main.rs with the version in the
   Solution section below.

   Read KeyValue<'a>'s definition alongside Concept 4 before running
   anything — key and value are &'a str fields, not Strings, meaning
   parsing never allocates.

4. Build and run it.

   Run:
     cargo run

   You should see every parsed key/value pair printed, followed by a
   line confirming the zero-copy pointer check, with no warnings or
   errors.

5. Add a temporary block to main() that tries to keep a KeyValue alive
   after the String it borrowed from is dropped:
     let leaked;
     {
         let short_lived = String::from("temp = value");
         leaked = KeyValue::parse(&short_lived);
     }
     println!("{:?}", leaked.map(|kv| kv.key));
   Run cargo build.

   Read the compiler error closely — short_lived is dropped at the end
   of the inner block, but leaked (declared outside it) tries to hold
   a KeyValue that borrows from it. Revert this change afterward.
```