# How to Build.

```
Step 1 — Copy Assignment 1 into code2/
  Everything from code1/ carries over. We extend it.

Step 2 — Update package.json
  Add ioredis to dependencies.

Step 3 — Update .env.example and .env.local
  Add REDIS_URL=redis://localhost:6379 (dev) / redis://redis:6379 (Docker).
  Keep DATABASE_URL=file:./dev.db for local dev (no Postgres needed locally).

Step 4 — Update src/lib/env.ts
  Add REDIS_URL to required vars.

Step 5 — Create src/lib/redis.ts
  ioredis singleton. Use env.REDIS_URL.

Step 6 — Update src/lib/auth.ts
  Instead of a raw cookie, store sessions in Redis:
    login(): generate a random sessionId (crypto.randomUUID()),
      store AUTH_SECRET verified flag in Redis as SET session:{id} "1" EX 604800 (7 days),
      set 'session' cookie to the sessionId.
    getSession(): read sessionId from cookie, check Redis for session:{id},
      return true if it exists.
    logout(): delete the Redis key, delete the cookie.

Step 7 — Update src/app/api/health/route.ts
  Add Redis ping check. Return checks.database AND checks.redis.

Step 8 — Write Dockerfile
  5 stages: base (node:20-alpine + pnpm), deps (npm ci --omit=dev),
  builder (COPY source + npx prisma generate + npm run build),
  runner (copy standalone output, create non-root user, CMD node server.js).

Step 9 — Write docker-compose.yml
  Services: app (build from Dockerfile), db (postgres:16-alpine),
  redis (redis:7-alpine). Health checks on all three.
  App depends_on db (healthy) and redis (healthy).
  Named volumes for db and redis data.

Step 10 — Write docker-compose.override.yml
  Used only locally (docker compose automatically merges it).
  Mount src/ as a volume so changes hot-reload without rebuilding the image.
  Override DATABASE_URL to use the local Postgres service.

Step 11 — Write nginx/nginx.conf
  Upstream: app:3000.
  Server block: listen 80, proxy_pass to upstream.
  (In production, Certbot adds the SSL block automatically.)
  For local testing, use a self-signed cert.

Step 12 — Write scripts/deploy.sh
  Pull new image.
  Run migrations.
  docker compose up -d --no-deps --build app.
  Health check loop: curl /api/health until it returns 200.
  If health check fails after 30s, roll back to previous image.
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
