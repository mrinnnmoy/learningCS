# List of things learned.

## 1. Production Readiness (What It Means).

A web application that works on your laptop is not the same as one that is production-ready.

Production means your app runs reliably for real users at real scale, handles failures gracefully, protects sensitive data and can be debugged when something goes wrong.

```
Development vs Production mindset

Development                         Production
──────────────────────────          ──────────────────────────────────
Run on your machine                 Run on servers in the cloud
One user (you)                      Thousands of concurrent users
Errors are fine — you see them      Errors must be caught, logged, and alerted
Secrets in .env.local               Secrets in secure environment vaults
No HTTPS needed                     HTTPS required
Slow builds OK                      Build time affects deploy frequency
No monitoring                       Real-time alerts and dashboards
Restart manually on crash           Process manager auto-restarts on crash
Database on your machine            Managed cloud database with backups
```

### The Production Checklist.

```
Security
  ✅ All secrets in environment variables — never committed to git
  ✅ HTTPS everywhere (TLS/SSL)
  ✅ HTTP security headers (CSP, HSTS, X-Frame-Options)
  ✅ Input validation on every API route
  ✅ Rate limiting on public API endpoints
  ✅ Authentication on all protected routes

Performance
  ✅ Images optimized with next/image
  ✅ Fonts loaded with next/font (eliminates layout shift)
  ✅ Static pages pre-rendered where possible
  ✅ Dynamic pages server-rendered with appropriate caching
  ✅ JavaScript bundle analysed and kept minimal
  ✅ Database queries indexed and optimised

Reliability
  ✅ Error boundaries on all critical UI sections
  ✅ API routes return meaningful error responses
  ✅ Database connection pooling configured
  ✅ Health check endpoint at /api/health
  ✅ Graceful shutdown handling (SIGTERM)

Observability
  ✅ Structured logging (JSON, with timestamps and request IDs)
  ✅ Error tracking (Sentry or similar)
  ✅ Performance monitoring (response times, memory, CPU)
  ✅ Uptime monitoring with alerting
```

---

## 2. Environment Variables & Secrets Management.

Environment variables are the standard way to configure an application differently across environments (development, staging, production) without changing code.

### Next.js 16 Environment Variable Rules.

```
NEXT_PUBLIC_*   Embedded in the client JavaScript bundle at build time.
                Safe for: API URLs, public keys, feature flags.
                NEVER use for: secrets, database credentials, API keys.

All others      Only available on the server (API routes, Server Components,
                Server Actions). Never sent to the browser.
                Use for: DATABASE_URL, API secrets, JWT secrets.
```

```typescript
// .env.local (never commit this file — add to .gitignore)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXTAUTH_SECRET=a-very-long-random-string-32-chars-minimum
STRIPE_SECRET_KEY=sk_live_...
REDIS_URL=redis://localhost:6379

# Public variables — safe for client bundles
NEXT_PUBLIC_APP_URL=https://myapp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# .env.example (commit this — shows what variables are needed, no real values)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
STRIPE_SECRET_KEY=sk_live_your_key_here
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

```bash
# Generate a strong secret
openssl rand -base64 32
# → dK4mVbR8nP2xQ7wZ9jL5cF1yH0sA6tE3
```

### Validating Environment Variables at Startup.

```typescript
// src/lib/env.ts
// Validate all required env vars when the app starts.
// If any are missing, crash immediately with a clear message
// rather than failing silently in production.

const required = ["DATABASE_URL", "NEXTAUTH_SECRET", "REDIS_URL"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Check your .env.local file or deployment environment settings.`,
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  REDIS_URL: process.env.REDIS_URL!,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
```

---

## 3. Next.js 16 Production Features.

### Turbopack (Stable Default Bundler).

<cite index="5-1">In Next.js 16, Turbopack is simply on — no experimental flag needed.

It achieves its gains through native Rust compilation, aggressive module caching, and lazy evaluation of only the modules that actually changed.</cite>

```typescript
// next.config.ts — Turbopack is the default, no flag needed
import type { NextConfig } from "next";

const config: NextConfig = {
  // Turbopack powers both dev and build automatically
  // If you need to opt back into webpack (for specific plugins):
  // bundler: 'webpack',  // only do this if you have a webpack-specific need
};

export default config;
```

### The `use cache` Directive (Explicit Caching).

<cite index="8-1">Next.js 16 introduces explicit caching control with the `use cache` directive, replacing the implicit and often confusing caching behavior of previous versions.

You decide what gets cached, not the framework.</cite>

```typescript
// Cache an entire Server Component
async function ProductList() {
  'use cache';

  const products = await db.product.findMany({ where: { featured: true } });
  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

// Cache a data-fetching function with tags for targeted revalidation
async function getProducts() {
  'use cache';
  // cacheTag lets you invalidate this specific cache entry later
  // cacheLife sets how long the cache is valid
  const { cacheTag, cacheLife } = await import('next/cache');
  cacheTag('products');
  cacheLife('hours'); // cache for hours; also accepts 'minutes', 'days', 'weeks'

  return db.product.findMany();
}

// Revalidate the cache from a Server Action
async function addProduct(formData: FormData) {
  'use server';
  await db.product.create({ data: { name: formData.get('name') as string } });

  // Invalidate the products cache — next request will re-fetch
  const { revalidateTag } = await import('next/cache');
  revalidateTag('products');
}
```

### `proxy.ts` (Replaces `middleware.ts`).

<cite index="9-1">In Next.js 16, `proxy.ts` replaces `middleware.ts` and makes the app's network boundary explicit.

`proxy.ts` runs on the Node.js runtime.</cite>

```typescript
// proxy.ts — at the root of your project (was middleware.ts in Next.js 15)
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Example: redirect /old-blog/:path to /blog/:path
  if (pathname.startsWith("/old-blog")) {
    const newPath = pathname.replace("/old-blog", "/blog");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Example: add security headers to every response
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### Security Headers.

```typescript
// next.config.ts — security headers for all responses
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const config: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: securityHeaders,
    },
  ],
};

export default config;
```

### Performance Optimisations.

```tsx
// next/image — automatic format conversion (WebP/AVIF), lazy loading, sizing
import Image from 'next/image';

// Above-the-fold image: use priority to preload
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority        // preloads — use only for LCP (Largest Contentful Paint) image
  quality={85}    // 85 is a good balance of quality vs file size
/>

// Below-the-fold images: lazy load by default (no priority)
<Image
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={300}
  // loading="lazy" is the default — no need to specify
/>

// next/font — load fonts without layout shift (CLS = 0)
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',    // CSS variable for Tailwind
  display:  'swap',
});

const mono = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-mono',
  display:  'swap',
});

// In your layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. Deployment to Vercel.

Vercel is the easiest deployment platform for Next.js — built by the same team, with zero configuration required.

```
How Vercel deployment works:

  1. Push code to GitHub/GitLab/Bitbucket.
  2. Vercel detects the push, starts building automatically.
  3. next build runs on Vercel's servers.
  4. The output is deployed to a global CDN.
  5. Your app is live at yourdomain.com in ~60 seconds.

Every pull request also gets a unique preview URL:
  main branch → yourdomain.com
  feature-branch PR → pr-42.yourapp.vercel.app
```

```bash
# Deploy via CLI
npm install -g vercel

# First deploy — follow the prompts
vercel

# Deploy to production
vercel --prod

# Set an environment variable
vercel env add DATABASE_URL production

# View logs
vercel logs yourdomain.com

# Pull environment variables to .env.local
vercel env pull .env.local
```

### `vercel.json` Configuration.

```json
{
  "framework": "nextjs",
  "regions": ["iad1", "lhr1"],

  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ],

  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],

  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://api.external.com/:path*"
    }
  ]
}
```

---

## 5. Deployment with Docker.

Docker packages your app and all its dependencies into a portable container that runs identically everywhere — your laptop, a VPS, AWS or any cloud provider.

```
Why Docker for Next.js?
  ✅ Same environment everywhere (dev, staging, production)
  ✅ Works on any cloud (not locked to Vercel)
  ✅ Easy to run alongside other services (database, Redis, etc.)
  ✅ Kubernetes-ready for large-scale deployments
```

### Multi-Stage Dockerfile for Next.js 16.

```dockerfile
# syntax=docker/dockerfile:1

# ─── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files only (for Docker layer caching)
# This layer rebuilds only when dependencies change, not when source changes
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ─── Stage 2: Build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables (safe public ones only)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ─── Stage 3: Runner ────────────────────────────────────────────────────────
# Uses Next.js standalone output — smallest possible image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy only the output needed to run the app — no source code, no dev deps
COPY --from=builder /app/public            ./public
COPY --from=builder --chown=nextjs:nodejs  /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs  /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3000

# server.js is generated by Next.js standalone output
CMD ["node", "server.js"]
```

```typescript
// next.config.ts — required for the standalone Dockerfile above
import type { NextConfig } from "next";

const config: NextConfig = {
  // Produces a self-contained server in .next/standalone/
  // Includes only the exact node_modules needed to run
  // Typically reduces image size from ~1GB to ~100MB
  output: "standalone",
};

export default config;
```

```bash
# Build the image
docker build -t myapp:latest .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e NEXTAUTH_SECRET=... \
  myapp:latest

# Check image size
docker images myapp
```

### `docker-compose.yml` for Local Production Testing.

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

---

## 6. Self-Hosting on a VPS (DigitalOcean / Hetzner / AWS EC2).

Platforms like Vercel and Railway are convenient but add cost at scale. A VPS gives you full control.

```bash
# On your server (Ubuntu 22.04 LTS)

# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2 — process manager that keeps your app alive
npm install -g pm2

# 3. Clone your repo and install dependencies
git clone https://github.com/yourname/your-app.git
cd your-app
npm ci --only=production

# 4. Set environment variables
cp .env.example .env.local
nano .env.local  # fill in your production values

# 5. Build the app
npm run build

# 6. Start with PM2
pm2 start npm --name "myapp" -- start

# 7. Save PM2 config so it survives server restarts
pm2 save
pm2 startup  # follow the printed instructions

# 8. Check status
pm2 status
pm2 logs myapp --lines 100
```

### Nginx as a Reverse Proxy.

```nginx
# /etc/nginx/sites-available/myapp.conf
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates managed by Certbot (Let's Encrypt)
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    add_header          Strict-Transport-Security "max-age=63072000" always;

    # Static files served directly by Nginx (much faster than Node.js)
    location /_next/static {
        alias /var/www/myapp/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /public {
        alias /var/www/myapp/public;
        expires 1y;
    }

    # Everything else goes to Next.js
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Install free SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Enable the site
sudo ln -s /etc/nginx/sites-available/myapp.conf /etc/nginx/sites-enabled/
sudo nginx -t      # test config
sudo systemctl reload nginx
```

---

## 7. Database Management in Production.

```
Production database rules:
  ✅ Never use SQLite in production — use PostgreSQL or MySQL
  ✅ Use a managed database service (Neon, Supabase, PlanetScale, RDS)
  ✅ Set up automated daily backups
  ✅ Use connection pooling (PgBouncer or Prisma Accelerate)
  ✅ Never run migrations manually — use automated migration scripts
  ✅ Test migrations on staging before production
  ✅ Never run npx prisma db push on production — use prisma migrate deploy
```

### Prisma 6 in Production.

```typescript
// src/lib/prisma.ts — singleton with connection pooling config
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"], // only log errors in production
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

```bash
# Production migration workflow

# 1. Create migration (development)
npx prisma migrate dev --name add_user_role

# 2. Commit the migration files to git (do NOT .gitignore migrations/)
git add prisma/migrations/ && git commit -m "feat: add user role column"

# 3. On production server / in CI pipeline
npx prisma migrate deploy  # applies pending migrations safely
                           # NEVER use migrate dev on production
```

---

## 8. Logging and Error Monitoring.

In production, `console.log` is not enough. You need structured logs that can be searched, aggregated and alerted on.

### Structured Logging.

```typescript
// src/lib/logger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  path?: string;
  duration?: number;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

function log(
  level: LogLevel,
  message: string,
  meta: Partial<LogEntry> = {},
): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // In production: output JSON so log aggregators (Datadog, Logtail, etc.) can parse it
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    // In development: human-readable with colour
    const colours: Record<LogLevel, string> = {
      info: "\x1b[36m", // cyan
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
      debug: "\x1b[90m", // gray
    };
    const reset = "\x1b[0m";
    console.log(
      `${colours[level]}[${level.toUpperCase()}]${reset} ${message}`,
      meta,
    );
  }
}

export const logger = {
  info: (msg: string, meta?: Partial<LogEntry>) => log("info", msg, meta),
  warn: (msg: string, meta?: Partial<LogEntry>) => log("warn", msg, meta),
  error: (msg: string, meta?: Partial<LogEntry>) => log("error", msg, meta),
  debug: (msg: string, meta?: Partial<LogEntry>) => log("debug", msg, meta),
};
```

```typescript
// Using the logger in API routes
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    logger.info("Order creation started", { requestId, userId: body.userId });

    const order = await createOrder(body);

    logger.info("Order created successfully", {
      requestId,
      userId: body.userId,
      orderId: order.id,
      duration: Date.now() - start,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    logger.error("Order creation failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      duration: Date.now() - start,
    });

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Error Tracking with Sentry.

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Only send 10% of traces in production to manage costs
});

// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

```tsx
// Error boundary for graceful client-side error handling
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <button
            onClick={reset}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

---

## 9. CI/CD Pipeline with GitHub Actions.

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ─── Job 1: Run tests ───────────────────────────────────────────────────
  test:
    name: Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci

      - name: Run migrations
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
        run: npx prisma migrate deploy

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          NEXTAUTH_SECRET: test-secret-for-ci
        run: npm test

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint

  # ─── Job 2: Build and push Docker image ─────────────────────────────────
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: test
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ─── Job 3: Deploy to production ────────────────────────────────────────
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    environment: production # requires manual approval in GitHub

    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            # Pull the new image
            docker pull ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

            # Run migrations before swapping the container
            docker run --rm \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
              npx prisma migrate deploy

            # Swap containers with zero downtime
            docker stop myapp || true
            docker rm   myapp || true
            docker run -d \
              --name myapp \
              -p 3000:3000 \
              -e NODE_ENV=production \
              -e DATABASE_URL=${{ secrets.DATABASE_URL }} \
              -e NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }} \
              --restart unless-stopped \
              ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}

            # Health check
            sleep 5
            curl -f http://localhost:3000/api/health || (docker logs myapp && exit 1)
```

---

## 10. Health Checks & Monitoring.

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  uptime: number;
  checks: Record<string, "ok" | "error">;
  timestamp: string;
}

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  const status: HealthStatus["status"] = allOk ? "ok" : "degraded";

  const body: HealthStatus = {
    status,
    version: process.env.npm_package_version ?? "0.0.0",
    uptime: Math.floor(process.uptime()),
    checks,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
  });
}
```

---

## Assignment.

1. **Deploy a Next.js 16 App to Vercel with Production Best Practices.**

   **What you practice:**
   - Setting up a production-ready Next.js 16 project from scratch
   - Environment variable validation with a typed `env.ts` module
   - Security headers in `next.config.ts`
   - `proxy.ts` (replacing `middleware.ts`) for route protection and redirects
   - `use cache` directive for explicit server-side caching
   - `next/image` and `next/font` for zero-CLS performance
   - A health check API endpoint at `/api/health`
   - `.env.example` for documenting required environment variables
   - `vercel.json` configuration

   **Requirements:**
   - A Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 6 app (SQLite in dev, configurable to Postgres in prod).
   - Models: `Post` (id, title, body, published, createdAt).
   - Pages:
     - `/` — public blog listing using `use cache` and `revalidateTag('posts')`.
     - `/admin` — protected page (redirected to `/login` by `proxy.ts` if not authenticated).
     - `/login` — login form using a Server Action.
     - `/api/health` — health check endpoint returning JSON.
   - Environment variable validation in `src/lib/env.ts` — crash on startup if any required var is missing.
   - Security headers applied to all routes in `next.config.ts`.
   - `vercel.json` with caching rules for API routes and a redirect from `/blog` to `/`.
   - `.env.example` documenting all required variables.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # Setup
   npx prisma migrate dev --name init
   npm run dev → open http://localhost:3000

   # 1. Security headers
   curl -I http://localhost:3000 | grep -i "x-frame\|x-content\|referrer\|content-security"
   → X-Frame-Options: SAMEORIGIN
   → X-Content-Type-Options: nosniff
   → Referrer-Policy: strict-origin-when-cross-origin
   → Content-Security-Policy: default-src 'self' ...

   # 2. Health check
   GET http://localhost:3000/api/health
   → { "status": "ok", "uptime": 42, "checks": { "database": "ok" }, "timestamp": "..." }

   # 3. proxy.ts protection
   Visit http://localhost:3000/admin without logging in.
   → Redirected to /login?from=%2Fadmin (proxy.ts fired before the page rendered).

   # 4. Login
   Visit /login. Enter the value of AUTH_SECRET from .env.local.
   Click Login.
   → Redirected to /admin. The 'session' cookie is set (check DevTools → Application → Cookies).
   → httpOnly: true means JavaScript cannot read it (inspect in DevTools to verify).

   # 5. Create a post
   In the admin panel, fill in title and body. Click "Create Post".
   → Post appears in the list as a Draft.
   → Server Action ran, no page reload (streaming update from the server).

   # 6. Publish and verify caching
   Click "Publish" on the post.
   → revalidateTag('posts') is called.
   → Visit / — the post appears immediately (cache was invalidated).
   Click "Unpublish".
   → Visit / again — post disappears (cache invalidated again).

   # 7. Missing env var crash
   Remove AUTH_SECRET from .env.local. Run: npm run dev
   → Server crashes on startup:
   ❌ Missing required environment variable: AUTH_SECRET
   Check your .env.local file...
   → Clear failure message, not a cryptic null reference error.
   Add it back — server starts normally.

   # 8. vercel.json redirects (when deployed to Vercel)
   Visit https://yourapp.vercel.app/blog
   → 301 redirect to https://yourapp.vercel.app/

   # 9. Environment variable validation
   NEXT_PUBLIC_* vars are embedded at build time.
   Check: process.env.AUTH_SECRET is undefined in the browser console
       (it's server-only — never exposed to the client).
   Check: process.env.NEXT_PUBLIC_APP_URL is visible in the browser console
       (it's intentionally public).
   ```

2. **Dockerise a Next.js 16 App and Deploy to a VPS.**

   **What you practice:**
   - Writing a multi-stage `Dockerfile` using `output: 'standalone'` for minimal image size
   - `docker-compose.yml` with the app, PostgreSQL, and Redis as separate services
   - Writing a `docker-compose.override.yml` for local development overrides
   - Configuring Nginx as a reverse proxy with HTTPS (using a self-signed cert in dev)
   - Writing a graceful shutdown handler that catches `SIGTERM` to finish in-flight requests
   - A deployment script (`scripts/deploy.sh`) that pulls the new image, runs migrations, and swaps containers with zero downtime
   - A health check endpoint that verifies DB and Redis connectivity before the container is marked healthy

   **Requirements:**
   - Extend Assignment 1's blog app with:
     - PostgreSQL in production (still SQLite in `.env.local` dev mode).
     - Redis for session storage (replacing the simple cookie in Assignment 1).
     - A proper `Dockerfile` producing a ~100MB image.
     - `docker-compose.yml` with health checks on all services.
     - `docker-compose.override.yml` for local development (volume mounts for hot reload).
     - An `nginx/nginx.conf` for reverse proxying with SSL termination.
     - `scripts/deploy.sh` for zero-downtime deployments.
     - `src/app/api/health/route.ts` checking both DB and Redis.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # ─── Local Docker test ───────────────────────────────────────────────────

   # Build and start everything
   docker compose up --build

   # Wait for all services to be healthy
   docker compose ps
   → All services should show "healthy" after ~30 seconds.

   # 1. Health check
   curl http://localhost:3000/api/health
   → { "status": "ok", "checks": { "database": "ok", "redis": "ok" }, ... }

   # 2. App is accessible
   curl -I http://localhost:80
   → 200 OK (Nginx proxied to Next.js)

   # 3. Security headers via Nginx
   curl -I http://localhost:80 | grep -i "x-frame\|x-content"
   → Headers present (from next.config.ts security headers)

   # 4. Login and session in Redis
   Visit http://localhost:3000/admin → redirected to /login (proxy.ts).
   Login with AUTH_SECRET from .env.local.
   → Session cookie set. Admin panel loads.
   Check Redis:
   docker compose exec redis redis-cli KEYS "session:*"
   → "session:some-uuid-here"
   docker compose exec redis redis-cli TTL "session:some-uuid-here"
   → ~604800 (7 days)

   # 5. Session survives app container restart
   Create a post. Note the session cookie value.
   docker compose restart app
   → App restarts. Wait for healthy.
   Refresh /admin.
   → Still logged in (session is in Redis, not in-memory — survives restarts).

   # 6. Database persistence
   Create a post via the admin panel.
   docker compose down && docker compose up -d
   → All services restart. Data is still in the named volume.
   Visit / → Post is still there.

   # 7. Health check when Redis is down
   docker compose stop redis
   curl http://localhost:3000/api/health
   → { "status": "degraded", "checks": { "database": "ok", "redis": "error" }, ... }
   → HTTP 503
   docker compose start redis → health returns 200 again.

   # 8. Image size
   docker images | grep week27
   → Image should be ~100-150MB (not 1GB like a naive Node.js image)
   This is because of output: 'standalone' + Alpine base.

   # 9. deploy.sh (simulate a redeploy)
   bash scripts/deploy.sh <your-image-tag>
   → Pulls image → runs migrations → replaces container → health checks pass → "Deployment complete"
   ```

3. **Full CI/CD Pipeline: GitHub Actions, Docker Registry and Zero-Downtime Deployment.**

   **What you practice:**
   - Writing a complete multi-job GitHub Actions pipeline (test → build → deploy)
   - Building and pushing Docker images to GitHub Container Registry (GHCR)
   - Using GitHub Actions environments with required reviewers for production gates
   - Structured logging with a `logger.ts` module that outputs JSON in production
   - Global error handling with `app/global-error.tsx`
   - Rate limiting on API routes using Redis and a sliding window algorithm
   - `robots.txt` and `sitemap.xml` generation from dynamic data
   - A bundle analyser script to track and optimise JavaScript bundle size
   - A complete runbook in `RUNBOOK.md` documenting operational procedures

   **Requirements:**
   - A Next.js 16 + React 19 + Tailwind CSS 4 + Prisma 6 (PostgreSQL) blog app.
   - A complete `.github/workflows/ci-cd.yml` with three jobs:
     1. `test` — lint, typecheck, unit tests with a real PostgreSQL service container.
     2. `build` — build and push Docker image to GHCR with the commit SHA as the tag.
     3. `deploy` — pull the image, run migrations, swap the container, health check.
   - Rate limiting middleware in `proxy.ts` using Redis (max 100 requests per minute per IP).
   - Structured JSON logging via `src/lib/logger.ts`.
   - `src/app/global-error.tsx` as the catch-all error boundary.
   - `src/app/robots.ts` and `src/app/sitemap.ts` for SEO.
   - `scripts/analyze-bundle.sh` that runs `@next/bundle-analyzer` and opens the report.
   - `RUNBOOK.md` with operational procedures (deploy, rollback, DB backup, incident response).

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # ─── CI/CD Pipeline ──────────────────────────────────────────────────────

   # 1. Trigger the pipeline
   git add -A && git commit -m "feat: add CI/CD pipeline"
   git push origin main
   → Go to GitHub → Actions tab.
   → See the pipeline running: test → build → deploy.
   → test job: lint passes, typecheck passes, migrations run against the Postgres service container.
   → build job: Docker image built, pushed to ghcr.io/<owner>/<repo>:sha-<commit>.
   → deploy job: waits for manual approval (GitHub environment protection), then deploys.

   # 2. Rate limiting
   # Make 101 requests to any API route
   for i in $(seq 1 101); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/health; done
   → First 100 requests: 200
   → Request 101: 429 (Too Many Requests)
   → Response includes Retry-After: 60 header.

   # 3. Global error boundary
   Temporarily throw an error in src/app/page.tsx: throw new Error('test error').
   Visit http://localhost:3000.
   → global-error.tsx renders instead of crashing with a white screen.
   → Shows error page with "Try again" and "Go home" buttons.
   → useEffect logs the error (check browser console).
   Revert the test error.

   # 4. robots.txt
   GET http://localhost:3000/robots.txt
   → User-agent: *
   Allow: /
   Disallow: /admin
   Disallow: /login
   Disallow: /api/
   Sitemap: http://localhost:3000/sitemap.xml

   # 5. sitemap.xml
   Create a few published posts. Then:
   GET http://localhost:3000/sitemap.xml
   → XML with the homepage URL and one entry per published post.
   → Unpublished posts do NOT appear.

   # 6. Structured logging
   npm run build && npm run start
   Create a post from the admin panel.
   → Server terminal shows JSON log entries:
   {"level":"info","message":"Post created","timestamp":"2025-...","postId":1}
   → In development mode (npm run dev): same entries in colour-formatted text.

   # 7. Bundle analysis
   bash scripts/analyze-bundle.sh
   → Build runs with ANALYZE=true.
   → .next/analyze/client.html opens in browser.
   → Shows a treemap of all JavaScript bundles.
   → Identify and note the largest dependencies.

   # 8. RUNBOOK procedures
   Follow the DB backup procedure:
   docker compose exec db pg_dump -U postgres blogdb > backup_test.sql
   → SQL file created with the database contents.
   Follow the session flush procedure:
   → All logged-in users are logged out after the flush.
   → Visiting /admin redirects to /login.
   ```
