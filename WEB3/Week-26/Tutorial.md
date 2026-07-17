# Tutorial: First-Time EVM Environment Setup.

This is the first week of the EVM half of the curriculum, so before Contents and Assignment, here's a one-time setup, deliberately light.

Solidity (Week 27) and Hardhat/Foundry (Week 30) aren't needed yet, this week is entirely read-only chain inspection, no wallet, no testnet SOL-equivalent, no faucet required at all.

## 1. Confirm Node.js.

The same Node install from the Solana track works unchanged:

```
node --version    # expect v24.x
```

---

## 2. Pick an RPC endpoint.

This is this week's actual new piece of infrastructure, the JSON-RPC endpoint (Concept 11) is how every script this week talks to Ethereum, playing the same role `clusterApiUrl("devnet")` played throughout the Solana track.

Three options, in order of friction:

| Option                                          | Setup required                                        | Good for                                                    |
| ----------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `ethers.getDefaultProvider("sepolia")`          | None — shared, rate-limited keys built into ethers.js | This week's light, occasional reads                         |
| `https://ethereum-sepolia-rpc.publicnode.com`   | None — a public, no-signup endpoint                   | A fallback if the shared keys get throttled                 |
| Alchemy or Infura (`alchemy.com` / `infura.io`) | Free signup, get an API key                           | Week 27 onward, real deployments need the higher rate limit |

This week's Solution code uses the zero-setup default provider, with the public endpoint noted as a fallback in a comment, so nothing here blocks you from starting immediately.

---

## 3. Install ethers.js.

Casually, this week, not yet formalized the way Week 12 formalized `@solana/web3.js`, Week 32 does that properly for this track:

```
npm install ethers
```

---

## 4. What you do NOT need yet.

- A wallet or private key (nothing this week sends a transaction, only reads public data),
- MetaMask (first genuinely needed around Week 32),
- A testnet faucet (nothing to fund yet) &
- Hardhat or Foundry (Week 30 introduces both and lets you pick).

---

## 5. Verify the setup.

[For reference](./Assignment/test/)

- Create a test folder in the directory.

  ```
  mkdir test
  cd test
  ```

- Install packages & make sure you edit the package.json file accordingly.

  ```
  npm init -y
  npm install ethers
  npm install --save-dev tsx typescript @types/node
  ```

  ```json
  // Here's how the package.json file should look.
  {
    "name": "test",
    "version": "1.0.0",
    "description": "",
    "main": "verify.ts",
    "scripts": {
      "start": "tsx verify.ts"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "type": "module",
    "dependencies": {
      "ethers": "^6.17.0"
    },
    "devDependencies": {
      "@types/node": "^26.1.2",
      "tsx": "^4.23.5",
      "typescript": "^7.0.2"
    }
  }
  ```

- Create `verify.ts` & `tsconfig.json` file, exactly the same tools the Solana track already used.

  ```typescript
  // verify.ts
  import { ethers } from "ethers";
  const provider = ethers.getDefaultProvider("sepolia");
  const blockNumber = await provider.getBlockNumber();

  console.log("Connected. Current Sepolia block:", blockNumber);
  ```

  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "types": ["node"],
      "moduleResolution": "Bundler",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["verify.ts"]
  }
  ```

- Run with `npx tsx verify.ts`.

  ```
  <!-- Terminal Output -->
  mrinnnmoy@MSI:~/projects/learningCS/WEB3/Week-26/Assignment/test$ npx tsx verify.ts
  Connected. Current Sepolia block: 11415167
  ```

A real, current block number confirms the whole chain is reachable before Contents and Assignment below.

---
