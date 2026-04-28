# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code1 -- --template react-ts
  cd code1
  npm install --save-dev vitest @vitest/ui jsdom
  npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

Step 2 — Configure vite.config.ts
  Add test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test/setup.ts'] }.

Step 3 — Create src/test/setup.ts
  import '@testing-library/jest-dom';

Step 4 — Update tsconfig.json
  Add "types": ["vitest/globals", "@testing-library/jest-dom"] to compilerOptions.

Step 5 — Write src/utils/formatCurrency.ts
  Use Intl.NumberFormat. Accept amount: number, currency = 'USD'.

Step 6 — Write src/utils/truncate.ts
  truncate(text: string, maxLength: number): string
  If text.length <= maxLength return text, else return text.slice(0, maxLength) + '...'.

Step 7 — Write src/utils/groupBy.ts
  groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]>
  Reduce the array into an object keyed by keyFn(item).

Step 8 — Write src/utils/debounce.ts
  debounce<T extends unknown[]>(fn: (...args: T) => void, delay: number)
  Returns a function that delays calling fn until delay ms after the last call.

Step 9 — Write src/hooks/useCounter.ts
  useState<number>. Return { count, increment, decrement, reset, incrementBy }.

Step 10 — Write all test files. Run: npx vitest run
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
