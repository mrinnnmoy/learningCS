# **How to Build.**

```
Step 1 — Create the project
  npx create-next-app@latest code1 --typescript --tailwind --eslint --app --src-dir
  cd code1

Step 2 — Configure next.config.ts
  Add images.remotePatterns for dummyjson.com.

Step 3 — Create src/app/components/Navbar.tsx
  'use client' — needs usePathname.
  NavLinks array [{ href, label }].
  Map over links. className based on pathname === href.

Step 4 — Update src/app/layout.tsx
  Import and render Navbar above {children}.
  Add Inter font from next/font/google.

Step 5 — Create src/app/page.tsx (Homepage)
  Static — no data fetching. Just a heading, description, and Link to /products.

Step 6 — Create src/app/products/loading.tsx
  Animated skeleton cards using Tailwind animate-pulse.

Step 7 — Create src/app/products/page.tsx
  async Server Component. fetch dummyjson products.
  Render a grid of cards. Each card is a Link to /products/[id].

Step 8 — Create src/app/products/[id]/not-found.tsx
  Import notFound from next/navigation where needed.
  A simple message with a link back to /products.

Step 9 — Create src/app/products/[id]/page.tsx
  Typed Props with params: Promise<{ id: string }>.
  generateMetadata function fetching the product for its title.
  Call notFound() if fetch returns 404.
  Render the product with <Image> from next/image.

Step 10 — Create src/app/about/page.tsx
  Static metadata export. Static content only.
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
