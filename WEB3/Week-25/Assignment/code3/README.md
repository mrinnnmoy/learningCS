# How to Build.

```
1. Confirm Easy's `simple-lst/client/pool-info.json` exists (run Easy's
   client at least once first if it does not) and that the deployed
   pool has a real LST supply, so there is a real exchange rate to
   compare against.

2. Scaffold the Anchor workspace.

   Run:
   anchor init instant-unstake-pool
   cd instant-unstake-pool

   set [provider].cluster = "devnet" in Anchor.toml

3. Copy Week 22 Easy's `simple-amm/programs/simple-amm/src/lib.rs`
   into this project's program and update only the program name,
   module name, and `declare_id!`.

   The AMM instructions (`initialize_pool`, `add_liquidity`,
   `remove_liquidity`, and `swap`) remain unchanged because the same
   constant-product formula is reused for the LST swap.

4. Build, update program ID, rebuild, and deploy.

   Run:
   anchor build
   anchor keys list
   anchor build
   anchor program deploy --provider.cluster devnet

5. Set up the TypeScript client.

   Run:
   mkdir client && cd client
   npm init -y
   npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
   npm install -D typescript tsx @types/node @types/bn.js

6. Create `tsconfig.json` and `index.ts` from the Solution section
   below, copy `target/idl/instant_unstake_pool.json` into `client/`,
   and run it.

   Run:
   npx tsx index.ts

   You should see Easy's current LST exchange rate, the AMM pool being
   initialized and seeded at the fair price, an instant-unstake swap,
   and the final comparison between AMM received value, fair redemption
   value, and the measured depeg percentage.
```

---

# Resources.

```
Program ID: C1UUig4375m6ReDbrjeJQkGJw4Jayhn3dnhJuRu7jnTu
Metadata: Ebxkbeeed9HM3qJ8bzvtrMtxv2CukcBSDAvxuvQ8YXqy
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-25/Assignment/code3/instant-unstake-pool/client$ npx tsx index.ts
Simple-LST fair exchange rate: 1.222496 lamports/LST
Fake liquidity token: AAjec2cxH7ZxJzbfeFN3DDsq6vzcmLqqYx7kZi8SdtjK
Initializing AMM pool...
Pool initialized: FFisiomJdyWLjxEZqHCJkfWox2xFFJCpNnfGU9GMxZY5
Adding liquidity 1000000 LST : 1222496 token

Instant Unstake Result
----------------------
AMM received: 110833
Fair value: 122250
Depeg: 9.34%
```
