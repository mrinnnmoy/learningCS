# How to Build.

```
1. Start from Easy's already-existing simple-lst/ folder.

2. Create the tests/ folder and file yourself.

   Run:
     mkdir tests

   Then create tests/simple-lst.ts with the version in the Solution
   section below.

3. Install the TS test dependencies, tsconfig.json file at the PROJECT ROOT and apply
   the environment notes above.

   Edit tsconfig.json:
    "types": [
            "node",
            "mocha"
        ],

    "include": [
        "tests/**/*.ts",
        "target/types/**/*.ts"
    ]

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

   Edit Anchor.toml:
     skip_local_validator = false

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/simple-lst.ts"

4. Run the test suite against a local validator.

   Run:
     anchor build
     anchor test --provider.cluster localnet
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-25/Assignment/code2/simple-lst$ anchor test --provider.cluster localnet
    Finished `release` profile [optimized] target(s) in 0.44s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.60s
     Running unittests src/lib.rs (/home/mrinnnmoy/projects/learningCS/WEB3/Week-25/Assignment/code2/simple-lst/target/debug/deps/simple_lst-31e38abb08c95a3d)

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/home/mrinnnmoy/projects/learningCS/WEB3/Week-25/Assignment/code2/simple-lst/Anchor.toml"



  simple-lst
    ✔ gives a later staker fewer LST at a grown rate, and records the full grown redemption value in the unstake ticket (420ms)


  1 passing (424ms)
```