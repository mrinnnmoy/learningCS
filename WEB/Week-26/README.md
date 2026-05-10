# List of things learned.

## 1. What is a Monorepo & Why Use One.

A **monorepo** is a single Git repository that contains multiple related packages or applications.

Instead of maintaining five separate repositories for your web app, mobile app, API, shared UI library and shared utility functions — all five live together in one repo.

```
Polyrepo (5 separate repositories)
  github.com/acme/web-app       ← separate repo
  github.com/acme/mobile-app    ← separate repo
  github.com/acme/api-server    ← separate repo
  github.com/acme/ui-library    ← separate repo
  github.com/acme/utils         ← separate repo

  Problems:
  - Changing a shared utility requires: open utils repo → change → publish → update
    web-app → update mobile-app → update api-server (3 PRs minimum)
  - Version mismatches: web-app uses utils@1.2, api uses utils@1.1 — subtle bugs
  - No atomic commits across packages
  - Duplicated tooling config in every repo (ESLint, TypeScript, Prettier, CI)
```

```
Monorepo (1 repository)
  github.com/acme/acme/
  ├── apps/
  │   ├── web/       ← Next.js frontend
  │   ├── mobile/    ← React Native app
  │   └── api/       ← Express API
  └── packages/
      ├── ui/        ← shared React components
      └── utils/     ← shared TypeScript utilities

  Benefits:
  ✅ One change to utils is instantly reflected in all apps (no publish step)
  ✅ Atomic commits: "refactor button component + update all usages" in one PR
  ✅ Single version of every dependency across all packages
  ✅ Shared ESLint, TypeScript, and Prettier config
  ✅ One CI pipeline, one place to run all tests
```

### Monorepo vs Polyrepo (When to Use Which).

```
Monorepo                              Polyrepo
────────────────────────────────      ────────────────────────────────
Packages share lots of code           Teams work on completely independent products
Atomic cross-package changes needed   Strong ownership boundaries are important
Small-to-medium engineering team      Very large org (hundreds of teams)
Consistent tooling is valued          Teams need different release cadences
Example: Vercel, Meta, Google         Example: acquired products, separate companies
```

---

## 2. Workspaces (The Foundation of Monorepos).

All modern package managers (npm, pnpm, Yarn) support **workspaces**.

A feature that links packages within a monorepo together so they can import each other without publishing to npm.

### `pnpm` Workspaces (Recommended).

```yaml
# pnpm-workspace.yaml — at the root of the monorepo
packages:
  - "apps/*" # everything in apps/ is a workspace package
  - "packages/*" # everything in packages/ is a workspace package
```

```json
// Root package.json
{
  "name": "acme-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.10.4"
  },
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  }
}
```

```json
// apps/web/package.json — a workspace package
{
  "name": "@acme/web",
  "version": "0.0.1",
  "dependencies": {
    "@acme/ui": "workspace:*", // ← references the local packages/ui package
    "@acme/utils": "workspace:*" // ← references the local packages/utils package
  }
}
```

```json
// packages/ui/package.json — a shared package
{
  "name": "@acme/ui",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### How Workspace Linking Works.

```
After running pnpm install at the root, pnpm creates symlinks:

  node_modules/@acme/ui    → packages/ui        (symlink)
  node_modules/@acme/utils → packages/utils     (symlink)

So when apps/web does:
  import { Button } from '@acme/ui';

Node resolves it to packages/ui/src/index.ts — no publish step needed.
Changes to packages/ui are instantly available in apps/web.
```

### Useful pnpm Workspace Commands.

```bash
# Install a dependency in a specific workspace
pnpm add react --filter @acme/web

# Install a local package as a dependency
pnpm add @acme/ui --filter @acme/web --workspace

# Run a script in all workspaces
pnpm -r run build

# Run a script in a specific workspace
pnpm --filter @acme/web run dev

# Run a script in a workspace and its local dependencies
pnpm --filter @acme/web... run build
```

---

## 3. Turborepo (The Build Orchestrator).

Turborepo is a high-performance build system for JavaScript and TypeScript monorepos, <cite index="10-1">written in Rust</cite>.

It sits on top of your package manager's workspaces and adds two things that make monorepos fast and manageable:

1. **Caching:** If nothing changed, don't rebuild. Turborepo hashes every input (source files, environment variables, dependencies) and skips tasks whose outputs are already cached.
2. **Parallelism:** Run tasks in parallel when possible and enforce correct ordering when tasks depend on each other.

```bash
# Install Turborepo
npm install turbo --save-dev

# Or start a new monorepo from a template
npx create-turbo@latest
```

### `turbo.json` (The Pipeline Configuration).

```json
// turbo.json — at the root of the monorepo
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    // The 'build' task
    "build": {
      // This package's build depends on its dependencies' builds completing first
      // ^build means: run build in all dependency packages before running this one
      "dependsOn": ["^build"],
      // Cache inputs: any change to these files invalidates the cache
      "inputs": ["src/**", "package.json", "tsconfig.json"],
      // Cache outputs: these are what gets stored and restored from cache
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },

    // The 'dev' task (persistent — never completes)
    "dev": {
      "persistent": true, // long-running task (dev server, watch mode)
      "cache": false // never cache dev tasks
    },

    // The 'lint' task (no dependency ordering needed)
    "lint": {
      "dependsOn": [], // lint each package independently
      "inputs": ["src/**", ".eslintrc.*", "eslint.config.*"]
    },

    // The 'test' task
    "test": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "test/**", "vitest.config.*"],
      "outputs": ["coverage/**"]
    },

    // The 'typecheck' task
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["src/**", "tsconfig.json"]
    }
  }
}
```

### How the Task Graph Works.

```
Given this dependency graph:
  @acme/web    depends on  @acme/ui, @acme/utils
  @acme/api    depends on  @acme/utils
  @acme/ui     depends on  (nothing)
  @acme/utils  depends on  (nothing)

Running: turbo build

Turborepo resolves the build order:

  Step 1 (parallel): build @acme/ui AND @acme/utils simultaneously
                     (no dependencies — can start immediately)

  Step 2 (parallel): build @acme/web AND @acme/api simultaneously
                     (wait for Step 1 to complete first because of "^build")

  Total time ≈ max(ui_build, utils_build) + max(web_build, api_build)
  vs sequential: ui + utils + web + api  (much slower)
```

---

## 4. Caching (Never Build the Same Thing Twice).

Caching is the most important feature of Turborepo.

When you run `turbo build`, Turborepo:

1. Computes a hash of all inputs (source files, dependencies, env vars).
2. Checks if a cache entry exists for that hash.
3. If yes → **cache hit**: restore outputs instantly, skip the task.
4. If no → **cache miss**: run the task, store outputs to cache.

```
First run (cache miss):
  turbo build
  ● Packages in scope: @acme/ui, @acme/utils, @acme/web, @acme/api
  ● Running build in 4 packages
  @acme/utils:build: cache miss, executing...  (2.1s)
  @acme/ui:build:    cache miss, executing...  (3.4s)
  @acme/web:build:   cache miss, executing...  (8.2s)
  @acme/api:build:   cache miss, executing...  (4.1s)
  Tasks: 4 successful, 4 total (0 cached)
  Time: 11.6s

Second run (nothing changed — full cache hit):
  turbo build
  @acme/utils:build: cache hit, replaying output... (0.01s)
  @acme/ui:build:    cache hit, replaying output... (0.01s)
  @acme/web:build:   cache hit, replaying output... (0.01s)
  @acme/api:build:   cache hit, replaying output... (0.01s)
  Tasks: 4 successful, 4 total (4 cached)
  Time: 0.1s  ← 99% faster!

After changing only @acme/utils:
  turbo build
  @acme/utils:build: cache miss, executing...  (2.1s)  ← changed
  @acme/ui:build:    cache hit, replaying...   (0.01s) ← unchanged
  @acme/web:build:   cache miss, executing...  (8.2s)  ← depends on utils
  @acme/api:build:   cache miss, executing...  (4.1s)  ← depends on utils
  Tasks: 4 successful, 4 total (1 cached)
  Time: 10.3s  ← only rebuilt what changed
```

### Cache Inputs and Outputs.

```json
// turbo.json
{
  "tasks": {
    "build": {
      // Inputs: files that, when changed, invalidate the cache
      // Default: all files tracked by git in the package
      "inputs": [
        "src/**/*.ts",
        "src/**/*.tsx",
        "package.json",
        "tsconfig.json",
        "!src/**/*.test.ts" // exclude test files from build cache key
      ],

      // Outputs: files produced by the task — stored in cache and restored on hit
      "outputs": [
        ".next/**", // Next.js build output
        "!.next/cache/**", // exclude Next.js internal cache (too large)
        "dist/**", // TypeScript compilation output
        "storybook-static/**" // Storybook build output
      ]
    }
  }
}
```

### Remote Caching.

```
Local cache (default):
  Stored in .turbo/cache on your machine.
  Only benefits you — teammates start cold.

Remote cache (Vercel or self-hosted):
  Shared across all developers and CI.
  One developer runs turbo build → result cached remotely.
  Teammate runs turbo build → downloads the cached result instead of building.
  CI pipeline runs turbo build → hits the remote cache → near-instant builds.
```

```bash
# Link to Vercel Remote Cache (free)
npx turbo login
npx turbo link

# Or use environment variables for CI
TURBO_TOKEN=your_token turbo build
TURBO_TEAM=your_team  turbo build
```

---

## 5. Filtering (Run Tasks for Specific Packages).

```bash
# Run dev for a specific app
turbo dev --filter=@acme/web

# Run build for a package AND all packages that depend on it
turbo build --filter=@acme/utils...

# Run build for a package AND all its local dependencies
turbo build --filter=...@acme/web

# Run build only for packages that changed since main branch
turbo build --filter=[origin/main]

# Run build only for packages that changed since last commit
turbo build --filter=[HEAD^1]

# Run tasks for multiple specific packages
turbo build --filter=@acme/web --filter=@acme/api

# Run for all packages matching a glob
turbo build --filter='./apps/*'
```

---

## 6. Shared Packages (The Heart of a Monorepo).

### Shared TypeScript Config.

```json
// packages/tsconfig/base.json — shared TS config
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

```json
// packages/tsconfig/nextjs.json — Next.js specific config
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "jsx": "preserve"
  }
}
```

```json
// apps/web/tsconfig.json — extends the shared config
{
  "extends": "@acme/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}
```

### Shared ESLint Config.

```javascript
// packages/eslint-config/index.js
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: { "@typescript-eslint": tsPlugin },
    languageOptions: { parser: tsParser },
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },
];
```

```javascript
// apps/web/eslint.config.js — extends the shared config
import baseConfig from "@acme/eslint-config";

export default [
  ...baseConfig,
  {
    rules: {
      // web-specific overrides
      "no-console": "off", // allow console.log in Next.js
    },
  },
];
```

### Shared UI Component Library.

```tsx
// packages/ui/src/components/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500",
    secondary:
      "bg-slate-100 hover:bg-slate-200 text-slate-900 focus:ring-slate-400",
    ghost: "hover:bg-slate-100 text-slate-700 focus:ring-slate-400",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

```typescript
// packages/ui/src/index.ts — barrel export
export { Button } from "./components/Button";
export { Card } from "./components/Card";
export { Input } from "./components/Input";
export { Badge } from "./components/Badge";
export type { ButtonProps } from "./components/Button";
```

```tsx
// apps/web/src/app/page.tsx — consuming the shared package
import { Button, Card } from "@acme/ui";

export default function Page() {
  return (
    <Card>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

### Shared Utility Functions.

```typescript
// packages/utils/src/index.ts
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

---

## 7. Environment Variables in Turborepo.

By default, environment variables are NOT included in the cache hash.

You must declare them explicitly, otherwise changing `DATABASE_URL` won't invalidate the build cache.

```json
// turbo.json — declare env vars that affect caching
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_SUPABASE_URL"
        // DO NOT include secrets here — just declare their existence
        // Turborepo hashes the value, it doesn't expose it
      ]
    }
  },
  // Global env vars — applied to every task
  "globalEnv": ["CI", "NODE_ENV"]
}
```

```bash
# .env files are NOT automatically read by Turborepo.
# They are read by the individual apps (Next.js reads .env.local, etc.)
# Turborepo only needs to know WHICH env vars affect caching.
```

---

## 8. `turbo.jsonc` and Package-Level Configuration.

<cite index="3-1">Turborepo 2.5 added support for `turbo.jsonc`</cite> — allowing comments in the config file.

You can also place a `turbo.json` inside any package to override or extend the root config for that specific package.

```jsonc
// turbo.jsonc — the root config (supports comments)
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      // "^build" means: run build in dependencies first
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
    },
    "dev": {
      // persistent: task never exits (dev server)
      "persistent": true,
      "cache": false,
    },
  },
}
```

```json
// packages/ui/turbo.json — package-level override
{
  "$schema": "https://turborepo.dev/schema.json",
  "extends": ["//"], // extends the root turbo.json
  "tasks": {
    "build": {
      // Override just the outputs for this package
      "outputs": ["dist/**", "!dist/**/*.test.*"]
    }
  }
}
```

---

## 9. Turborepo CLI Reference.

```bash
# Run tasks
turbo build                        # build all packages
turbo build --filter=@acme/web     # build one package
turbo build --filter=[HEAD^1]      # build only changed packages
turbo build --dry-run              # show what would run (no execution)
turbo build --dry-run=json         # machine-readable dry run output
turbo build --force                # ignore cache, always rebuild
turbo build --no-cache             # don't write to cache (but do read)
turbo build --concurrency=4        # limit parallel tasks

# Development
turbo dev                          # run all dev tasks in parallel
turbo dev --filter=@acme/web       # run dev for one app

# Cache management
turbo build --summarize            # show cache hit/miss summary
turbo ls                           # list all packages in the workspace
turbo run build --graph            # output the task graph as HTML/DOT

# Devtools (Turborepo 2.7+)
turbo devtools                     # open visual package and task graph

# Query (Turborepo 2.2+)
turbo query "{ packages { name } }"  # GraphQL-like query over your monorepo

# Migrations
npx @turbo/codemod migrate         # migrate turbo.json to latest format
```

---

## 10. CI/CD with Turborepo.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # needed for --filter=[origin/main]

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile

      # Only lint packages that changed vs main branch
      - run: turbo lint --filter=[origin/main]

      # Only typecheck packages that changed
      - run: turbo typecheck --filter=[origin/main]

      # Only test packages that changed
      - run: turbo test --filter=[origin/main]

      # Build all packages (uses remote cache — almost always a hit on CI)
      - run: turbo build
```

### `turbo-ignore` (Skip Deployments When Nothing Changed).

```bash
# Install turbo-ignore
npm install --save-dev turbo-ignore

# In your Vercel project settings (Build Command):
# This tells Vercel to skip the deployment if @acme/web hasn't changed
npx turbo-ignore @acme/web
```

---

## Assignment.

1. **Set up a Turborepo Monerepo with Shared Config Packages.**

   **What you practice:**
   - Initialising a pnpm workspace monorepo with `create-turbo`
   - Writing `pnpm-workspace.yaml` and root `package.json`
   - Creating `packages/tsconfig` and `packages/eslint-config` shared config packages
   - Creating a `packages/utils` shared utility library consumed by multiple apps
   - Writing `turbo.json` with `build`, `dev`, `lint`, and `typecheck` tasks
   - Understanding `dependsOn: ["^build"]` for topological ordering
   - Running `turbo build`, `turbo dev --filter`, and `turbo build --filter=[HEAD^1]`
   - Cache hit demonstration: run build twice and observe the second is instant

   **Requirements:**
   - A monorepo with this structure:
     ```
     apps/
         web/      ← Next.js 16 + React 19 + Tailwind CSS 4 app
         docs/     ← a second Next.js app (simple documentation site)
     packages/
         tsconfig/ ← shared TypeScript configs (base.json, nextjs.json)
         eslint-config/ ← shared ESLint flat config
         utils/    ← shared TypeScript utilities (formatDate, cn, truncate)
     ```
   - `apps/web` and `apps/docs` both import from `@acme/utils`.
   - Both apps extend `@acme/tsconfig/nextjs.json`.
   - Both apps extend `@acme/eslint-config`.
   - `turbo build` builds both apps in the correct order (utils first, then apps in parallel).
   - `turbo dev --filter=@acme/web` starts only the web app's dev server.
   - Running `turbo build` twice shows a full cache hit on the second run.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # Setup — run from code1/
   pnpm install

   # 1. Build all packages (first run — cache miss)
   pnpm turbo build
   → Output shows:
   @acme/utils:build:    cache miss, executing...
   @acme/web:build:      cache miss, executing...
   @acme/docs:build:     cache miss, executing...
   Tasks: 3 successful, 0 cached
   → .next/ directories appear inside apps/web/ and apps/docs/.

   # 2. Build all packages (second run — full cache hit)
   pnpm turbo build
   → Output shows:
   @acme/utils:build:    cache hit, replaying output
   @acme/web:build:      cache hit, replaying output
   @acme/docs:build:     cache hit, replaying output
   Tasks: 3 successful, 3 cached
   Time: ~0.1s  ← near-instant

   # 3. Modify utils and observe selective rebuild
   Edit packages/utils/src/index.ts — add a comment or a new function.
   pnpm turbo build
   → @acme/utils:build:  cache miss  ← utils changed
   → @acme/web:build:    cache miss  ← depends on utils
   → @acme/docs:build:   cache miss  ← depends on utils
   All three rebuild because utils changed.

   # 4. Filter — run only one app
   pnpm turbo dev --filter=@acme/web
   → Only the web dev server starts on http://localhost:3000.
   → docs dev server does NOT start.
   Open http://localhost:3000 → page shows formatted date, currency, etc.
   (all from @acme/utils — proof the workspace link works)

   # 5. Run both dev servers
   pnpm turbo dev
   → web starts on :3000, docs starts on :3001 (parallel).
   → Both are live simultaneously.

   # 6. Shared TypeScript config
   Edit apps/web/src/app/page.tsx — introduce a type error (e.g. assign string to number).
   pnpm turbo typecheck
   → @acme/web:typecheck fails with a TypeScript error.
   → @acme/docs:typecheck still passes.

   # 7. Workspace symlink verification
   ls -la node_modules/@acme/
   → Shows symlinks:
   docs   → ../../apps/docs
   utils  → ../../packages/utils
   web    → ../../apps/web
   tsconfig → ../../packages/tsconfig
   eslint-config → ../../packages/eslint-config

   # 8. turbo ls — list all packages
   pnpm turbo ls
   → Lists all 5 packages: @acme/web, @acme/docs, @acme/utils, @acme/tsconfig, @acme/eslint-config
   ```

2. **Full-Stack Monerepo with Shared UI Library and API Types.**

   **What you practice:**
   - Building a `packages/ui` shared component library consumed by multiple Next.js apps
   - Building a `packages/types` package that shares TypeScript types between the frontend and backend API
   - Building a `packages/api-client` package that wraps `fetch` with typed API calls
   - Configuring `next.config.ts` with `transpilePackages` to handle TypeScript source packages
   - Understanding how to structure package `exports` in `package.json`
   - Demonstrating that a type change in `@acme/types` invalidates the cache for all consumers
   - Task pipeline ordering: types → ui + api-client → apps (all in correct topological order)

   **Requirements:**
   - Monorepo with:
     ```
     apps/
         web/       ← customer-facing Next.js 16 app
         admin/     ← admin panel Next.js 16 app
     packages/
         ui/        ← shared Button, Card, Badge, Input components
         types/     ← shared TypeScript interfaces (User, Product, Order)
         api-client/← typed fetch wrapper using @acme/types
         tsconfig/  ← shared TS config (from Assignment 1)
         utils/     ← shared utilities (from Assignment 1)
     ```
   - `apps/web` shows a product listing page using `@acme/ui` components and `@acme/api-client` to fetch data from a mock API.
   - `apps/admin` shows an admin dashboard using the same `@acme/ui` components and `@acme/types`.
   - Both apps share the exact same `User`, `Product`, and `Order` type definitions from `@acme/types` — changing a type in `@acme/types` immediately catches type errors in BOTH apps.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # Setup — from code2/
   pnpm install

   # 1. Build all packages
   pnpm turbo build
   → Build order enforced by Turborepo:
   @acme/tsconfig:   (no build task — config only)
   @acme/utils:      cache miss, executing...
   @acme/types:      cache miss, executing...  (parallel with utils)
   @acme/ui:         cache miss, executing...  (waits for types)
   @acme/api-client: cache miss, executing...  (waits for types)
   @acme/web:        cache miss, executing...  (waits for ui + api-client)
   @acme/admin:      cache miss, executing...  (waits for ui + types)

   # 2. Run both apps simultaneously
   pnpm turbo dev
   → @acme/web starts on http://localhost:3000
   → @acme/admin starts on http://localhost:3001
   → Both running in parallel.

   # 3. Verify shared UI — same components, different themes
   Open http://localhost:3000  → Card, Button, Badge components on white background.
   Open http://localhost:3001  → Same Card, Button, Badge on dark (slate-950) background.
   Both apps use the SAME Button.tsx from packages/ui/ — zero duplication.

   # 4. Type safety across packages
   Open packages/types/src/index.ts.
   Change Order.status from OrderStatus union to: 'pending' | 'done' (remove other statuses).
   pnpm turbo typecheck
   → @acme/admin:typecheck FAILS: Type '"delivered"' is not assignable to type '"pending" | "done"'.
   → TypeScript caught the breaking change in BOTH apps simultaneously.
   → Revert the change: types compile again.

   # 5. Selective rebuild after type change
   Edit packages/types/src/index.ts (add a comment).
   pnpm turbo build
   → @acme/types:      cache miss (changed)
   → @acme/ui:         cache miss (depends on types)
   → @acme/api-client: cache miss (depends on types)
   → @acme/web:        cache miss (depends on ui + api-client)
   → @acme/admin:      cache miss (depends on ui + types)
   → @acme/utils:      cache hit  ← unaffected (doesn't depend on types)

   # 6. transpilePackages — verify it's needed
   Temporarily remove transpilePackages from apps/web/next.config.ts.
   pnpm --filter @acme/web build
   → Build fails: "You may need an appropriate loader to handle this file type"
   because Next.js can't handle .ts source directly from node_modules.
   Re-add transpilePackages → build succeeds.

   # 7. pnpm filter
   pnpm turbo build --filter=@acme/admin
   → Only @acme/admin and its dependencies (types, ui, utils) build.
   → @acme/web and @acme/api-client are NOT built.
   ```

3. **Production Monorepo with Docker, CI Pipeline and Remote Cache Strategy.**

   **What you practice:**
   - `turbo prune` — generating a minimal Docker build context for a single app
   - Writing a multi-stage `Dockerfile` for a Next.js app inside a monorepo
   - Understanding why naive Docker builds fail in monorepos and how `turbo prune` fixes it
   - Writing a `docker-compose.yml` to run the full monorepo stack locally
   - Configuring `turbo build --filter=[origin/main]` for affected-only CI builds
   - Writing a GitHub Actions workflow that uses Turborepo remote cache to share build artifacts across CI runs
   - `turbo-ignore` to skip Vercel/deployment builds when a specific app hasn't changed
   - `turbo ls`, `turbo run --dry-run=json`, and `turbo run --graph` for monorepo introspection

   **Requirements:**
   - Extend the monorepo from Assignment 2 with:
     - A `Dockerfile` for `apps/web` that uses `turbo prune` for a minimal build context.
     - A `docker-compose.yml` that builds and runs `apps/web` and `apps/admin` together.
     - A `.github/workflows/ci.yml` that lints, typechecks, and builds only affected packages on PR.
     - A `scripts/check-affected.sh` script that outputs which packages changed vs `main`.
     - Documentation in a root `MONOREPO.md` explaining the repository structure, how to add a new package, and how to add a new app.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # ─── Local development ────────────────────────────────────────────────────

   # 1. Setup from root
   pnpm install
   pnpm turbo build
   → All 6 packages build in topological order. Cache stored locally.

   # 2. Affected builds
   git checkout -b feature/update-button
   # Edit packages/ui/src/components/Button.tsx — change a style
   git add -A && git commit -m "style: update button hover colour"
   pnpm turbo build --filter=[origin/main]
   → Only @acme/ui, @acme/web, @acme/admin rebuild (ui changed, apps depend on ui).
   → @acme/types, @acme/utils, @acme/api-client: cache hit (unaffected).

   # 3. check-affected script
   bash scripts/check-affected.sh
   → === Checking affected packages vs origin/main ===
   → 📦 Affected packages:
   →   - @acme/ui
   →   - @acme/web
   →   - @acme/admin

   # ─── Docker ──────────────────────────────────────────────────────────────

   # 4. Verify turbo prune output
   # From the repo root:
   npx turbo prune @acme/web --docker
   ls out/
   → full/   json/   pnpm-lock.yaml
   ls out/full/
   → apps/web/  packages/ui/  packages/types/  packages/utils/  packages/api-client/
   # packages/docs/ is NOT here — turbo prune excluded it (not a dep of @acme/web)

   # 5. Docker Compose build and run
   pnpm docker:build
   → Docker builds both images using the multi-stage Dockerfiles.
   → Each build uses turbo prune to keep images minimal.

   pnpm docker:up
   → web   starts on http://localhost:3000
   → admin starts on http://localhost:3001
   Both apps run in standalone mode (no node_modules in the container).

   docker images | grep acme
   → acme-web   — check image size (should be ~150-200MB with standalone output)
   → acme-admin — similar size

   # ─── CI simulation ───────────────────────────────────────────────────────

   # 6. Dry run to see what CI would build
   pnpm turbo build --filter=[origin/main] --dry-run
   → Shows a table of packages that would build vs those that hit cache.

   # 7. Monorepo introspection
   pnpm turbo ls
   → Lists all 7 packages with their locations.

   pnpm turbo build --graph
   → Generates an HTML/DOT graph of the task dependency graph.
   → Open in browser to visually see the build order.

   # 8. Force rebuild (ignore cache)
   pnpm turbo build --force
   → All packages rebuild from scratch, ignoring the local cache.
   → Use when you suspect stale cache entries.

   # 9. Devtools (Turborepo 2.7+)
   pnpm turbo devtools
   → Opens a visual graph at turborepo.dev/devtools showing your Package Graph.
   → Hot-reloads as you make changes to turbo.json or package.json.
   ```
