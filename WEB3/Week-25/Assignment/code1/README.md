# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the Anchor workspace.

   Run:
     anchor init simple-lst
     cd simple-lst

3. Open Anchor.toml and set [provider].cluster to "devnet".

4. Replace programs/simple-lst/Cargo.toml's [dependencies]/[features]
   and src/lib.rs with the versions in the Solution section below.

5. Build, update declare_id!, rebuild, deploy.

   Run:
     anchor build
     anchor keys list
     anchor build
     anchor program deploy --provider.cluster devnet

6. Set up the TypeScript client.

   Run:
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

7. Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/simple_lst.json into client/.

8. Run it.

   Run:
     npx tsx index.ts

   You should see the pool initialized (or already-initialized), an
   initial stake at a 1:1 rate, a simulated reward, a second stake
   at a now-higher rate, an unstake request, a wait, and a final
   claim.
```

---

# Resources.

```
Program ID: DoFF3AB2mSTQrWQQiNRMPkuqd9EFjHNyghDw4BGys8U1
Metadata: DfaBhAUrG2BYqq3GzbxcsY7mrtqjxkmadfDXg1uodY8F
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-25/Assignment/code1/simple-lst/client$ npx tsx index.ts
Pool initialized: Gv4mkDcKeFk5D8iE6Kyu3zrX5PdSh4dzitoSJafs8uPX

Staking 0.01 SOL...
  Exchange rate: 1.000000 SOL per LST (total staked: 10000000 lamports, LST supply: 10000000)

Simulating a reward of 0.001 SOL (Concept 11's honest stand-in)...
  Exchange rate: 1.100000 SOL per LST (total staked: 11000000 lamports, LST supply: 10000000)

Staking another 0.01 SOL at the now-higher rate...
  Received 9090909 LST for this stake (fewer than the first stake's amount — the rate grew).

Requesting unstake of this stake's LST...
Waiting for the cooldown (Concept 5, compressed to a few seconds for this assignment)...

Claimed. SOL received (net of tx fees): ~0.011275639 SOL
```