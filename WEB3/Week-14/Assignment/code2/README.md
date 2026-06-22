# How to Build.

```
1. Start from Easy's already-existing counter-program/ folder (the
   same one you built and deployed in Assignment 1). No new project
   is created for this assignment.

2. Add the dev-dependencies shown in the Solution section below to
   the bottom of Cargo.toml.

3. Create tests/counter_test.rs with the contents from the Solution
   section below.

4. Run the test suite.

   Run:
     cargo test --features no-entrypoint

   The --features no-entrypoint flag matters — without it, the
   entrypoint! macro's generated code (Concept 1) conflicts with the
   native test binary's own allocator/panic-handling, and the build
   fails outright.

5. Time this run against how long Easy's Step 5 (solana program
   deploy) took. This isn't a formal test case, just worth actually
   noticing.
```