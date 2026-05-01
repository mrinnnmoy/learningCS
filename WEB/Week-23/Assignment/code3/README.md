# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code3 --typescript --tailwind --eslint --app --src-dir
  cd code3
  npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query
  npm install zod bcrypt prisma @prisma/client react-hook-form @hookform/resolvers
  npm install --save-dev @types/bcrypt
  npx prisma init --datasource-provider sqlite

Step 2 — Define all schemas in src/schemas/
  auth.ts:    RegisterSchema, LoginSchema (with z.infer types exported).
  product.ts: CreateProductSchema, ProductSchema.
  cart.ts:    AddToCartSchema, UpdateCartItemSchema.
  order.ts:   CheckoutSchema, UpdateOrderStatusSchema.

Step 3 — Write prisma/schema.prisma. Run npx prisma migrate dev --name init.

Step 4 — Create src/lib/events.ts
  A typed EventEmitter subclass that emits order status changes.
  export const orderEvents = new OrderEventEmitter().

Step 5 — Create src/server/context.ts
  Read userId cookie. Return { prisma, userId, setCookie, clearCookie }.

Step 6 — Create src/server/trpc.ts
  isAuthenticated middleware. isAdmin middleware (check user.role).
  Export procedure, protectedProcedure, adminProcedure.

Step 7 — Build all 4 routers.
  cart.ts: addItem uses onMutate in tests (optimistic on client).
  order.ts: checkout uses prisma.$transaction.
             onStatusChange is a subscription using observable + orderEvents.

Step 8 — Create src/lib/trpc/server.ts
  createCallerFactory(appRouter) for Server Component usage.

Step 9 — Build all pages.
  app/page.tsx: Server Component using serverTrpc.product.getAll() directly.
  app/products/[id]/page.tsx: Server Component for product detail.
  app/cart/page.tsx: Client Component reading cart with optimistic updates.
  app/orders/page.tsx: Client Component with OrderStatusListener subscription.
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
