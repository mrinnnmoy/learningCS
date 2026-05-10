# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile for apps/web in a Turborepo monorepo
# Uses 'turbo prune' to create a minimal build context
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Base — set up Node.js and pnpm
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Stage 2: Pruner — generate a minimal monorepo subset for @acme/web
# This is the key step: turbo prune strips out everything @acme/web doesn't need
FROM base AS pruner
COPY . .
RUN npx turbo@2.10.4 prune @acme/web --docker
# Output:
#   /app/out/json/   — package.json files for @acme/web + its workspace deps
#   /app/out/full/   — source files for @acme/web + its workspace deps only
#   /app/out/pnpm-lock.yaml — minimal lockfile (only packages needed)

# Stage 3: Installer — install only the dependencies the pruned subset needs
FROM base AS installer
# First copy only package.json files (for Docker layer caching)
# This layer is cached unless a package.json changes
COPY --from=pruner /app/out/json/  .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 4: Builder — copy source files and build
FROM base AS builder
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Build only the web app (and its local package dependencies)
ENV NODE_ENV=production
RUN npx turbo@2.10.4 build --filter=@acme/web

# Stage 5: Runner — minimal production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy only the standalone output — no node_modules needed
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static      ./apps/web/.next/static
COPY --from=builder /app/apps/web/public            ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]