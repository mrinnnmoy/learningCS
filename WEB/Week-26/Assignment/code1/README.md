# How to Build.

```
Step 1 — Create the root workspace
  mkdir code1 && cd code1
  pnpm init
  Set "private": true and "name": "acme-monorepo" in root package.json.
  Add "turbo": "^2.10.4" to devDependencies.
  Create pnpm-workspace.yaml with packages: ['apps/*', 'packages/*'].

Step 2 — Create packages/tsconfig
  mkdir -p packages/tsconfig
  Create package.json: name "@acme/tsconfig", version "0.0.1", no main.
  Create base.json: strict TS config (ES2022, bundler resolution, noEmit).
  Create nextjs.json: extends ./base.json, adds jsx: preserve and next plugin.

Step 3 — Create packages/eslint-config
  mkdir -p packages/eslint-config
  pnpm add --save-dev @eslint/js @typescript-eslint/eslint-plugin
    @typescript-eslint/parser --filter @acme/eslint-config
  Create package.json: name "@acme/eslint-config", type "module", main "./index.js".
  Create index.js: exports an array of ESLint flat config objects.

Step 4 — Create packages/utils
  mkdir -p packages/utils/src
  Create package.json: name "@acme/utils", main "./src/index.ts",
    exports { ".": "./src/index.ts" }.
  Extend @acme/tsconfig/base.json in tsconfig.json.
  Create src/index.ts with formatDate, cn, truncate, slugify functions.

Step 5 — Create apps/web
  cd apps && npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir
  cd web
  Update package.json: name "@acme/web", add "@acme/utils": "workspace:*",
    "@acme/tsconfig": "workspace:*", "@acme/eslint-config": "workspace:*".
  Update tsconfig.json to extend "@acme/tsconfig/nextjs.json".
  Create eslint.config.mjs extending "@acme/eslint-config".
  Update src/app/page.tsx to import and use functions from "@acme/utils".

Step 6 — Create apps/docs (same steps as web but simpler content)
  Create a minimal Next.js app for documentation.
  Also imports from "@acme/utils".

Step 7 — Create turbo.json at the root
  Define tasks: build (dependsOn ^build, outputs .next/** and dist/**),
  dev (persistent: true, cache: false),
  lint (inputs src/** and eslint config files),
  typecheck (dependsOn ^build).

Step 8 — Install everything from the root
  cd ../.. && pnpm install
  This installs all dependencies and creates workspace symlinks.

Step 9 — Verify
  pnpm turbo build          ← first run: cache miss
  pnpm turbo build          ← second run: 100% cache hit
  pnpm turbo dev --filter=@acme/web  ← only web dev server starts
  pnpm turbo build --filter=[HEAD^1] ← only changed packages build
```