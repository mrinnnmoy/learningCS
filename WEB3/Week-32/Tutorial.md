# Tutorial: Scaffolding a Minimal Browser Dapp with Vite and `ethers.js`.

Everything up through Week 31 ran from a terminal:

- `forge`,
- `cast`,
- `hardhat`,
- scripts and tests,

never an actual web page.

This week's whole point is the other side of that.

Real browser code, a real wallet extension and a real human clicking _"Confirm"_ in a popup, none of which `forge test` (Week 31) can script or verify automatically.

Every Manual Test Case below is a literal browser action with an expected on-screen or console result, not a CLI command.

The honest shape of this week's own material, not a step backward from Week 30's testing discipline.

## 1. Scaffold a Vite project.

Vite is a fast, near-zero-config dev server and bundler, the standard modern choice for a small TypeScript-based frontend.

A genuinely different kind of tool from anything used since Week 26, worth its own short setup pass:

```
npm create vite@latest wallet-adapter -- --template vanilla-ts
cd wallet-adapter
npm install
```

---

## 2. Install `ethers`, pinned to the same version this course has used since Week 26.

```
npm install ethers@6.17.0
```

---

## 3. Confirm the dev server runs.

```
npm run dev
```

Opening the printed local URL (typically `http://localhost:5173`) in a browser should show Vite's own default starter page.

That's the sanity check, confirming Node, Vite and the browser toolchain are all working before Contents and Assignment below replace that starter page with real wallet code.

---

## 4. Install MetaMask, if it isn't already & add a local test account.

This week's Easy and Medium assignments run against `anvil` (already installed since Week 27), which MetaMask needs to be told about as a custom network:

- MetaMask → Networks → Add a network manually
- Network name: `Anvil Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

Then import one of `anvil`'s own well-known default accounts as a MetaMask test wallet (Account menu → Import Account → paste a private key).

Account 1's key, `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`, copied in full, is a safe, standard choice, the same account every previous week's own CLI work has already used, worth zero outside a local chain.

---
