# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code2 -- --template react
  cd code2
  npm install

Step 2 — Build src/components/TodoInput.jsx
  Controlled text input + Add button.
  useState for the input's current text value.
  onSubmit (form) or Enter keydown triggers an onAdd(text) callback prop.
  Trim the text and reject if empty before calling onAdd.
  Clear the input after a successful add.

Step 3 — Build src/components/TodoItem.jsx
  Accept a single todo object + onToggle, onDelete, onEdit callback props.
  useState for isEditing (boolean) and editText (string).
  Checkbox calls onToggle(todo.id) on change.
  Delete button calls onDelete(todo.id).
  Double-click on the text enters edit mode — render an input instead of text.
  Enter or blur in edit mode calls onEdit(todo.id, newText) and exits edit mode.
  Escape in edit mode cancels without saving, reverting editText.

Step 4 — Build src/components/TodoList.jsx
  Accept todos array + the same callback props.
  Map over todos rendering a TodoItem per item, key={todo.id}.
  Show a friendly empty state message if todos.length === 0.

Step 5 — Build src/components/TodoFilters.jsx
  Accept currentFilter and onFilterChange props.
  Render 3 buttons (All/Active/Completed), highlight the active one.

Step 6 — Build src/App.jsx
  useState for todos array (initialize lazily from localStorage via useState(() => ...)).
  useState for the current filter string ('all' | 'active' | 'completed').
  useEffect that writes todos to localStorage whenever todos changes.
  addTodo, toggleTodo, deleteTodo, editTodo, clearCompleted functions —
  all using immutable updates (spread/map/filter, never mutate the array directly).
  Compute filteredTodos and activeCount as plain derived values
  (NOT separate state) on every render based on todos and filter.
  Render TodoInput, TodoFilters, the active count, TodoList, and a
  "Clear completed" button (only shown if there's at least one completed todo).

Step 7 — Run the dev server
  npm run dev
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