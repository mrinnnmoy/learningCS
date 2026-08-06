# Tutorial: Two Real, Separate Local Chains and a Relayer Service Project.

Week 36 flagged its own honest simplification directly.

Every bridge model that week ran as two contracts on the _same_ local chain, a relayer's cross-chain action standing in as a second direct call.

This week removes that simplification for real. Two genuinely separate local chains and a real, standalone off-chain service watching one and acting on the other.

## 1. Run two separate `anvil` instances, in two separate terminals, with genuinely different chain IDs.

```
# Terminal 1 — "Chain A"
anvil --port 8545

# Terminal 2 — "Chain B" — a DIFFERENT chain ID, so the two are distinguishable, not just two ports
anvil --port 8546 --chain-id 31338
```

Confirm they're genuinely separate:

```
cast chain-id --rpc-url http://127.0.0.1:8545   # 31337, anvil's own default
cast chain-id --rpc-url http://127.0.0.1:8546   # 31338 — a real, different chain
```

---

## 2. Scaffold a relayer service project.

This is a standalone Node.js/TypeScript service, not a browser app (Week 32) and not a Foundry script.

A real, long-running background process, the same `tsx`-run TypeScript, `ethers@6.17.0` combination this course's own environment has used since Week 26:

```
mkdir bridge-relayer && cd bridge-relayer
npm init -y
npm install ethers@6.17.0
npm install -D typescript tsx @types/node
```

---

## 3. Confirm the relayer project can reach both chains.

With a short sanity script (`src/sanity.ts`):

```typescript
import { ethers } from "ethers";

const providerA = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const providerB = new ethers.JsonRpcProvider("http://127.0.0.1:8546");

const [networkA, networkB] = await Promise.all([
  providerA.getNetwork(),
  providerB.getNetwork(),
]);
console.log("Chain A:", networkA.chainId, "| Chain B:", networkB.chainId);
```

```
npx tsx src/sanity.ts
```

Seeing `31337n` and `31338n` printed separately confirms both connections work and genuinely point at two different chains before Contents and Assignment below build anything real on top.

---
