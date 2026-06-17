# How to Build.

```
1. Scaffold a new Vite React + TypeScript project.

   Run:
     npm create vite@latest send-and-confirm -- --template react-ts
     cd send-and-confirm
     npm install

2. Install this week's Solana-specific dependencies.

   Run:
     npm install @solana/web3.js @solana/wallet-adapter-base \
       @solana/wallet-adapter-react @solana/wallet-adapter-react-ui

3. Replace the entire contents of src/App.tsx with the version in the
   Solution section below.

   Read handleSend closely before running anything — note the order:
   build, THEN simulate, THEN only call sendTransaction if the
   simulation came back clean. This ordering is the entire point of
   the assignment, not an implementation detail.

4. Confirm your wallet extension already holds devnet SOL (Easy's
   Step 4) — this assignment spends a real (tiny) network fee, since
   it actually sends a transaction, unlike Medium.

5. Start the dev server.

   Run:
     npm run dev

   Open the printed URL, connect your wallet, and click "Send 1000
   lamports to myself."

6. Watch the status line update through each stage: Building,
   Simulating, a compute-units figure, then either an approval
   prompt in your wallet followed by Confirming/Confirmed, or a
   simulation-failure message if something went wrong before that
   point.
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
