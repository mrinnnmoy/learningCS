# How to Build.

```
Step 1 — Start from Assignment 2
  Copy code2/ to code3/.

Step 2 — Write apps/web/Dockerfile (multi-stage with turbo prune)
  Stage 1 (base):   node:20-alpine, install pnpm globally.
  Stage 2 (pruner): COPY the full monorepo. RUN turbo prune @acme/web --docker.
    turbo prune generates:
      out/json/   — only the package.json files needed for @acme/web and its deps
      out/full/   — only the source files needed
      out/pnpm-lock.yaml — pruned lockfile
  Stage 3 (installer): COPY out/json and lockfile. RUN pnpm install (fetches only needed packages).
  Stage 4 (builder):   COPY out/full source files. RUN turbo build --filter=@acme/web.
  Stage 5 (runner):    Copy only .next/standalone and .next/static from builder.
    Use next.config.ts output: 'standalone' for minimal image.

Step 3 — Update apps/web/next.config.ts
  Add output: 'standalone' so Next.js produces a self-contained server.

Step 4 — Write docker-compose.yml
  Services: web (builds apps/web/Dockerfile), admin (builds apps/admin/Dockerfile).
  web:   ports 3000:3000, environment NODE_ENV=production.
  admin: ports 3001:3001, environment NODE_ENV=production.

Step 5 — Write .github/workflows/ci.yml
  Trigger: push to main, pull_request to main.
  Steps: checkout (fetch-depth 0), setup pnpm, setup node with cache,
    pnpm install --frozen-lockfile,
    turbo lint --filter=[origin/main],
    turbo typecheck --filter=[origin/main],
    turbo test --filter=[origin/main],
    turbo build.
  Add TURBO_TOKEN and TURBO_TEAM env vars for remote cache.

Step 6 — Write scripts/check-affected.sh
  Uses turbo run build --dry-run=json --filter=[origin/main]
  Parses the JSON output to list affected packages.
  Echo each affected package name.

Step 7 — Write MONOREPO.md
  Explain: directory structure, how to add a package, how to add an app,
  how caching works, how to run individual tasks, how CI uses affected filtering.
```
