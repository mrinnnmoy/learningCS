# Tutorial: Setting Up Hardhat 3, From Scratch (Alongside Foundry).

Foundry's already fully set up from Week 27 onward, nothing to redo there.

This week adds Hardhat as a genuinely separate, independent toolchain, not a replacement, so every assignment below builds the _same_ contract on both, from scratch, side by side.

Worth flagging up front since it trips up a lot of existing tutorials found online.

Hardhat 3 (current as of this week) is a complete rewrite of Hardhat 2, ESM-first config, a new Rust-based local network (EDR, replacing what older material calls "Hardhat Network"), and a genuinely different plugin/config shape.

If a guide's `hardhat.config.js` uses `require`/`module.exports` and `hardhat-waffle`, it's describing Hardhat 2, not what gets installed below.

## 1. Confirm Node.js is new enough.

Hardhat 3 requires Node.js v22.13.0 or later:

```
node --version
```

If that's below `v22.13.0`, upgrade via `nvm` (or your platform's usual Node version manager) before continuing. Hardhat's own install will fail in confusing ways on an older Node otherwise.

---

## 2. Scaffold a fresh npm project & let Hardhat's own installer set everything up.

```
mkdir counter-hardhat && cd counter-hardhat
npm init -y
npx hardhat init
```

`npx hardhat init` walks through a short interactive setup.

Choosing the defaults (TypeScript, the Ethers + Mocha toolbox) creates a working project and installs every dependency it needs automatically:

- `hardhat.config.ts`,
- a `contracts/` folder,
- a `test/` folder and
- an `ignition/modules/` folder for deployments (Concept 5 covers what that last one actually does).

Some Hardhat release notes and community guides call this same flag `--init` instead of `init`. Both exist, `init` is what the current official getting-started guide uses, treat either as correct if one doesn't work for your exact installed version.

---

## 3. Confirm the install with a sanity compile.

```
npx hardhat compile
```

A clean compile of the sample project confirms Node, Hardhat itself and the bundled `solc` are all working before Contents and Assignment below touch anything real.

---

## 4. Note the config shape, since it looks genuinely different from most existing tutorials.

`hardhat.config.ts` is an ES module now, plugins are imported and listed explicitly rather than registered by installing them:

```typescript
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: "0.8.36",
});
```

This week's assignments pin `solidity: "0.8.36"` here, the exact same version every previous week's `foundry.toml` has pinned, so a contract compiled on one toolchain produces bytecode comparable to the other genuinely useful for the side-by-side comparisons below, not just consistency for its own sake.

---
