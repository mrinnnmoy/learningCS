# How to Build.

```
1. Scaffold a new Vite React + TypeScript project.

   Run:
     npm create vite@latest wallet-connect-display -- --template react-ts
     cd wallet-connect-display
     npm install

2. Install this week's Solana-specific dependencies.

   Run:
     npm install @solana/web3.js @solana/wallet-adapter-base \
       @solana/wallet-adapter-react @solana/wallet-adapter-react-ui

3. Replace the entire contents of src/App.tsx with the version in the
   Solution section below. Leave every other scaffolded file
   untouched.

4. Make sure your wallet extension is installed, switched to Devnet,
   and already holds a small amount of devnet SOL. If it doesn't,
   fund it once, manually:
     solana airdrop 2 <your-wallet-address> --url devnet
   or use your wallet extension's own built-in devnet faucet button.
   Nothing in this assignment's code requests an airdrop for you.

5. Start the dev server.

   Run:
     npm run dev

   Open the URL Vite prints (typically http://localhost:5173). You
   should see the page heading, the "Select Wallet" button, and "No
   wallet connected yet." beneath it.

6. Click "Select Wallet", choose your wallet, and approve the
   connection request in the extension's popup.
```

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
