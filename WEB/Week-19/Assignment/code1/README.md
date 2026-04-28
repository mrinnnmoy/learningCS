# How to Build.

```
Step 1 — Initialise the project
  npm create vite@latest code1 -- --template react
  cd code1
  npm install

Step 2 — Build src/components/Card.jsx
  A simple wrapper accepting a 'children' prop.
  Renders children inside a div with border, padding, border-radius, box-shadow.

Step 3 — Build src/components/ProfileCard.jsx
  Accept name, role, avatarEmoji, bio, initialFollowers as props.
  useState for isFollowing (boolean, default false).
  useState for followerCount (initialized from initialFollowers prop).
  useState for isExpanded (boolean, default false) for the bio toggle.
  handleFollowClick: toggle isFollowing, increment/decrement followerCount accordingly.
  Render avatarEmoji, name, role always.
  Conditionally render full bio or a truncated version based on isExpanded.
  Render the Follow/Following button with conditional className for color.

Step 4 — Build src/App.jsx
  Import Card and ProfileCard.
  Render 3 ProfileCard instances (each wrapped in Card) with different prop values.

Step 5 — Add basic styling in src/index.css
  Style .card, .follow-btn (and its 'following' state), .avatar, etc.

Step 6 — Run the dev server
  npm run dev
  Open http://localhost:5173
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