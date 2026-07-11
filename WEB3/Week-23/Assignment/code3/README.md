# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold and configure the Anchor workspace, Medium's Steps 1-2
   pattern.

   Run:
     anchor init payment-processor
     cd payment-processor
     # set [provider].cluster = "devnet" in Anchor.toml
     # (this stays devnet — the live client in Step 8 needs a real
     # devnet deployment; the test suite runs against a local
     # validator via a CLI override, same as Week 22's Hard assignment)

3. Replace programs/payment-processor/Cargo.toml's
   [dependencies]/[features] and src/lib.rs with the versions in the
   Solution section below.

4. Build, update declare_id!, rebuild, deploy to devnet.

   Run:
     anchor build
     anchor keys list
     anchor build
     anchor deploy --provider.cluster devnet

5. Create the tests/ folder and file yourself.

   Run:
     mkdir tests

   Then create tests/payment-processor.ts with the version in the
   Solution section below.

6. Install the TS test dependencies at the PROJECT ROOT, set
   skip_local_validator = false and the [scripts] test line, per the
   environment notes above.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

   Edit Anchor.toml:
     skip_local_validator = false

     [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/payment-processor.ts"

7. Run the test suite against a local validator.

   Run:
     anchor test --provider.cluster localnet

8. Set up the TypeScript client (talks to Step 4's devnet
   deployment, unaffected by Step 7's local testing).

   Run:
     cd ..
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

9. Create tsconfig.json and index.ts from the Solution section
   below, copy target/idl/payment_processor.json into client/, and
   run it.

   Run:
     npx tsx index.ts

   You should see a mint (persisted across runs), a payment, its
   Payment record's status, then a refund and the final status.
```

---

# Resources.

```
Program ID: 3Rkdh4CN9z3B8czZARv1dGSkpW9T7Vgozm4UUz8XZQeC
Metadata : 84pe23Fq3ym9C1hvbAScs4gkcGu7z5pucwvKutGRaPmX
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-23/Assignment/code3/payment-processor$ anchor test --provider.cluster localnet
    Finished `release` profile [optimized] target(s) in 0.59s
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.88s
     Running unittests src/lib.rs (/home/mrinnnmoy/projects/learningCS/WEB3/Week-23/Assignment/code3/payment-processor/target/debug/deps/payment_processor-89a628c6cf2acccc)

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/home/mrinnnmoy/projects/learningCS/WEB3/Week-23/Assignment/code3/payment-processor/Anchor.toml"



  payment-processor
    ✔ lets a zero-SOL customer pay via a relayer, rejects a duplicate pay, then refunds once and rejects a second refund (440ms)


  1 passing (450ms)
```

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-23/Assignment/code3/payment-processor/client$ npx tsx index.ts
Mint created: 5AnSqmHxm3LAAmGKb6Be8mrw2xRoTgp8PvCxCW36qRrW
Minted 10,000 tokens to your ATA.

Paying order #1785583855726 for 300 tokens (customer = merchant = relayer = your wallet, self-contained demo)...
Paid.
Payment status: { paid: {} }

Refunded.
Payment status: { refunded: {} }
```