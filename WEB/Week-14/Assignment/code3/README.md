# How to Build.

```
Step 1 — Initialise the project
  mkdir code3 && cd code3
  npm init -y
  npm install express pg dotenv
  npm install --save-dev nodemon

Step 2 — Write schema.sql in dependency order
  categories → users → products → orders → order_items → product_stock_log
  Add all indexes and constraints.
  Run: psql -U postgres -c "CREATE DATABASE week14_hard;"
       psql -U postgres -d week14_hard -f schema.sql

Step 3 — Write seed.sql
  INSERT INTO categories ...
  INSERT INTO products ...
  INSERT INTO users ...
  Run: psql -U postgres -d week14_hard -f seed.sql

Step 4 — Create db.js with Pool (same as before)

Step 5 — Create models/order.js
  placeOrder(userId, items) — this is the complex one.
  Open a client from the pool.
  BEGIN.
  For each item: SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE.
  Check stock >= quantity. If not: ROLLBACK, throw error with product name.
  INSERT INTO orders RETURNING id.
  For each item: INSERT INTO order_items, UPDATE products SET stock = stock - $qty.
  COMMIT. release(). Return the order.

Step 6 — Create models/dashboard.js
  Four functions, each with one complex SQL query.
  revenueByMonth: DATE_TRUNC, GROUP BY, SUM, WHERE EXTRACT(YEAR ...) = current year.
  topProducts: JOIN order_items → products, GROUP BY, ORDER BY SUM(quantity) DESC, LIMIT 5.
  categoryStats: JOIN products → categories, GROUP BY category, HAVING COUNT(*) > 0.
  topCustomers: JOIN orders → users, SUM(total), RANK() OVER window function.

Step 7 — Create routes and wire to server.js

Step 8 — Test each endpoint
  Seed data first.
  Test stock locking: try ordering more than available stock.
  Test dashboard endpoints — verify numbers match what you seeded.
  Test the upsert endpoint twice on the same day — quantity should accumulate.
```