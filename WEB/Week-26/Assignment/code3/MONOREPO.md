# Acme Monorepo

A full-stack TypeScript monorepo powered by **Turborepo** and **pnpm workspaces**.

## Directory Structure.

```
acme/
├── apps/
│ ├── web/ @acme/web — customer storefront (Next.js 16, port 3000)
│ └── admin/ @acme/admin — admin dashboard (Next.js 16, port 3001)
└── packages/
├── ui/ @acme/ui — shared React components
├── types/ @acme/types — shared TypeScript interfaces
├── api-client/ @acme/api-client — typed API fetch wrapper
├── utils/ @acme/utils — shared utility functions
├── tsconfig/ @acme/tsconfig — shared TypeScript configs
└── eslint-config/@acme/eslint-config — shared ESLint flat config
```

## Getting Started

```bash
# Install all dependencies (creates workspace symlinks)
pnpm install

# Run all apps in dev mode
pnpm dev

# Run only one app
pnpm turbo dev --filter=@acme/web

# Build everything
pnpm build

# Build only changed packages vs main
pnpm build:affected
```

## How to Add a New Package

```bash
# 1. Create the directory
mkdir packages/my-package
cd packages/my-package

# 2. Create package.json
# name: "@acme/my-package"
# main: "./src/index.ts"
# devDependencies: @acme/tsconfig workspace:*

# 3. Create tsconfig.json extending @acme/tsconfig/base.json

# 4. Create src/index.ts

# 5. From the root, install
cd ../.. && pnpm install
```

## How to Add a New App

```bash
# 1. Scaffold with create-next-app
cd apps
npx create-next-app@latest my-app --typescript --tailwind --app --src-dir

# 2. Update apps/my-app/package.json
# name: "@acme/my-app"
# Add workspace dependencies: "@acme/ui": "workspace:*", "@acme/utils": "workspace:*"

# 3. Update apps/my-app/tsconfig.json
# extends: "@acme/tsconfig/nextjs.json"

# 4. Update apps/my-app/next.config.ts
# transpilePackages: ['@acme/ui', '@acme/utils', ...]

# 5. From the root
cd ../.. && pnpm install
```

## How Caching Works

Turborepo hashes every input file and environment variable for each task.

If the hash matches a cached result, the task is skipped and outputs are restored.

- **Local cache**: `.turbo/cache/` — only benefits your machine.
- **Remote cache**: shared across all developers and CI. Set `TURBO_TOKEN` and `TURBO_TEAM`.

## Docker Builds

```bash
# Build and run all apps with Docker Compose
pnpm docker:build && pnpm docker:up

# Build one app manually
docker build -f apps/web/Dockerfile -t acme-web .
```

Each app uses `turbo prune` to create a minimal build context. Only the files
that app needs are included in the Docker image.

## CI/CD

GitHub Actions runs on every PR:

1. **Lint** : Only affected packages (`--filter=[origin/main]`)
2. **Typecheck** : Only affected packages
3. **Build** : All packages (uses remote cache, near-instant for unchanged code)

Remote cache means CI almost never rebuilds from scratch.
