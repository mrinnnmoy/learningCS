# How to Build.

```
Step 1 — Initialise the project
  npm create vite@latest code2 -- --template react
  cd code2
  npm install
  npm install -D tailwindcss postcss autoprefixer clsx
  npx tailwindcss init -p

Step 2 — Configure tailwind.config.js
  Set content: ['./index.html', './src/**/*.{js,jsx}'].
  Set darkMode: 'class'.
  Extend theme.colors with a 'brand' color scale.

Step 3 — Set up src/index.css
  Add @tailwind base; @tailwind components; @tailwind utilities;

Step 4 — Build src/components/Button.jsx
  Accept variant prop ('primary' | 'secondary'). Use clsx to combine classes.

Step 5 — Build src/components/Badge.jsx
  Accept a 'positive' boolean prop. Green styles if true, red if false.

Step 6 — Build src/components/Card.jsx
  A simple wrapper: white background, rounded corners, shadow, padding.
  Accept children and an optional className prop for extension.

Step 7 — Build src/components/Sidebar.jsx
  Fixed width on desktop (w-64), hidden on mobile unless toggled.
  List of nav items with icons (use emoji or simple SVGs to avoid extra dependencies).
  Active link uses the brand color.

Step 8 — Build src/components/Topbar.jsx
  Contains a mobile menu toggle button and a dark mode toggle button.
  Dark mode toggle reads/writes localStorage and toggles the 'dark' class on <html>.

Step 9 — Build src/App.jsx
  Compose Sidebar + Topbar + main content area.
  Main content: 4 stat Cards in a responsive grid, then a recent orders table.

Step 10 — Run the dev server
  npm run dev
  Open http://localhost:5173
```

---


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
