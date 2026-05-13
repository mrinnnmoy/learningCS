# How to Build.

```
Step 1 — Start from Assignment 2 (code2/).
  All database, Redis, Prisma, auth, and Docker config carries over.

Step 2 — Create src/lib/logger.ts.
  In production (NODE_ENV=production): JSON.stringify each log entry.
  In development: colour-formatted console output.
  Export: logger.info(), logger.warn(), logger.error(), logger.debug().
  Each entry includes: level, message, timestamp, plus any metadata passed.

Step 3 — Update src/app/api/health/route.ts.
  Use logger.info() instead of console.log for the health check hit.
  Return the same JSON shape as Assignment 2.

Step 4 — Update proxy.ts to add rate limiting.
  For each incoming request:
    Extract the client IP from X-Forwarded-For header or request.ip.
    Construct a Redis key: ratelimit:{ip}.
    Use Redis INCR to count requests. On first request, set TTL of 60 seconds.
    If count > 100: return 429 Too Many Requests with Retry-After header.
    Otherwise: continue to next().
  Apply rate limiting only to /api/* routes to avoid limiting page navigation.

Step 5 — Create src/app/global-error.tsx.
  'use client' component.
  Receives { error, reset } props.
  useEffect: log the error (or send to Sentry in production).
  Render: a styled error page with a "Try again" button that calls reset().

Step 6 — Create src/app/robots.ts.
  Export default a function returning { rules: [{ userAgent: '*', allow: '/' }],
  sitemap: `${env.APP_URL}/sitemap.xml` }.
  Next.js automatically serves this at /robots.txt.

Step 7 — Create src/app/sitemap.ts.
  Fetch all published posts from the DB.
  Return an array of { url, lastModified, changeFrequency, priority } objects.
  Include the homepage and each post's URL.
  Next.js serves this at /sitemap.xml.

Step 8 — Write .github/workflows/ci-cd.yml.
  Job 1 (test):
    postgres service container for real DB tests.
    Steps: checkout, setup node, npm ci, prisma migrate deploy, tsc --noEmit, eslint.
  Job 2 (build): needs test.
    Steps: checkout, docker login to ghcr.io, docker build, docker push with sha tag.
    Use docker build cache: type=gha for fast CI builds.
  Job 3 (deploy): needs build, environment: production.
    SSH to production server.
    Run: docker pull, prisma migrate deploy, docker compose up -d --no-deps app.
    Health check loop.

Step 9 — Write scripts/analyze-bundle.sh.
  Install @next/bundle-analyzer if not installed.
  Run: ANALYZE=true npm run build.
  Open the generated HTML report in the default browser.

Step 10 — Update next.config.ts.
  Wrap config with bundle analyzer: if ANALYZE=true, wrap with withBundleAnalyzer.

Step 11 — Write RUNBOOK.md.
  Sections: Deploy, Rollback, Check Logs, DB Backup, Redis Flush, Incident Response.
  Each section has the exact commands to run.
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
