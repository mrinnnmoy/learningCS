# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code3 -- --template react
  cd code3
  npm install
  npm install -D tailwindcss postcss autoprefixer
  npm install clsx tailwind-merge
  npx tailwindcss init -p

Step 2 — Define themes.js
  Export an object mapping theme name → primary color as an "R G B" string
  (space-separated, no commas — required for the rgb(var(...) / <alpha-value>) pattern).

Step 3 — Configure tailwind.config.js
  content paths as usual.
  theme.extend.colors.primary = 'rgb(var(--color-primary) / <alpha-value>)'
  Add a custom plugin using the plugin() function from 'tailwindcss/plugin'
  that adds .text-shadow-sm, .text-shadow, .text-shadow-lg utilities via addUtilities.

Step 4 — Write src/lib/cn.js
  Combine clsx and twMerge into a single cn() helper function.

Step 5 — Write src/index.css
  @tailwind directives.
  Define :root CSS custom properties for the default theme's --color-primary.
  Add data-theme attribute selectors for each theme to override --color-primary.

Step 6 — Build src/components/ui/Button.jsx
  Accept variant, size, className props.
  Use cn() to merge variant/size classes with any custom className passed in,
  so consumers can override colors without specificity fights.

Step 7 — Build src/components/ui/Modal.jsx
  Accept isOpen, onClose, children.
  useEffect to listen for Escape key when open.
  Backdrop: fixed inset-0 bg-black/50 with transition-opacity.
  Panel: scale and opacity transition on enter/exit using state-driven classes.

Step 8 — Build src/components/ui/Accordion.jsx
  Accept an items array [{ title, content }].
  Track open index in state.
  Animate height using a measured scrollHeight + max-height transition
  (since Tailwind cannot animate to an unknown 'auto' height directly).

Step 9 — Build src/components/ui/Skeleton.jsx
  A simple div with animate-pulse and a configurable className for size/shape.

Step 10 — Build src/App.jsx
  Theme switcher buttons that set document.documentElement.dataset.theme.
  Showcase every component and variant.
  Skeleton-to-content swap using setTimeout + useState.

Step 11 — Run the dev server
  npm run dev
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
