# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code2 --typescript --tailwind --eslint --app --src-dir
  cd code2
  npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod bcrypt
  npm install --save-dev @types/bcrypt
  npm install prisma @prisma/client
  npx prisma init --datasource-provider sqlite

Step 2 — Write prisma/schema.prisma. Run: npx prisma migrate dev --name init

Step 3 — Create src/lib/prisma.ts (globalThis singleton).

Step 4 — Create src/server/context.ts
  Read 'userId' from request cookies.
  Return { prisma, userId: cookie value or undefined }.

Step 5 — Create src/server/trpc.ts
  initTRPC.context<Context>().create().
  isAuthenticated middleware: checks ctx.userId, throws UNAUTHORIZED if missing.
  Export procedure (public) and protectedProcedure (.use(isAuthenticated)).

Step 6 — Create src/server/routers/user.ts
  register: bcrypt.hash, prisma.user.create, return safe user.
  login: findUnique, bcrypt.compare, set cookie via context response (pass res in context).
  me: protectedProcedure, return prisma.user.findUnique({ where: { id: ctx.userId } }).
  logout: protectedProcedure, clear the cookie.

Step 7 — Create src/server/routers/post.ts
  getAll: with author select.
  getById: with author.
  create: protectedProcedure, link to ctx.userId.
  update/delete/togglePublish: fetch post, check post.authorId === ctx.userId,
    throw FORBIDDEN if not the author.

Step 8 — Wire up API route with context (pass cookies from req to createContext).

Step 9 — Build pages using tRPC hooks.
  /login and /register: use useMutation, on success router.push('/dashboard').
  /dashboard: useQuery for user.me (enabled: !!session) and user's posts.
  / (homepage): useQuery for post.getAll.
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
