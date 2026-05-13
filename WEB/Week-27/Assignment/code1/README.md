# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code1 --typescript --tailwind --eslint --app --src-dir
  cd code1
  npm install prisma @prisma/client
  npx prisma init --datasource-provider sqlite

Step 2 — Write prisma/schema.prisma.
  Add Post model. Run: npx prisma migrate dev --name init

Step 3 — Create .env.example and .env.local.
  Required variables: DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL.
  Generate AUTH_SECRET with: openssl rand -base64 32

Step 4 — Create src/lib/env.ts.
  Check all required vars at module load time.
  Throw a clear error if any are missing.
  Export a typed 'env' object.

Step 5 — Create src/lib/prisma.ts.
  Singleton PrismaClient. Use env.DATABASE_URL.

Step 6 — Create src/lib/auth.ts.
  Simple cookie-based auth for this demo:
  A Server Action 'login(password)' sets a session cookie if the password
  matches AUTH_SECRET. Returns { success: boolean }.
  A helper 'getSession()' reads the cookie and returns whether logged in.

Step 7 — Update next.config.ts.
  Add security headers array. Add output: 'standalone'.
  Apply headers to all routes with source: '/(.*)'

Step 8 — Create proxy.ts.
  Protect /admin: if the session cookie is missing, redirect to /login.
  Apply to matcher: ['/admin/:path*'].

Step 9 — Create src/app/api/health/route.ts.
  Check database with prisma.$queryRaw`SELECT 1`.
  Return { status, uptime, checks, timestamp }.

Step 10 — Create pages.
  page.tsx: fetch all published posts using 'use cache' + cacheTag('posts').
  admin/page.tsx: shows all posts (published + draft) with a publish toggle.
    Server Action 'togglePublish(id)' calls revalidateTag('posts') after update.
  login/page.tsx: form calling the 'login' Server Action.

Step 11 — Create vercel.json.
  headers: no-cache for /api/* routes.
  redirects: /blog → /.

Step 12 — Deploy.
  Push to GitHub. Connect repo to Vercel.
  Add all env vars in Vercel dashboard under Settings → Environment Variables.
  Vercel auto-deploys on every push to main.
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
