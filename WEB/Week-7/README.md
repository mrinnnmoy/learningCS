# List of things learned.

## Environment Variables. (The Basics)

### What is an environment variable?

An environment variable is a key-value pair stored at the operating system level, outside of your application's code.

They are part of the environment in which a process runs.

    KEY=value
    DATABASE_URL=mongodb://localhost:27017/mydb
    PORT=3000

Think of them as settings that live outside your code.

Your code reads them, but doesn't own them.

### Why we don't hardcode secrets (API keys, DB URLs, passwords).

Hardcoding sensitive values directly in source code is dangerous:

- Your code gets pushed to GitHub → secrets are now public
- Different environments (dev, prod) need different values — hardcoding forces you to change code every time
- Rotating a secret means editing and redeploying code
- Team members shouldn't have production credentials in their local code

### How the OS stores env vars.

The OS maintains a list of key-value pairs for every running process.

When a process starts, it inherits its parent's environment variables.

### Accessing env vars in Node.js via `process.env`

Node.js exposes all environment variables through the globe `process.env` object:

    // Access any env var
    console.log(process.env.PATH);       // system PATH
    console.log(process.env.PORT);       // your custom var
    console.log(process.env.NODE_ENV);   // current environment

    // If a variable is not set, it returns undefined
    console.log(process.env.MISSING_VAR); // undefined

`process.env` values are always strings (or `undefiend`).

Type conversion is your responsibility:

    const port = Number(process.env.PORT) || 3000;
    const isDebug = process.env.DEBUG === "true";  // string comparison

<hr />

## `.env` Files.

### What is a `.env` file?

A `.env` file is a plain text file that lives in the root of your project and stores environment variables in `KEY=VALUE` format.

It is not committed to version control — it's only for your local machine (or injected by a server at deploy time).

```
project/
├── src/
│   └── index.js
├── .env           ← never commit this
├── .env.example   ← commit this (template)
└── package.json
```

### Syntax and formatting rules.

```dotenv
# This is a comment

# Basic key=value
PORT=3000
NODE_ENV=development

# Strings — quotes are optional but recommended for values with spaces
APP_NAME="My Awesome App"
GREETING='Hello World'

# No spaces around the = sign
DB_HOST=localhost       # ✅
DB_HOST = localhost     # ❌ (some parsers may fail)

# Multiline values (use quotes)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAK...
-----END RSA PRIVATE KEY-----"

# Empty value
OPTIONAL_VAR=

# Referencing other variables (supported by some loaders)
BASE_URL=http://localhost:${PORT}
```

> **Convention:** Use `SCREAMING_SNAKE_CASE` for all env var names.

### The `dotenv` package (installation & usage).

`dotenv` is the most popular Node.js package for loading `.env` files into `process.env`.

**Installation:**

```bash
npm install dotenv
```

**Basic usage:**

```javascript
// index.js (entry point)
require("dotenv").config();

// Now process.env has your .env values
console.log(process.env.PORT); // "3000"
console.log(process.env.DB_HOST); // "localhost"
```

**ES Module syntax:**

```javascript
import "dotenv/config"; // auto-loads .env
// OR
import dotenv from "dotenv";
dotenv.config();
```

**Custom `.env` file path:**

```javascript
require("dotenv").config({ path: "./.env.local" });
```

### Where to place the `dotenv` config call (entry point)

The `dotenv.config()` call must happen **as early as possible** — before any other module that might read `process.env`.

```javascript
// ✅ CORRECT — first line of your entry point
require("dotenv").config();
const express = require("express");
const db = require("./db"); // db.js can safely use process.env

// ❌ WRONG — too late, db.js runs before .env is loaded
const db = require("./db");
require("dotenv").config();
```

**`dotenv.config()` return value:**

```javascript
const result = require("dotenv").config();

if (result.error) {
  console.error("Failed to load .env file:", result.error);
}

console.log(result.parsed); // object of all loaded vars
```

<hr />

## `.gitignore` & Secret Safety.

### Why `.env` must always be in .`gitignore`

If `.env` is committed to a public GitHub repo, **anyone can see your secrets**. This is one of the most common security mistakes made by developers.

```bash
# .gitignore
.env
.env.local
.env.*.local
```

> Even for **private repos** — team members shouldn't have each other's credentials or production secrets.

### The `.env.example` pattern (template for teammates)

`.env.example` is a **template file** that shows teammates which variables are needed, without actual values:

```dotenv
# .env.example — commit this to Git!
PORT=
NODE_ENV=development
DB_URL=
JWT_SECRET=
API_KEY=
```

**Workflow for new developers:**

```bash
git clone https://github.com/yourproject
cp .env.example .env   # create your own .env
# fill in the real values
```

### What happens if secrets leak to GitHub (and how to fix it)

If you accidentally commit secrets:

1. **Immediately rotate** (invalidate) the leaked credentials from the service provider dashboard
2. Remove the secret from the codebase
3. Clear the Git history using `git filter-branch` or the BFG Repo Cleaner tool
4. Force push the cleaned history

> Just deleting the file and committing is **NOT enough** — secrets remain in Git history.

```bash
# Using BFG to remove a file from history
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

<hr />

## Multiple Environment Configs.

### `development` vs `staging` vs `production` environments

Real applications run in multiple environments, each needing different config:

| Variable    | Development             | Staging                   | Production          |
| ----------- | ----------------------- | ------------------------- | ------------------- |
| `DB_URL`    | `localhost:27017`       | `staging-db.internal`     | `prod-db.cloud.com` |
| `LOG_LEVEL` | `debug`                 | `info`                    | `error`             |
| `DEBUG`     | `true`                  | `false`                   | `false`             |
| `API_URL`   | `http://localhost:3000` | `https://staging.app.com` | `https://app.com`   |

### `.env.development`, `.env.production` pattern

```
project/
├── .env                  ← base defaults (optional)
├── .env.development      ← dev overrides
├── .env.staging          ← staging overrides
├── .env.production       ← prod overrides (never committed)
├── .env.example          ← committed template
```

Loading the right file based on `NODE_ENV`:

```javascript
const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: `.env.${env}` });
```

### The `NODE_ENV` variable — what it is and how it's used

`NODE_ENV` is a **conventional** environment variable (not built into Node.js itself) that tells your app which environment it's running in.

```bash
# Set when starting the app
NODE_ENV=production node index.js
NODE_ENV=development node index.js
```

**Common values:** `development`, `test`, `staging`, `production`

**Usage in code:**

```javascript
const isDev = process.env.NODE_ENV === "development";
const isProd = process.env.NODE_ENV === "production";

if (isDev) {
  console.log("Running in dev mode — verbose logging on");
}

// Express uses NODE_ENV too
app.set("env", process.env.NODE_ENV);
```

**Setting `NODE_ENV` via npm scripts in `package.json`:**

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node index.js",
    "start": "NODE_ENV=production node index.js",
    "test": "NODE_ENV=test node index.js"
  }
}
```

> **Windows note:** `NODE_ENV=production` syntax doesn't work on Windows CMD. Use the `cross-env` package:
>
> ```bash
> npm install --save-dev cross-env
> "dev": "cross-env NODE_ENV=development node index.js"
> ```

<hr />

## Config Management Patterns.

### Centralizing config in a single `config.js` / `config.ts` file

Instead of scattering `process.env.SOMETHING` calls throughout your codebase, centralize all config in one file:

```javascript
// config/index.js
require("dotenv").config();

const config = {
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || "localhost",
    env: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DB_NAME || "myapp",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  api: {
    key: process.env.API_KEY,
    baseUrl: process.env.API_BASE_URL,
  },
};

module.exports = config;
```

**Usage throughout the app:**

```javascript
// routes/user.js
const config = require("../config");

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
```

**Benefits:**

- Single source of truth
- Easy to see all config at a glance
- Rename/restructure without hunting through the whole codebase
- Can add defaults and type conversions in one place

### Validating env vars at startup (fail-fast pattern)

Your app should **crash immediately at startup** if required env vars are missing — not fail mysteriously at runtime when a feature is used.

```javascript
// config/index.js
require("dotenv").config();

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key, defaultValue) {
  return process.env[key] || defaultValue;
}

const config = {
  database: {
    url: requireEnv("DATABASE_URL"), // crashes if missing
  },
  server: {
    port: optionalEnv("PORT", "3000"), // uses default if missing
  },
  auth: {
    secret: requireEnv("JWT_SECRET"), // crashes if missing
  },
};

module.exports = config;
```

> **Why this is good:** A crash at startup with a clear error message is far better than a cryptic `Cannot read property of undefined` error 3 hours into running the app.

### Default values for optional env vars

```javascript
// Technique 1: OR operator
const port = process.env.PORT || 3000;

// Technique 2: Nullish coalescing (returns default only for null/undefined, not "")
const logLevel = process.env.LOG_LEVEL ?? "info";

// Technique 3: Object spread with defaults
const defaults = { PORT: "3000", LOG_LEVEL: "info", DEBUG: "false" };
const env = { ...defaults, ...process.env };
```

<hr />

## Validation with `zod` or `envalid`

### Why you should validate env vars (not just read them)

Reading `process.env` gives you raw strings (or `undefined`). Problems:

- A `PORT` that's `"abc"` will silently break your server
- A missing `DATABASE_URL` will cause a crash far from the root cause
- No IDE autocomplete or type safety
  Validation catches these at startup with clear error messages.

### Using the `envalid` package for schema-based validation

`envalid` is a lightweight library purpose-built for validating env vars:

```bash
npm install envalid
```

```javascript
// config/index.js
const { cleanEnv, str, num, bool, url, email } = require("envalid");

require("dotenv").config();

const env = cleanEnv(process.env, {
  // Required string
  DATABASE_URL: str({ desc: "MongoDB connection string" }),

  // Number with default
  PORT: num({ default: 3000 }),

  // Boolean
  DEBUG: bool({ default: false }),

  // Must be a valid URL
  API_BASE_URL: url(),

  // Must be a valid email
  ADMIN_EMAIL: email({ default: "admin@example.com" }),

  // String with allowed choices
  NODE_ENV: str({
    choices: ["development", "test", "staging", "production"],
    default: "development",
  }),

  // Optional (no default needed if you mark it)
  OPTIONAL_KEY: str({ default: "" }),
});

// env is now a clean, validated object with proper types
console.log(env.PORT); // number, not string
console.log(env.DEBUG); // boolean, not string
console.log(env.NODE_ENV); // validated choice

module.exports = env;
```

If validation fails, `envalid` throws a helpful error:

```
Invalid environment variables:
  PORT: Invalid number input: "abc"
  DATABASE_URL: Missing required environment variable
```

### Basic usage of `zod` for env validation (preview — full Zod is Week-11)

`zod` is a full schema validation library (covered deeply in Week-11), but it's commonly used for env validation too:

```bash
npm install zod
```

```javascript
// config/env.js
require("dotenv").config();
const { z } = require("zod");

const envSchema = z.object({
  PORT: z.string().transform(Number).default("3000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DEBUG: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1); // fail-fast
}

module.exports = parsed.data;
```

### `envalid` vs `zod` for Env Validation

| Feature        | `envalid`                        | `zod`                       |
| -------------- | -------------------------------- | --------------------------- |
| Purpose        | Env vars only                    | General schema validation   |
| Setup          | Minimal                          | More verbose                |
| Types          | Built-in (num, bool, url, email) | Manual transforms           |
| Error messages | Excellent, env-specific          | Good, generic               |
| Use when       | Only need env validation         | Already using zod elsewhere |

<hr />

## Env Vars in Different Contexts

### Env vars in Node.js scripts

```javascript
// Pass env vars inline when running scripts
// Terminal:
DB_URL=mongodb://localhost MY_VAR=hello node script.js

// Or use npm scripts in package.json:
{
  "scripts": {
    "seed": "DB_URL=mongodb://localhost node scripts/seed.js"
  }
}
```

### Env vars in Docker (brief conceptual intro)

Docker containers are isolated processes. You pass env vars to them at runtime:

```bash
# Pass individual vars
docker run -e PORT=3000 -e NODE_ENV=production myapp

# Pass an env file
docker run --env-file .env.production myapp
```

In a `docker-compose.yml`:

```yaml
services:
  app:
    image: myapp
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env.production
```

> The app **does not need `dotenv`** in Docker — the container injects vars directly into `process.env`.

### Env vars in CI/CD pipelines (brief conceptual intro)

CI/CD platforms (GitHub Actions, GitLab CI) have their own secret stores:

**GitHub Actions:**

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
        run: node deploy.js
```

Secrets are set in: **GitHub Repo → Settings → Secrets and variables → Actions**

### Platform-specific env var injection (Vercel, Railway, Render)

Modern deployment platforms allow you to set env vars through a dashboard:

| Platform    | Where to Set                                      |
| ----------- | ------------------------------------------------- |
| **Vercel**  | Project → Settings → Environment Variables        |
| **Railway** | Project → Variables tab                           |
| **Render**  | Service → Environment tab                         |
| **Heroku**  | App → Settings → Config Vars                      |
| **Netlify** | Site → Site configuration → Environment variables |

These platforms inject vars into `process.env` at runtime — **no `.env` file needed in production**.

<hr />

## Security Best Practices.

### Never log `process.env` in production

```javascript
// ❌ BAD — exposes ALL env vars including secrets
console.log(process.env);
console.log(JSON.stringify(process.env));

// ❌ BAD — accidentally logs secrets in error handlers
app.use((err, req, res, next) => {
  console.error("Error context:", process.env); // DON'T
});

// ✅ GOOD — log only what you need
console.log(`Server starting on port ${process.env.PORT}`);
```

### Principle of least privilege (only expose what's needed)

Only expose env vars that are actually needed for a given service/component:

```javascript
// ❌ BAD — passing entire process.env to a module
const emailService = require("./email")(process.env);

// ✅ GOOD — only pass what's needed
const emailService = require("./email")({
  apiKey: process.env.EMAIL_API_KEY,
  from: process.env.EMAIL_FROM,
});
```

### Rotating secrets

**When to rotate:**

- Suspected compromise
- Team member leaves
- Periodic schedule (every 90 days for critical secrets)

**Process:**

1. Generate new secret in the service dashboard
2. Update the secret in your deployment platform
3. Redeploy the app (new secret takes effect)
4. Revoke the old secret

### Using secret managers (AWS Secrets Manager, HashiCorp Vault — conceptual only)

For large-scale production systems, secrets are stored in dedicated tools rather than `.env` files:

| Tool                    | Provider            | Use Case                |
| ----------------------- | ------------------- | ----------------------- |
| **AWS Secrets Manager** | Amazon Web Services | AWS-hosted apps         |
| **HashiCorp Vault**     | Self-hosted / HCP   | Multi-cloud, enterprise |
| **GCP Secret Manager**  | Google Cloud        | GCP-hosted apps         |
| **Azure Key Vault**     | Microsoft Azure     | Azure-hosted apps       |

These tools provide: audit trails, automatic rotation, fine-grained access control, and versioning — things a `.env` file can never offer.

<hr />

## Assignment.

1.  Basic `.env` Config Loader.

    **Goal:** Set up a Node.js project that reads from a `.env` file and prints a formatted summary.

    **Requirements:**
    - Create a project with `dotenv` installed
    - Create a `.env` file with the following variables: `APP_NAME`, `PORT`, `NODE_ENV`, `DEBUG`
    - Create a `config.js` that loads and exports these values with proper type conversions
    - Create an `index.js` that imports the config and prints a startup message like:

      ```
      ====================================
      App: My Awesome App
      Port: 3000
      Environment: development
      Debug Mode: true
      ====================================
      ```

    - Create a `.env.example` file as a template
    - Add `.env` to `.gitignore`

    **Bonus:** Add a check that crashes with a helpful message if `APP_NAME` is missing.

    [Solution](./Assignment/code1/)

2.  Multi-Environment Config System.

    **Goal:** Build a config system that loads different settings based on `NODE_ENV`.

    **Requirements:**
    - Create three `.env` files: `.env.development`, `.env.test`, `.env.production`
    - Each file should have: `PORT`, `DB_URL`, `LOG_LEVEL`, `API_BASE_URL` — with different values per environment
    - Create a `config/index.js` that:
    - Reads `NODE_ENV` (default to `development`)
    - Loads the correct `.env.*` file
    - Validates all required variables are present (fail-fast)
    - Exports a typed config object with defaults for optional values
    - Add npm scripts in `package.json` for `dev`, `test`, and `start` (production) that set `NODE_ENV` appropriately
    - Create a `printConfig.js` script that prints the loaded config (masking secrets — show only first 4 characters of sensitive values, e.g., `sk-a****`)
      **Expected output when running `npm run dev`:**

          ```
          Loading config for: development
          {
          port: 3000,
          db: { url: 'mongodb://localhost:27017/myapp_dev' },
          logLevel: 'debug',
          api: { baseUrl: 'http://localhost:3000', key: 'dev-****' }
          }
          ```

    [Solution](./Assignment/code2/)

3.  Validated Config with `zod` + Runtime Health Check.

    **Goal:** Build a production-grade config module with full `zod` validation & an Express server with a `/health` endpoint that reports config status.

    **Requirements:**

    **Config Validation:**
    - Install `zod` and `express`
    - Create a `.env` file with: `PORT`, `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `NODE_ENV`, `RATE_LIMIT` (number), `ALLOWED_ORIGINS` (comma-separated list)
    - Create `config/env.js` using `zod` that:
    - Validates all types (PORT as number, RATE_LIMIT as number, ALLOWED_ORIGINS as `string[]` by splitting on `,`)
    - Marks `JWT_SECRET` as required and minimum 32 characters
    - Marks `DATABASE_URL` as a valid URL format
    - Calls `process.exit(1)` on validation failure with a clear error message listing all invalid fields
      **Part B — Express Server with `/health`:**
    - Create an Express server on the validated `PORT`
    - Add a `GET /health` endpoint that returns:

      ```json
      {
        "status": "ok",
        "environment": "development",
        "port": 3000,
        "database": "connected (url set)",
        "auth": "jwt secret loaded",
        "uptime": 12.4,
        "timestamp": "2024-01-15T10:30:00.000Z"
      }
      ```

    - If `DATABASE_URL` is missing or invalid, the `/health` endpoint should return `"database": "not configured"` and HTTP status `503`
      **Part C — Intentional Failure Test:**
    - Temporarily remove `JWT_SECRET` from your `.env` and run the server
    - Take a screenshot or copy the terminal output showing the validation error and `process.exit(1)` message
    - Restore `JWT_SECRET` and verify the server starts successfully

    **Folder structure:**

    ```
    code3/
    ├── config/
    │   └── env.js
    ├── routes/
    │   └── health.js
    ├── index.js
    ├── .env
    ├── .env.example
    ├── .gitignore
    └── package.json
    ```

    [Solution](./Assignment/code3/)
