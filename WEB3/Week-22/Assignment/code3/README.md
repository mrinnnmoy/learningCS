# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold and configure the Anchor workspace, Easy's Steps 2-3.

   Run:
     anchor init perp-market
     cd perp-market
     # set [provider].cluster = "devnet" in Anchor.toml
     # (this stays devnet — the live client in Step 9 needs a real
     # devnet deployment; the test suite in Step 6 runs against a
     # separate local validator via a CLI override, not by editing
     # this file, the same approach Week 20's Hard assignment used)

3. Replace programs/perp-market/Cargo.toml's [dependencies]/[features]
   and src/lib.rs with the versions in the Solution section below.

4. Build, update declare_id!, rebuild, deploy to devnet.

   Run:
     anchor build
     anchor keys list
     anchor build
     anchor program deploy --provider.cluster devnet

5. Create the tests/ folder and file yourself.

   Run:
     mkdir tests

   Then create tests/perp-market.ts with the version in the Solution
   section below.

6. Install the TS test dependencies at the PROJECT ROOT, set the
   [scripts] test line to mocha + tsx, then run the suite against a
   LOCAL validator via a CLI override (Anchor.toml's [provider]
   stays on devnet, untouched, for Step 9's client).

   Also don't forget to add tsconfig.json file.

   Run:
     npm install --save-dev @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install --save-dev mocha tsx chai @types/mocha @types/chai

   Edit Anchor.toml:
    skip_local_validator = false

    [provider]
     cluster = "localnet"

    [scripts]
     test = "NODE_OPTIONS='--import tsx' npx mocha -t 1000000 tests/perp-market.ts"

7. Run the test suite against a fresh local validator.

   Run:
     anchor test

  Make sure you revert back the changes you made to Anchor.toml after a successful test.

  Edit Anchor.toml:
    skip_local_validator = true

    [provider]
     cluster = "devnet"

8. Set up the TypeScript client (talks to Step 4's devnet deployment,
   entirely independent of Step 7's local testing).

   Run:
     cd ..
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

9. Create tsconfig.json and index.ts from the Solution section below,
   copy target/idl/perp_market.json into client/, and run it.

   Run:
     npx tsx index.ts

   You should see a mint (persisted across runs), a market
   initialization (or "already initialized"), an opened position, a
   funding settlement, and a closed position with its final PnL.
```

---

# Resources.

```
Program ID: 6F1tcqNj6opfNfRkxBxZEbsQPvcrhaHM79gGJhebhDhu
Metadata: F6assd9pP79nvsDjuShAK57UcA1Aeq5VaAuekhsPiJcG
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-22/Assignment/code3/perp-market/client$ npx tsx index.ts
Mint created: CDeWGfjQ5K2y1vxFFV6EEm8Mkya2r6dLNLruZvVnpenA
Minted 10,000 collateral tokens to your ATA.
Market initialized: Ed4awm1wvu3ZBdfpvkfJpjZBvgSP7fgn31H7M2ZPzH7Q
Position opened: collateral 500, size 10.
Waiting a few seconds before settling funding, so elapsed time is nonzero (Concept 9)...
Funding settled. Collateral after funding: 500

Position closed. Final ATA balance: 10000
```