# Tutorial: Installing Chainlink and Pyth's Real Solidity SDKs.

This week reads REAL, live, already-deployed third-party oracle infrastructure on Sepolia.

The first time this course consumes a real external protocol's own contracts rather than deploying everything itself.

Two new dependencies, on top of everything already installed since Week 27.

## 1. Install Chainlink's contracts.

The standard, Foundry-friendly path is a mirror maintained specifically for this purpose, not the raw npm package:

```
forge install smartcontractkit/chainlink-brownie-contracts --no-commit
echo '@chainlink/contracts/=lib/chainlink-brownie-contracts/contracts/' >> remappings.txt
```

---

## 2. Install Pyth's Solidity SDK.

```
forge install pyth-network/pyth-sdk-solidity --no-commit
echo '@pythnetwork/pyth-sdk-solidity/=lib/pyth-sdk-solidity/' >> remappings.txt
```

---

## 3. For Medium's own live pull-update flow, add Pyth's official off-chain client.

To a small companion TypeScript project (the same `tsx`/`ethers` pattern Weeks 32 and 37 already established):

```
npm install @pythnetwork/hermes-client ethers@6.17.0
npm install -D typescript tsx @types/node
```

---

## 4. A real, current-as-of-this-week detail worth confirming rather than assuming.

Chainlink's own Sepolia ETH/USD feed address, `0x694AA1769357215DE4FAC081bf1f309aDC325306`, is confirmed directly from Chainlink's own current documentation.

Pyth's own exact Sepolia contract address changes across networks and over time more often than Chainlink's do.

Confirm the current one directly at `https://docs.pyth.network/price-feeds/contract-addresses` before Medium's own assignment, rather than trusting a hardcoded value here that could have drifted.

```
As of 17/08/26,  and will be upgrading on August 26, 2026 at 16:00 UTC.

Ethereum Sepolia:
- Current Address : 0xDd24F84d36BF92C65F92307595335bdFab5Bbd21
- Upgraded Address : 0xBb86bCc951A62DF86826219d9251Ee05F2c1e286
```

---
