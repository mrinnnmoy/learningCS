# How to Build.

```
Step 1 — Initialise (same deps as Assignment 1)
  npm create vite@latest code2 -- --template react-ts
  cd code2
  npm install --save-dev vitest jsdom @testing-library/react
  npm install --save-dev @testing-library/jest-dom @testing-library/user-event

Step 2 — Configure vite.config.ts and tsconfig.json (same as Assignment 1).

Step 3 — Define src/types/index.ts
  Product interface: id, title, price, category, stock.

Step 4 — Build SearchBar.tsx
  Controlled input. useEffect to debounce the onSearch call by 300ms.
  Clear the debounce timer on cleanup.

Step 5 — Write SearchBar.test.tsx
  vi.useFakeTimers + vi.useRealTimers.
  Test: renders input, does NOT call onSearch before 300ms,
  calls onSearch with current value after 300ms,
  cancels the previous call if user types again within 300ms.

Step 6 — Build ProductCard.tsx
  Render title, price, category badge, and an "Add to cart" button.
  When stock === 0: show "Sold out" badge, disable the button.

Step 7 — Write ProductCard.test.tsx
  Test: renders product info, calls onAddToCart with the product on click,
  shows "Sold out" and disables button when stock is 0,
  does NOT call onAddToCart when button is disabled.

Step 8 — Build ProductList.tsx
  useEffect to fetch /api/products. Three render paths: loading, error, success.
  On success, render a ProductCard for each product.

Step 9 — Write ProductList.test.tsx
  vi.stubGlobal('fetch', mockFetch).
  Test loading state, error state (rejected fetch), success state (resolved with data).
  Use waitFor for async assertions.
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
