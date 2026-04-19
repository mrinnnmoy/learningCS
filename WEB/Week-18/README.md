# List of things learned.

## 1. Utility-First Styling.

_Tailwind CSS_ is a **utility-first CSS framework**.

Instead of writing custom CSS classes like `.card` or `.btn-primary` and defining their styles in a separate stylesheet, you compose styles directly in your markup using small, single-purpose utility classes.

```html
<!-- Traditional CSS approach -->
<div class="card">Hello</div>
<style>
  .card {
    padding: 1rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>

<!-- Tailwind utility-first approach -->
<div class="p-4 bg-white rounded-lg shadow-sm">Hello</div>
```

Each class does exactly one thing:

- `p-4` sets padding,
- `bg-white` sets background color,
- `rounded-lg` sets border radius,
- `shadow-sm` sets a box shadow.

You never leave your HTML to write CSS.

### Why Utility-First Instead of Component Classes.

```
Traditional CSS (BEM, custom classes)
  You invent class names: .card, .card__header, .card--featured
  You context-switch between HTML and CSS files constantly
  Your CSS file grows unboundedly as the app grows
  Naming things is hard — and bad names compound over time
  Unused CSS accumulates because nothing tells you a class is dead

Tailwind Utility-First
  No naming required — classes describe what they do, not what they're for
  Styles live next to the markup — one file to read, one mental model
  CSS bundle size stays bounded — only classes you actually use ship to production
  Refactoring a component means deleting it — no orphaned CSS rules left behind
  Constraints come from a design system (spacing scale, color palette) — consistency by default
```

### Installation and Setup.

```bash
# For a Vite project (React, Vue, vanilla)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# Creates tailwind.config.js and postcss.config.js

# For Next.js — built-in support, just install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // content tells Tailwind which files to scan for class names
  // Tailwind only generates CSS for classes it finds being used —
  // this is how the "unused CSS never ships" promise works
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    // extend lets you ADD to the default theme without replacing it
  },
  plugins: [],
};
```

```css
/* src/index.css — the three directives that generate all of Tailwind's CSS */
@tailwind base; /* resets and base element styles */
@tailwind components; /* component classes (rarely used directly) */
@tailwind utilities; /* all the utility classes — the bulk of Tailwind */
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Tailwind CSS v4. (The CSS-First Approach)

Tailwind v4 simplified configuration significantly, you can now configure Tailwind directly inside your CSS file instead of a JavaScript config file.

```bash
npm install tailwindcss @tailwindcss/vite
```

```css
/* src/index.css — v4 style */
@import "tailwindcss";

/* Customizing the theme directly in CSS using @theme */
@theme {
  --color-brand: #6d28d9;
  --font-display: "Satoshi", sans-serif;
}
```

```javascript
// vite.config.js
import tailwindcss from "@tailwindcss/vite";

export default {
  plugins: [tailwindcss()],
};
```

### Core Utility Categories.

```
Spacing      p-4, px-2, py-6, m-4, mx-auto, mt-8, space-x-4, gap-2
Sizing       w-full, w-1/2, h-screen, max-w-md, min-h-screen
Typography   text-sm, text-2xl, font-bold, leading-relaxed, tracking-wide
Color        bg-blue-500, text-gray-700, border-red-300
Borders      border, border-2, rounded-lg, rounded-full, divide-y
Shadows      shadow-sm, shadow-lg, shadow-xl, drop-shadow
Flexbox      flex, flex-col, items-center, justify-between, flex-1
Grid         grid, grid-cols-3, col-span-2, gap-4
Position     relative, absolute, fixed, top-0, inset-0, z-10
Display      block, inline-block, hidden, flex, grid
```

### The Spacing and Sizing Scale.

Tailwind's spacing scale is based on a consistent numeric system.

Each step corresponds to `0.25rem` (4px) by default.

```
p-0    = 0px
p-1    = 0.25rem  (4px)
p-2    = 0.5rem   (8px)
p-3    = 0.75rem  (12px)
p-4    = 1rem     (16px)
p-5    = 1.25rem  (20px)
p-6    = 1.5rem   (24px)
p-8    = 2rem     (32px)
p-10   = 2.5rem   (40px)
p-12   = 3rem     (48px)
p-16   = 4rem     (64px)
p-20   = 5rem     (80px)
p-24   = 6rem     (96px)

This applies to padding (p), margin (m), gap, width (w), height (h) and more.

Directional variants: pt- (top), pr- (right), pb- (bottom), pl- (left),
                       px- (left+right), py- (top+bottom)
```

```html
<div class="p-4">padding: 1rem on all sides</div>
<div class="px-6 py-3">padding: 1.5rem left/right, 0.75rem top/bottom</div>
<div class="mt-8 mb-4">margin-top: 2rem, margin-bottom: 1rem</div>
<div class="-mt-2">negative margin: -0.5rem (note the leading -)</div>
```

### Color System.

```
Tailwind ships with a full color palette, each with 11 shades (50–950):

gray, slate, zinc, neutral, stone   (neutrals)
red, orange, amber, yellow          (warm)
lime, green, emerald, teal          (greens)
cyan, sky, blue, indigo             (blues)
violet, purple, fuchsia, pink, rose (purples/pinks)

bg-blue-50   → lightest tint
bg-blue-500  → base color (most commonly used for primary actions)
bg-blue-950  → darkest shade

Apply to: bg- (background), text- (text color), border- (border color),
          ring- (focus ring), divide- (divider color), fill-/stroke- (SVG)
```

```html
<button class="bg-blue-500 hover:bg-blue-600 text-white">Click me</button>
<p class="text-gray-700">Body text</p>
<div class="border border-gray-200">Card with subtle border</div>
```

### Arbitrary Values.

When the design system doesn't have exactly the value you need, use square-bracket syntax for a one-off arbitrary value.

```html
<!-- Most of the time, use the scale -->
<div class="w-64 h-64">...</div>

<!-- When you need an exact, non-standard value -->
<div class="w-[327px] h-[450px]">...</div>
<div class="top-[117px]">...</div>
<div class="bg-[#1da1f2]">...</div>
<!-- exact brand color -->
<div class="grid-cols-[1fr_2fr_1fr]">...</div>
<!-- custom grid template -->
```

---

## 2. Responsive Utilities.

Tailwind uses a **mobile-first** breakpoint system. Unprefixed utilities apply to all screen sizes; breakpoint-prefixed utilities apply at that breakpoint and above.

```
Breakpoint   Min-width    Typical device
─────────────────────────────────────────────
(none)       0px          all sizes (mobile-first base)
sm:          640px        small tablets, large phones (landscape)
md:          768px        tablets
lg:          1024px       laptops
xl:          1280px       desktops
2xl:         1536px       large desktops
```

### Mobile-First Thinking.

```html
<!-- Base styles apply to ALL screens (mobile first).
     Each breakpoint OVERRIDES for that size and up. -->
<div class="text-sm md:text-base lg:text-lg">
  <!-- text-sm on mobile, text-base from 768px up, text-lg from 1024px up -->
</div>

<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- full width on mobile, half on tablet, a third on desktop -->
</div>

<!-- Hide on mobile, show on desktop -->
<nav class="hidden lg:flex">Desktop nav</nav>

<!-- Show on mobile, hide on desktop -->
<button class="lg:hidden">Mobile menu button</button>
```

### A Complete Responsive Layout Example.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-8">
  <div class="bg-white rounded-lg shadow p-4">Card 1</div>
  <div class="bg-white rounded-lg shadow p-4">Card 2</div>
  <div class="bg-white rounded-lg shadow p-4">Card 3</div>
  <div class="bg-white rounded-lg shadow p-4">Card 4</div>
</div>
<!--
  Mobile (< 640px):  1 column,  padding 1rem
  Tablet (≥ 640px):  2 columns
  Desktop (≥ 1024px): 4 columns, padding 2rem
-->
```

### Container and Max-Width Patterns.

```html
<!-- The container class centers content and sets a max-width per breakpoint -->
<div class="container mx-auto px-4">
  <!-- content constrained to the breakpoint's max-width, centered -->
</div>

<!-- Common manual pattern for full control -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- max-width caps at 80rem (1280px), horizontal padding increases at breakpoints -->
</div>
```

### Responsive Typography and Spacing.

```html
<h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
  Responsive Heading
</h1>

<section class="py-8 md:py-16 lg:py-24">
  <!-- vertical padding scales up on larger screens -->
</section>

<div class="flex flex-col md:flex-row gap-4 md:gap-8">
  <!-- stacked on mobile, side-by-side on tablet+, gap increases -->
</div>
```

---

## 3. Layout Systems.

### Flexbox in Tailwind.

```html
<!-- Basic flex container -->
<div class="flex">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Direction -->
<div class="flex flex-row">horizontal (default)</div>
<div class="flex flex-col">vertical</div>

<!-- Alignment along the main axis -->
<div class="flex justify-start">items packed to start</div>
<div class="flex justify-center">items centered</div>
<div class="flex justify-between">space between items</div>
<div class="flex justify-around">space around items</div>
<div class="flex justify-evenly">equal space everywhere</div>

<!-- Alignment along the cross axis -->
<div class="flex items-start">items at top (in a row)</div>
<div class="flex items-center">items vertically centered</div>
<div class="flex items-end">items at bottom</div>
<div class="flex items-stretch">items stretch to fill (default)</div>

<!-- Wrapping -->
<div class="flex flex-wrap">items wrap to next line if needed</div>

<!-- Gap between flex items -->
<div class="flex gap-4">1rem gap between all items</div>

<!-- Flex grow/shrink on children -->
<div class="flex">
  <div class="flex-1">Grows to fill available space</div>
  <div class="flex-none">Fixed size, doesn't grow</div>
</div>

<!-- A common navbar pattern -->
<nav class="flex items-center justify-between p-4">
  <div class="font-bold text-xl">Logo</div>
  <div class="flex gap-6">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </div>
</nav>
```

### CSS Grid in Tailwind.

```html
<!-- Basic grid with fixed columns -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 1 col mobile, 2 col tablet, 3 col desktop -->
</div>

<!-- Spanning multiple columns/rows -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">Spans 2 columns</div>
  <div>Normal</div>
  <div>Normal</div>
  <div class="col-span-4">Spans all 4 columns (full width)</div>
</div>

<!-- Auto-fit grid — responsive without media queries -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
  <!-- Columns automatically wrap based on available space.
       Each column is at least 200px, grows to fill remaining space. -->
</div>

<!-- Grid template areas for complex layouts -->
<div class="grid grid-cols-[200px_1fr] grid-rows-[auto_1fr_auto] min-h-screen">
  <header class="col-span-2 bg-gray-800 text-white p-4">Header</header>
  <aside class="bg-gray-100 p-4">Sidebar</aside>
  <main class="p-4">Main content</main>
  <footer class="col-span-2 bg-gray-800 text-white p-4">Footer</footer>
</div>
```

### Positioning.

```html
<div class="relative">
  <!-- relative establishes a positioning context for absolute children -->
  <div class="absolute top-0 right-0">Badge in corner</div>
</div>

<div class="fixed bottom-4 right-4 z-50">
  <!-- fixed to viewport, common for floating action buttons -->
</div>

<div class="sticky top-0 z-10 bg-white">
  <!-- sticks to top of its scroll container when scrolling past it -->
</div>

<!-- inset shorthand sets top, right, bottom, left all at once -->
<div class="absolute inset-0 bg-black/50">
  <!-- covers the entire parent — common for modal overlays -->
</div>

<!-- z-index scale -->
z-0, z-10, z-20, z-30, z-40, z-50 (higher = on top)
```

### Common Layout Patterns.

```html
<!-- Centered card on the page -->
<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
    Login form here
  </div>
</div>

<!-- Sidebar layout -->
<div class="flex min-h-screen">
  <aside class="w-64 bg-gray-900 text-white p-4 hidden md:block">Sidebar</aside>
  <main class="flex-1 p-6">Main content</main>
</div>

<!-- Sticky header, scrollable content -->
<div class="h-screen flex flex-col">
  <header class="sticky top-0 bg-white shadow-sm p-4">Header</header>
  <main class="flex-1 overflow-y-auto p-4">Scrollable content</main>
</div>
```

---

## 4. Component Styling.

### Pseudo-Class Variants.

Tailwind handles hover, focus, active and other interaction states with simple prefixes.

No separate `:hover` CSS block needed.

```html
<button
  class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-4 py-2 rounded"
>
  Click me
</button>

<input
  class="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
/>

<a class="text-blue-500 hover:text-blue-700 hover:underline">Link</a>

<!-- Disabled state -->
<button
  class="bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
  disabled
>
  Disabled button
</button>

<!-- Group hover — style a child based on hovering the PARENT -->
<div class="group p-4 border rounded hover:bg-gray-50">
  <h3 class="text-gray-900">Card title</h3>
  <p class="text-gray-500 group-hover:text-gray-700">
    This text changes color when the PARENT div is hovered, not itself.
  </p>
</div>

<!-- Peer — style an element based on a SIBLING's state -->
<input type="checkbox" class="peer" />
<label class="peer-checked:text-blue-500">
  This label turns blue when the checkbox sibling is checked
</label>
```

### Dark Mode.

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // toggle dark mode by adding/removing 'dark' class on <html>
  // alternative: darkMode: 'media' — follows OS preference automatically
};
```

```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  This adapts automatically when the 'dark' class is present on <html>
</div>

<button class="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700">
  Button that adapts colors for dark mode
</button>
```

```javascript
// Toggling dark mode with JavaScript
const toggleDarkMode = () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
};

// On page load — respect saved preference or OS preference
if (
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
}
```

### Customizing the Theme.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      // extend ADDS to defaults — your custom values exist alongside Tailwind's
      colors: {
        brand: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        display: ["Satoshi", "sans-serif"],
      },
      spacing: {
        128: "32rem", // adds a new spacing value: p-128, w-128, etc.
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
};
```

```html
<!-- Using custom theme values -->
<div class="bg-brand-500 text-white font-display rounded-4xl">
  Custom themed element
</div>
```

### Reusing Styles with `@apply`.

When the same utility combination repeats many times, extract it into a CSS class using `@apply`.

Use this sparingly, the whole point of Tailwind is to avoid context-switching to CSS files.

```css
/* src/index.css */
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }

  .card {
    @apply bg-white rounded-xl shadow-sm p-6 border border-gray-100;
  }
}
```

```html
<button class="btn-primary">Save</button>
<div class="card">Card content</div>
```

```
When to use @apply:
  A combination of 5+ utilities repeats across many components.
  You're building a tiny design system shared across a whole app.

When NOT to use @apply:
  As a default habit — this defeats Tailwind's main benefit (co-located styles).
  For one-off elements — just write the utilities directly.
  In component-based frameworks (React/Vue) — extract a <Button> COMPONENT instead.
```

### Building Reusable Components (the React Way).

In component frameworks, the idiomatic way to avoid repeating utility classes is a reusable component, not `@apply`.

```jsx
// Button.jsx
const variants = {
  primary:   'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
};

export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Usage
<Button variant="primary">Save</Button>
<Button variant="danger">Delete</Button>
```

### Conditional Classes with `clsx` / `cn`.

```bash
npm install clsx
```

```jsx
import clsx from "clsx";

function Badge({ status }) {
  return (
    <span
      className={clsx(
        "px-2 py-1 rounded-full text-xs font-medium",
        status === "active" && "bg-green-100 text-green-700",
        status === "pending" && "bg-yellow-100 text-yellow-700",
        status === "failed" && "bg-red-100 text-red-700",
      )}
    >
      {status}
    </span>
  );
}
```

### Transitions and Animations.

```html
<button class="transition-colors duration-200 bg-blue-500 hover:bg-blue-700">
  Smooth color transition over 200ms
</button>

<div class="transition-transform duration-300 hover:scale-105">
  Scales up smoothly on hover
</div>

<div
  class="transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1"
>
  Lifts up and gains shadow on hover
</div>

<!-- Built-in animations -->
<div class="animate-spin">Spinning loader icon</div>
<div class="animate-pulse">Pulsing skeleton loader</div>
<div class="animate-bounce">Bouncing element</div>
```

---

## 5. Building Real-World UI.

### A Login Form.

```html
<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
  <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
    <p class="text-gray-500 mb-6">Sign in to your account</p>

    <form class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Email</label
        >
        <input
          type="email"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Password</label
        >
        <input
          type="password"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg
               transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign in
      </button>
    </form>

    <p class="text-center text-sm text-gray-500 mt-6">
      Don't have an account?
      <a href="#" class="text-blue-500 hover:text-blue-700 font-medium"
        >Sign up</a
      >
    </p>
  </div>
</div>
```

### A Product Card Grid.

```html
<div class="max-w-7xl mx-auto px-4 py-8">
  <h2 class="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div
      class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
    >
      <div class="aspect-square bg-gray-100 overflow-hidden">
        <img
          src="/laptop.jpg"
          alt="Laptop"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div class="p-4">
        <h3 class="font-medium text-gray-900">Laptop Pro</h3>
        <p class="text-sm text-gray-500 mt-1">Electronics</p>
        <div class="flex items-center justify-between mt-3">
          <span class="text-lg font-bold text-gray-900">$999</span>
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
    <!-- Repeat for more products -->
  </div>
</div>
```

### A Responsive Navbar with Mobile Menu.

```html
<nav class="bg-white shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="font-bold text-xl text-gray-900">Brand</div>

      <!-- Desktop links -->
      <div class="hidden md:flex items-center gap-8">
        <a href="#" class="text-gray-600 hover:text-gray-900">Home</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">Products</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
        <button
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Sign in
        </button>
      </div>

      <!-- Mobile hamburger button -->
      <button class="md:hidden p-2" id="menu-button">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- Mobile menu — hidden by default, toggled by JS -->
  <div class="hidden md:hidden border-t border-gray-100" id="mobile-menu">
    <div class="px-4 py-3 space-y-2">
      <a href="#" class="block text-gray-600 hover:text-gray-900 py-2">Home</a>
      <a href="#" class="block text-gray-600 hover:text-gray-900 py-2"
        >Products</a
      >
      <a href="#" class="block text-gray-600 hover:text-gray-900 py-2">About</a>
      <button
        class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mt-2"
      >
        Sign in
      </button>
    </div>
  </div>
</nav>
```

### A Dashboard Stat Card.

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-gray-500">Total Revenue</p>
      <span class="text-green-500 text-sm font-medium">+12.5%</span>
    </div>
    <p class="text-3xl font-bold text-gray-900 mt-2">$45,231</p>
    <p class="text-sm text-gray-400 mt-1">vs last month</p>
  </div>
  <!-- Repeat for more stat cards -->
</div>
```

### A Toast / Alert Component.

```html
<div class="fixed top-4 right-4 z-50 space-y-2">
  <div
    class="bg-white border-l-4 border-green-500 rounded-lg shadow-lg p-4 max-w-sm flex items-start gap-3"
  >
    <svg
      class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fill-rule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
        clip-rule="evenodd"
      />
    </svg>
    <div>
      <p class="font-medium text-gray-900">Success</p>
      <p class="text-sm text-gray-500">Your changes have been saved.</p>
    </div>
  </div>
</div>
```

---

## Assignment.

1. **Responsive Landing Page Section.**

   **What you practice:**
   - Mobile-first responsive design with breakpoint prefixes
   - Flexbox for navbar layout
   - the spacing and color scale
   - hover and focus states
   - arbitrary values for one-off needs
   - building a complete, polished section from scratch with plain HTML and Tailwind via CDN (no build step needed for this assignment)

   **Requirements:**
   - Build a single HTML file with a hero section containing: a navbar (logo + nav links + CTA button, collapsing to a hamburger icon on mobile), a hero heading and subheading, a CTA button, and a 3-column feature grid below the hero (stacks to 1 column on mobile, 3 columns on desktop).
   - Use Tailwind via the CDN script (no build tooling required for this assignment).
   - The navbar must be sticky to the top of the page.
   - All interactive elements (buttons, links) must have visible hover states.
   - The layout must look correct at mobile (375px), tablet (768px), and desktop (1280px) widths.

   [Solution](./Assignment/code1/)

   **Manual Test Cases (Using visual/DevTools).**

   ```
   # 1. Desktop view (≥1280px)
   Open index.html in a browser at full width.
   → Navbar shows: Logo, Home/Features/Pricing/Contact links, "Get Started" button.
   → Hamburger icon is NOT visible.
   → Feature grid shows 3 columns side by side.

   # 2. Tablet view (768px)
   Resize browser or use DevTools device toolbar at 768px.
   → Navbar still shows full desktop layout (md: breakpoint is 768px, so md:flex is active).
   → Feature grid still shows 3 columns (md:grid-cols-3 applies at 768px).

   # 3. Mobile view (375px)
   Resize to 375px width.
   → Desktop nav links are hidden (hidden md:flex).
   → Hamburger icon is visible.
   → Feature grid stacks to 1 column.
   → Hero heading text size reduces (text-4xl instead of text-6xl).

   # 4. Mobile menu toggle
   At mobile width, click the hamburger icon.
   → Mobile menu appears below the navbar with all 4 links + button stacked vertically.
   Click the hamburger again.
   → Mobile menu disappears.

   # 5. Hover states
   Hover over "Get Started" button (desktop).
   → Background changes from bg-blue-600 to bg-blue-700, with a smooth transition.
   Hover over a feature card.
   → Shadow increases from shadow-sm to shadow-lg, smoothly animated.

   # 6. Focus states (keyboard accessibility)
   Tab through the page using the keyboard.
   → Buttons show a visible blue focus ring (focus:ring-2 focus:ring-blue-400).

   # 7. Sticky navbar
   Scroll down the page.
   → Navbar remains pinned to the top of the viewport at all times.
   ```

2. **Multi-Page Dashboard UI with React, Vite and Tailwind.**

   **What you practice:**
   - Setting up Tailwind with Vite and a proper `tailwind.config.js` (not the CDN)
   - building reusable React components styled with Tailwind
   - `clsx` for conditional classes
   - dark mode toggle with the `class` strategy
   - a responsive sidebar layout that collapses on mobile
   - custom theme colors via `extend`
   - component composition (Card, Badge, Button as separate files).

   **Requirements:**
   - Set up a Vite + React project with Tailwind configured via `tailwind.config.js` (proper build setup, not CDN).
   - Build a dashboard with: a collapsible sidebar (icons + labels on desktop, hidden behind a hamburger on mobile), a topbar with a dark mode toggle, a stats grid (4 cards: Revenue, Orders, Customers, Growth — each with a value and a percentage change badge colored green/red) and a simple table of recent orders.
   - Implement dark mode using Tailwind's `class` strategy with a toggle button that persists the choice in `localStorage`.
   - Create reusable components: `Button.jsx`, `Card.jsx`, `Badge.jsx`, `Sidebar.jsx`, `Topbar.jsx`.
   - Add one custom brand color to the Tailwind theme via `extend.colors` and use it for the active sidebar link and primary buttons.

   [Solution](./Assignment/code2/)

   **Manual Test Cases.**

   ```
   # 1. Initial load
   npm run dev → open http://localhost:5173
   → Sidebar visible on desktop with 4 nav items, "Dashboard" highlighted in brand color.
   → Topbar shows "Dashboard" title and a moon icon (light mode default, unless OS prefers dark).
   → 4 stat cards visible in a row on desktop.
   → Recent orders table with 4 rows, status badges colored correctly
   (green=Delivered, yellow=Pending, red=Cancelled).

   # 2. Dark mode toggle
   Click the moon/sun icon in the topbar.
   → Entire UI switches to dark backgrounds (gray-900/800) with light text.
   → Icon switches from 🌙 to ☀️.
   Refresh the page.
   → Dark mode persists (read from localStorage on load).

   # 3. Responsive sidebar — desktop
   At ≥768px width:
   → Sidebar is always visible, takes up the left 256px (w-64).
   → Hamburger button in topbar is hidden (md:hidden).

   # 4. Responsive sidebar — mobile
   At <768px width:
   → Sidebar is hidden by default (translated off-screen).
   → Hamburger button visible in topbar.
   Click the hamburger button.
   → Sidebar slides in from the left, a dark overlay appears behind it.
   Click the overlay.
   → Sidebar slides back out, overlay disappears.

   # 5. Stats grid responsiveness
   At desktop width: 4 cards in one row (grid-cols-4).
   At tablet width (~640-1024px): 2 cards per row (sm:grid-cols-2).
   At mobile width (<640px): 1 card per row (grid-cols-1, the default).

   # 6. Badge colors
   Revenue badge (+12.5%) → green with ▲.
   Customers badge (-2.1%) → red with ▼.

   # 7. Table horizontal scroll on narrow screens
   At very narrow widths, the orders table scrolls horizontally within its Card
   (overflow-x-auto) instead of breaking the layout.
   ```

3. **Themeable Component Library with Custom Plugin and Animated Interactions.**

   **What you practice:**
   - Building a small internal component library with variants and sizes
   - a custom Tailwind plugin that generates new utility classes
   - CSS custom properties combined with Tailwind for runtime-themeable colors (multiple brand themes switchable at runtime, not just light/dark)
   - complex animated interactions (modal with enter/exit transitions, animated accordion, skeleton loading states)
   - `tailwind-merge` to safely override conflicting classes in component composition
   - organizing a multi-component design system.

   **Requirements:**
   - Set up Vite + React + Tailwind with a proper build.
   - Write a **custom Tailwind plugin** (in `tailwind.config.js`) that adds a new utility: `.text-shadow-sm`, `.text-shadow`, `.text-shadow-lg` (text-shadow isn't a built-in Tailwind utility — you must add it via `plugin()`).
   - Implement a **runtime theme switcher** with at least 3 themes (e.g. "indigo", "emerald", "rose") that changes the primary color across the whole app instantly, without a page reload. Use CSS custom properties defined per theme, referenced by Tailwind's `extend.colors` using the `rgb(var(--color-primary) / <alpha-value>)` pattern so opacity utilities still work.
   - Build these components in a `components/ui` folder: `Button` (variants: primary/secondary/outline/ghost, sizes: sm/md/lg), `Modal` (with backdrop fade and panel scale/fade enter-exit transition, closes on backdrop click and Escape key), `Accordion` (expand/collapse with smooth height animation), `Skeleton` (animated loading placeholder using `animate-pulse`).
   - Use `tailwind-merge` combined with `clsx` (commonly wrapped in a `cn()` helper) so that a consumer can pass a `className` prop to any component and override conflicting Tailwind classes safely (e.g. passing `className="bg-red-500"` to a `Button` should override its default background without leaving both classes in the DOM fighting each other).
   - Build a demo page that exercises all of the above: theme switcher buttons, all button variants/sizes, a button that opens the Modal, an Accordion with 3 items, and a Skeleton shown for 1.5 seconds before "real" content fades in.

   [Solution](./Assignment/code3/)

   **Manual Test Cases.**

   ```
   # 1. Initial load
   npm run dev → open http://localhost:5173
   → Page loads with the Indigo theme active (data-theme="indigo" on <html>).
   → Heading "Component Library Demo" is rendered in the indigo primary color
   with a visible text-shadow (custom plugin utility working).
   → A skeleton loading placeholder (3 animated gray bars) is visible in the last section.

   # 2. Theme switcher
   Click the Emerald color swatch.
   → ALL primary-colored elements across the page (heading, primary buttons, outline
   button borders, accordion chevron on open) instantly switch to emerald — no reload.
   Click the Rose swatch.
   → Switches to rose. The previously selected swatch's ring border moves to Rose.

   # 3. Button variants
   Verify all 4 variants render distinctly: Primary (filled), Secondary (gray),
   Outline (bordered, primary text), Ghost (no border, primary text, subtle hover bg).
   Verify all 3 sizes render with visibly different padding/text size.

   # 4. tailwind-merge override
   Observe the "Danger Override" button — it must render with a RED background,
   not a mix of red and the primary theme color. This proves twMerge correctly
   dropped the conflicting 'bg-primary' utility in favor of the later 'bg-red-500'.
   Change the theme — the Danger button must remain red (unaffected by theme switch,
   since it never used bg-primary in the first place).

   # 5. Modal open/close behavior
   Click "Open Modal".
   → Backdrop fades in, panel scales up from 95% to 100% with a fade — both
   transitions should feel smooth, not instant.
   Click the backdrop (outside the panel).
   → Modal fades and scales back out, then fully unmounts (no invisible overlay left
   blocking clicks — confirmed by being able to click buttons behind it after close).
   Open the modal again, press the Escape key.
   → Modal closes the same way.
   Open the modal again, click the × button.
   → Modal closes.

   # 6. Accordion behavior
   Click the first accordion item.
   → Content area animates open (smooth height transition, not an instant snap),
   chevron rotates 180°.
   Click the second item.
   → First item closes (height animates back to 0) while second opens —
   only one open at a time.
   Click the open item again.
   → It closes.

   # 7. Skeleton to content transition
   On page load, observe the "Loading State" section for the first 1.5 seconds.
   → 3 pulsing gray bars of different widths are visible (animate-pulse working).
   After 1.5 seconds:
   → Skeleton is replaced by the real paragraph text, which fades in smoothly.

   # 8. Responsive check
   Resize the browser to mobile width (375px).
   → All sections remain readable and usable — buttons wrap via flex-wrap,
   modal still centers correctly within the viewport with padding,
   accordion and theme switcher remain fully functional.
   ```
