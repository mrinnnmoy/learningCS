# How to Build.

```
1. Run the environment verification commands above.

2. Scaffold the Anchor workspace.

   Run:
     anchor init simple-amm
     cd simple-amm

3. Open Anchor.toml and set [provider].cluster to "devnet".

4. Replace programs/simple-amm/Cargo.toml's [dependencies]/[features]
   and src/lib.rs with the versions in the Solution section below.

5. Build, update declare_id!, rebuild, deploy.

   Run:
     anchor build
     anchor keys list
     # paste the printed address into declare_id!(...) if it differs
     anchor build
     anchor program deploy --provider.cluster devnet

6. Set up the TypeScript client.

   Run:
     mkdir client && cd client
     npm init -y
     npm install @anchor-lang/core @solana/web3.js @solana/spl-token bn.js
     npm install -D typescript tsx @types/node @types/bn.js

7. Create tsconfig.json and index.ts from the Solution section below,
   and copy target/idl/simple_amm.json into client/.

8. Run it.

   Run:
     npx tsx index.ts

   You should see two mints, a pool initialization, a liquidity
   deposit, a swap with its quoted-vs-actual rate printed, and a
   final caught error from the deliberately-too-strict second swap.
```

---

# Resources.

```
Program ID: DhMBsKqY7iuu96xMjxPccZQ4wxiuqjXY1SXGUXxaprjv
Metadata: 72JoEHyvyANx7KDy2PgRxCUrHj5cZgC7fwpGmSDKnAHd
```

---

# Output.

```
mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-22/Assignment/code1/simple-amm/client$ npx tsx index.ts
Mints created: FdPPGHfvyLaPTPe4miuKyCUfBgqhPR1EAaVCbebzyJ7g 7cHSzfpc3XTTawfeBx6YvopmAGfJvuwLKaoauTV7TTZf
Minted starting balances of A and B.
Pool initialized: B4Tuz1jtqHw7XvZtEsTzGVAfn7RzZuVHaBsDiqAZsyXU
Added 1,000,000 / 1,000,000 initial liquidity.

Pre-swap pool rate (B per A): 1.0000
Swapped 50,000 A. Actual rate received: 0.9497 (Concept 3's price impact vs the quoted 1.0000)

Caught expected slippage rejection: SlippageExceeded, as expected.
```
