# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code1 -- --template react-ts
  cd code1
  npm install react-router-dom

Step 2 — Create src/types/index.ts
  Export User interface (id, name, email).
  Export Product interface (id, title, price, description, thumbnail, rating, category).

Step 3 — Create src/hooks/useFetch.ts
  Generic function useFetch<T>(url: string | null): { data, loading, error }.
  useState<T | null>, useEffect with cancellation flag, typed error handling.

Step 4 — Create src/context/AuthContext.tsx
  AuthContextType interface. createContext<AuthContextType | null>(null).
  AuthProvider: useState<User | null>. login sets user. logout clears.
  useAuth(): AuthContextType hook with null-check guard.

Step 5 — Create src/components/Navbar.tsx and ProtectedRoute.tsx
  Navbar: useAuth(), NavLink with typed isActive callback.
  ProtectedRoute: useAuth(), return <Navigate /> if no user, else <Outlet />.

Step 6 — Create pages: HomePage.tsx, ProductDetailPage.tsx, LoginPage.tsx, DashboardPage.tsx
  All typed — event handlers as React.FormEvent, React.ChangeEvent<HTMLInputElement>.

Step 7 — Wire everything in App.tsx and main.tsx.
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
