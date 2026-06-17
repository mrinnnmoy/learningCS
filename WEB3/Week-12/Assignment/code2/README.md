# How to Build.

```
1. Scaffold a new Vite React + TypeScript project.

   Run:
     npm create vite@latest message-signer -- --template react-ts
     cd message-signer
     npm install

2. Install this week's Solana-specific dependencies, plus tweetnacl
   and bs58 for the signature verification and display logic.

   Run:
     npm install @solana/web3.js @solana/wallet-adapter-base \
       @solana/wallet-adapter-react @solana/wallet-adapter-react-ui \
       tweetnacl bs58
     npm install -D @types/tweetnacl

   (If your installed tweetnacl version already ships its own types,
   the @types package is harmless to have installed alongside it.)

3. Replace the entire contents of src/App.tsx with the version in the
   Solution section below.

4. Confirm your wallet extension already holds devnet SOL (Easy's
   Step 4) — though note this assignment never actually spends any,
   signing a message costs nothing, no transaction is ever built.

5. Start the dev server.

   Run:
     npm run dev

   Open the printed URL, connect your wallet, and try signing the
   default message.

6. Edit the text in the input box to something different, click
   "Sign Message" again, and confirm a completely different
   signature is produced for the new text — a signature is over the
   EXACT bytes signed, so any change to the message changes it
   entirely (Week 3's avalanche-effect intuition, applied to
   signatures rather than hashes).
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
