# How to Build.

```
1. Start from Easy's already-existing simple-amm/ folder.

2. Create the tests/ folder and file yourself — Anchor 1.1.2's
   default scaffold doesn't create either.

   Run:
     mkdir tests

   Then create tests/simple-amm.ts with the version in the Solution
   section below.

3. Install the TS test dependencies at the PROJECT ROOT (not
   client/), and set up Anchor.toml to run this test suite against a
   LOCAL validator, not devnet, this test needs repeatable,
   from-genesis reserve numbers to compute IL accurately.

   Also don't forget to add tsconfig.json file.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

   Edit Anchor.toml:
     skip_local_validator = false

     [provider]
     cluster = "localnet"

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/simple-amm.ts"

    Edit tsconfig.json:
     "types": [
            "node",
            "mocha"
        ],

     "include": [
        "tests/**/*.ts",
        "target/types/**/*.ts"
    ]



4. Run the test suite (no --skip-deploy — a local validator needs to
   build, deploy fresh, test, then tear down every run).

   Run:
     anchor build
     anchor test --skip-deploy
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-22/Assignment/code2/simple-amm$ anchor test
    Finished `release` profile [optimized] target(s) in 0.32s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.29s
     Running unittests src/lib.rs (/home/mrinnnmoy/projects/learningCS/WEB3/Week-22/Assignment/code2/simple-amm/target/debug/deps/simple_amm-3d69408cd35c2731)

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/home/mrinnnmoy/projects/learningCS/WEB3/Week-22/Assignment/code2/simple-amm/Anchor.toml"



  simple-amm
Price moved from 1.0000 to 0.4444 (k = 0.4444)
Actual value ratio (LP / hold):   0.923076
Closed-form IL ratio (2√k/(1+k)): 0.923077
    ✔ quantifies impermanent loss against the closed-form formula (593ms)


  1 passing (610ms)
```
