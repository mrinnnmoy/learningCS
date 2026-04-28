# How to Build.

```
Step 1 — Start from Week-20 Assignment 1 source
  Copy the src/ folder from Week-20 Assignment 1 (the multi-page app
  with AuthContext, useFetch, product grid, and protected dashboard).
  This gives you a working app to run E2E tests against.

Step 2 — Install Playwright
  npm install --save-dev @playwright/test
  npx playwright install

Step 3 — Write playwright.config.ts
  testDir: './e2e', baseURL: 'http://localhost:5173'.
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true }.
  projects for chromium (minimum for local dev — add firefox and webkit for CI).

Step 4 — Build e2e/pages/LoginPage.ts
  Constructor receives page: Page.
  Properties: emailInput, passwordInput, submitButton, errorMessage.
  Methods: goto(), login(email, password), expectError(text).

Step 5 — Build e2e/pages/DashboardPage.ts
  Properties: heading, userEmail (locator for the email in the navbar).
  Methods: isVisible() — asserts URL is /dashboard and heading is visible.
           getUserEmail(): Promise<string | null>.

Step 6 — Write e2e/home.spec.ts
  page.route to mock the dummyjson API before navigating.
  Test page title, product cards visible, clicking card navigates to /products/:id.

Step 7 — Write e2e/product.spec.ts
  Navigate directly to /products/1 (no mock needed — Playwright makes real requests
  to dummyjson for this test, demonstrating both mocked and unmocked approaches).
  Test URL contains '1', title and price are visible, back button works.

Step 8 — Write e2e/auth.spec.ts
  Use LoginPage and DashboardPage POMs throughout.
  Cover all 4 auth scenarios listed in Requirements.
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