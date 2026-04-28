# **How to Build.**

```
Step 1 — Create and configure
  npx create-next-app@latest code3 --typescript --tailwind --eslint --app --src-dir
  cd code3
  npm install next-auth bcrypt prisma @prisma/client zod
  npm install --save-dev @types/bcrypt
  npx prisma init --datasource-provider sqlite

Step 2 — Define prisma/schema.prisma
  All 6 models with full relations.
  Run: npx prisma migrate dev --name init

Step 3 — Create src/lib/prisma.ts (singleton)

Step 4 — Set up NextAuth
  Create app/api/auth/[...nextauth]/route.ts.
  CredentialsProvider: findUser, bcrypt.compare.
  callbacks.jwt: add user.id to token.
  callbacks.session: add token.id to session.user.

Step 5 — Write middleware.ts
  Check for the next-auth session cookie.
  Redirect /dashboard/* to /login if not present.

Step 6 — Write Server Actions
  authActions.ts: registerUser with Zod + bcrypt.hash + prisma.user.create.
  cartActions.ts: addToCart, updateCartItem, removeFromCart, checkout.
  checkout uses prisma.$transaction to atomically:
    create Order + OrderItems, decrement product stock, delete CartItems.

Step 7 — Write all pages and components.
  Products pages: generateStaticParams + revalidate.
  Dashboard pages: getServerSession for auth, prisma queries for data.
  Client Components: AddToCartButton, CartItemRow (useTransition for pending state).

Step 8 — Wrap layout with AuthProvider (SessionProvider from next-auth/react).
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
