# How to Build.

```
Step 1 — Initialise
  mkdir code3 && cd code3
  npm init -y
  npm install express drizzle-orm postgres dotenv zod
  npm install --save-dev typescript tsx nodemon drizzle-kit @types/express @types/node

Step 2 — Write drizzle/schema.js (plain JS — same pattern as Week-15 Assignment 3)
  pgEnum for role and orderStatus.
  users, products, orders, orderItems tables with all fields.
  Export all relations.

Step 3 — Write drizzle.config.js pointing to ./drizzle/schema.js

Step 4 — Create DB and run migration
  psql -U postgres -c "CREATE DATABASE week17_hard;"
  npx drizzle-kit generate
  npx drizzle-kit migrate

Step 5 — Write src/config/env.ts
  Env interface. getEnv() validates required vars.
  Return value uses satisfies Env to check shape without widening.
  Export env = getEnv().

Step 6 — Write src/types/index.ts
  Result<T> discriminated union. ok() and err() helper constructors.
  OrderStatus type. isValidStatus type guard. isAppError type guard.
  AsyncReturnType<T> conditional type using infer.

Step 7 — Write src/lib/db.ts
  Import postgres and drizzle with the JS schema. Export db.

Step 8 — Write src/lib/repository.ts
  withResult<T>(fn) async wrapper.
  Generic Repository<T extends { id: number }> class with in-memory store.
  All methods return Promise<Result<T>>.

Step 9 — Write src/models/product.ts
  getProducts(category?): Promise<Result<Product[]>>
  decrementStock(id, qty): Promise<Result<Product>> — fails with 400 if insufficient.

Step 10 — Write src/models/order.ts
  placeOrder(userId, items): Promise<Result<OrderWithItems>>
  Validates stock for all items first, then inserts order + items + decrements stock.

Step 11 — Write src/models/dashboard.ts
  getDashboard(): Promise<Result<DashboardData>>
  Three db.execute(sql`...`) queries in parallel.

Step 12 — Write routes and server.ts
  Routes read result.success before responding.
  Error handler uses isAppError type guard.
```