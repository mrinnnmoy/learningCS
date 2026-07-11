# How to Build.

```
1. Scaffold the Anchor workspace.

   Run:
     anchor init subscription-vault
     cd subscription-vault

2. Replace programs/subscription-vault/Cargo.toml's
   [dependencies]/[features] and src/lib.rs with the versions in the
   Solution section below.

3. Create the tests/ folder and file yourself.

   Run:
     mkdir tests

   Then create tests/subscription-vault.ts with the version in the
   Solution section below.

4. Install the TS test dependencies at the PROJECT ROOT, and apply
   the environment notes above: skip_local_validator = false, the
   [scripts] test line pointed at mocha + tsx with an explicit path,
   and a root tsconfig.json with "types": ["mocha", "node"].

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

   Edit Anchor.toml:
     skip_local_validator = false

     [provider]
     cluster = "localnet"

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/subscription-vault.ts"
    
    Edit tsconfig.json:
     "types": [
            "node",
            "mocha"
        ],

     "include": [
        "tests/**/*.ts",
        "target/types/**/*.ts"
    ]

5. Run the test suite against a local validator.

   Run:
     anchor build
     anchor test --provider.cluster localnet
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-23/Assignment/code2/subscription-vault$ anchor test --provider.cluster localnet
    Finished `release` profile [optimized] target(s) in 0.27s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.29s
     Running unittests src/lib.rs (/home/mrinnnmoy/projects/learningCS/WEB3/Week-23/Assignment/code2/subscription-vault/target/debug/deps/subscription_vault-b1715203efc5ac60)

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/home/mrinnnmoy/projects/learningCS/WEB3/Week-23/Assignment/code2/subscription-vault/Anchor.toml"



  subscription-vault
    ✔ rejects an early charge, then succeeds after the period elapses, then rejects again immediately (3462ms)


  1 passing (3s)

```