# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code2 -- --template react-ts
  cd code2
  npm install react-router-dom recoil

Step 2 — Create src/types/index.ts
  Product interface, CartItem interface (extends Product with qty: number),
  ProductListResponse interface.

Step 3 — Create src/store/atoms.ts
  cartAtom: atom<CartItem[]>, searchAtom: atom<string>.

Step 4 — Create src/store/selectors.ts
  cartTotalSelector: selector<number>, cartCountSelector: selector<number>.

Step 5 — Create src/hooks/useFetch.ts (generic, same as Assignment 1).

Step 6 — Create src/components/Navbar.tsx
  useRecoilValue<number>(cartCountSelector) for the badge.

Step 7 — Create src/components/ProductCard.tsx
  React.memo on the component, typed props interface.
  useSetRecoilState<CartItem[]>(cartAtom), useCallback with typed (product: CartItem) arg.

Step 8 — Create src/pages/HomePage.tsx
  useSearchParams for category + page.
  useRecoilState<string>(searchAtom) for search box.
  Filter and paginate products, render ProductCard grid.

Step 9 — Create src/pages/CartPage.tsx
  useRecoilState<CartItem[]>(cartAtom).
  useRecoilValue<number>(cartTotalSelector).
  Quantity controls: updateQty(id: number, delta: number): void.

Step 10 — Wire App.tsx and main.tsx with RecoilRoot.
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
