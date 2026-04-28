# How to Build.

```
Step 1 — Create the project
  mkdir code1 && cd code1
  touch index.html

Step 2 — Add the Tailwind CDN script in the <head>
  <script src="https://cdn.tailwindcss.com"></script>
  (This is the quickest way to use Tailwind with zero build configuration —
   suitable for prototypes and learning, not recommended for production
   since it ships the full Tailwind runtime rather than a purged build.)

Step 3 — Build the sticky navbar
  Use flex items-center justify-between for the navbar layout.
  Add sticky top-0 z-50 bg-white shadow-sm to keep it pinned while scrolling.
  Hide nav links on mobile with hidden md:flex.
  Add a hamburger button visible only on mobile with md:hidden.

Step 4 — Build the hero section
  Center content with flex flex-col items-center justify-center text-center.
  Use responsive text sizes: text-4xl md:text-5xl lg:text-6xl for the heading.
  Add a CTA button with hover and focus states.

Step 5 — Build the 3-column feature grid
  grid grid-cols-1 md:grid-cols-3 gap-8
  Each feature card: icon/emoji, heading, short description.

Step 6 — Test responsiveness
  Open in browser DevTools, toggle device toolbar.
  Check 375px (mobile), 768px (tablet), 1280px (desktop).
```