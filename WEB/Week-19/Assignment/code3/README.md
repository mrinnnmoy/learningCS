# How to Build.

```
Step 1 — Initialise
  npm create vite@latest code3 -- --template react
  cd code3
  npm install

Step 2 — Create src/data/initialCart.js
  Export an array of 3-4 starter product objects: { id, name, price, quantity }.

Step 3 — Build src/components/Stepper.jsx
  Accept currentStep (1, 2, or 3) prop.
  Render 3 numbered circles with labels (Cart / Shipping / Payment),
  highlighting the current and completed steps differently.

Step 4 — Build src/components/CartStep.jsx
  Accept cartItems, onUpdateQuantity, onRemoveItem, onNext props.
  Render each item with name, price, quantity controls (+/-), remove button.
  Compute subtotal, shippingFee (conditional on subtotal), total as plain
  derived values inside the component — NOT separate state.
  "Next" button disabled if cartItems.length === 0.

Step 5 — Build src/components/ShippingStep.jsx
  Accept shippingInfo, onShippingChange, onNext, onBack props.
  useState for an 'errors' object and a 'touched' object (tracks which
  fields have been blurred, so errors only show after the user leaves a field).
  A validate(field, value) function returning an error string or empty string.
  onBlur per field: mark touched, run validation, update errors.
  onChange per field: update the lifted shippingInfo state via onShippingChange.
  "Next" disabled unless every field passes validation.

Step 6 — Build src/components/PaymentStep.jsx
  Accept cartItems, shippingInfo, paymentInfo, onPaymentChange, onPlaceOrder, onBack props.
  Similar validate-on-blur pattern as ShippingStep for card number/expiry/CVV.
  Render a read-only summary block using cartItems and shippingInfo (already collected).
  "Place Order" disabled until payment fields are valid. Calls onPlaceOrder on click.

Step 7 — Build src/components/ConfirmationScreen.jsx
  Accept orderNumber, total props.
  A simple success message with the generated order number and amount charged.

Step 8 — Build src/App.jsx
  useState for currentStep (1, 2, or 3), cartItems (from initialCart),
  shippingInfo (object with empty string fields), paymentInfo (object,
  empty string fields), orderPlaced (boolean), orderNumber (number | null).
  Functions: updateQuantity (immutable map over cartItems), removeItem (filter),
  goNext/goBack (increment/decrement currentStep), placeOrder (compute total,
  generate orderNumber via Date.now(), set orderPlaced to true).
  Conditionally render: ConfirmationScreen if orderPlaced is true,
  otherwise the Stepper + the step matching currentStep.

Step 9 — Run the dev server
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