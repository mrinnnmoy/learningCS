# How to Build.

```
1. Scaffold the Anchor workspace.

   Run:
     anchor init counter-events
     cd counter-events

2. Replace programs/counter-events/Cargo.toml's
   [dependencies]/[features] and src/lib.rs with the versions in the
   Solution section below.

3. Create the tests/ folder and file yourself.

   Run:
     mkdir tests

   Then create tests/counter-events.ts with the version in the
   Solution section below.

4. Install the TS test dependencies at the PROJECT ROOT, and apply
   the environment notes above.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai @types/node

    Create tsconfig.json & add:
    "include": [
        "tests/**/*.ts",
        "target/types/**/*.ts"
    ]

    "types": [
            "node",
            "mocha"
        ],

   Edit Anchor.toml:
     skip_local_validator = false

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/counter-events.ts"

5. Run the test suite against a local validator.

   Run:
     anchor build
     anchor test --provider.cluster localnet
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-24/Assignment/code2/counter-events$ anchor test --provider.cluster localnet
    Finished `release` profile [optimized] target(s) in 0.49s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.64s
     Running unittests src/lib.rs (/home/mrinnnmoy/projects/learningCS/WEB3/Week-24/Assignment/code2/counter-events/target/debug/deps/counter_events-09677be3dc7d6410)

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/home/mrinnnmoy/projects/learningCS/WEB3/Week-24/Assignment/code2/counter-events/Anchor.toml"

(node:42099) ExperimentalWarning: SQLite is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)


  counter-events
    ✔ captures every increment live via addEventListener, with idempotent writes (2681ms)


  1 passing (3s)
```
