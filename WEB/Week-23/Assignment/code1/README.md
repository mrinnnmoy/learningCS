# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code1 --typescript --tailwind --eslint --app --src-dir
  cd code1
  npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query zod

Step 2 — Create src/server/trpc.ts
  initTRPC.create(). Export router, procedure.

Step 3 — Create src/lib/store.ts
  In-memory tasks array. Task interface: id, title, description, priority, completed, createdAt.
  Export getAll, getById, create, update, remove functions.

Step 4 — Create src/server/routers/task.ts
  All 5 procedures using store helpers.
  Import TRPCError for NOT_FOUND cases.

Step 5 — Create src/server/routers/_app.ts
  Merge taskRouter into appRouter. Export AppRouter type.

Step 6 — Create src/app/api/trpc/[trpc]/route.ts
  fetchRequestHandler with appRouter and empty context.

Step 7 — Create src/lib/trpc/client.ts
  createTRPCReact<AppRouter>(). Export trpc.

Step 8 — Create src/lib/trpc/provider.tsx
  TRPCProvider with QueryClient and httpBatchLink pointing to /api/trpc.

Step 9 — Wrap app/layout.tsx with TRPCProvider.

Step 10 — Build src/app/components/TaskList.tsx and CreateTaskForm.tsx.
  Use trpc.task.getAll.useQuery(), trpc.task.create.useMutation(), etc.
  Call utils.task.getAll.invalidate() after every mutation.

Step 11 — Compose the page in src/app/page.tsx.
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
