# List of things learned.

## 1. SQL Basics.

PostgreSQL is a **relational database management system (RDBMS)**.

Where MongoDB stores documents with flexible shapes, PostgreSQL stores data in **tables**.

Structured grids of rows and columns where every row conforms to an exact schema.

The word **relational** does not mean "relationships between tables" (though PostgreSQL handles those well).

It refers to **relation**, the mathematical term for a table.

All data in PostgreSQL lives in tables, all queries return tables and all operations work on tables.

### Why PostgreSQL Over Other SQL Databases.

```
MySQL       → Most popular, but historically weaker on standards compliance and advanced features.
              PostgreSQL is stricter, more feature-complete, and handles concurrency better.

SQLite      → Embedded, file-based, no server. Great for local dev and mobile apps.
              Not suitable for multi-user production applications.

PostgreSQL  → Full SQL standards compliance. ACID transactions. Rich data types (JSON, arrays,
              ranges, enums). Best choice for most web applications.
```

### Installation.

**macOS:**

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Ubuntu / Debian:**

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**

Download the [installer](https://www.postgresql.org/download/windows).

The installer bundles pgAdmin (a GUI).

Install it, it is useful.

**Verify:**

```bash
psql --version
# psql (PostgreSQL) 16.x
```

### Connecting and Basic Commands.

```bash
# Connect as the default postgres superuser
sudo -u postgres psql

# Or connect to a specific database as a specific user
psql -U myuser -d mydb -h localhost
```

```sql
-- Inside psql, these meta-commands start with \
\l              -- list all databases
\c mydb         -- connect to (use) a database
\dt             -- list all tables in current database
\d users        -- describe the structure of the 'users' table
\du             -- list all users/roles
\q              -- quit psql
```

```sql
-- Create a database and a user
CREATE DATABASE myapp;
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE myapp TO myuser;

-- Connect to it
\c myapp
```

### Data Types.

PostgreSQL has a rich set of data types. Choosing the right one matters for storage efficiency, query performance and data integrity.

```sql
-- Numeric
INTEGER          -- whole numbers: -2,147,483,648 to 2,147,483,647
BIGINT           -- large whole numbers: up to ~9.2 quintillion
NUMERIC(10, 2)   -- exact decimal: 10 total digits, 2 after decimal. Use for money.
REAL             -- floating point (approximate). Avoid for money — rounding errors.
SERIAL           -- auto-incrementing INTEGER (shorthand for a sequence)
BIGSERIAL        -- auto-incrementing BIGINT

-- Text
VARCHAR(255)     -- variable-length string with a limit
TEXT             -- variable-length string with no limit (same performance as VARCHAR in PostgreSQL)
CHAR(10)         -- fixed-length, padded with spaces (rarely useful)

-- Boolean
BOOLEAN          -- TRUE or FALSE (also accepts 'true', 'false', 't', 'f', '1', '0')

-- Date & Time
DATE             -- YYYY-MM-DD
TIME             -- HH:MM:SS
TIMESTAMP        -- date + time, no timezone
TIMESTAMPTZ      -- date + time with timezone (recommended — always store in UTC)
INTERVAL         -- a duration: '3 hours', '2 days', '1 year 3 months'

-- Other
UUID             -- universally unique identifier: '550e8400-e29b-41d4-a716-446655440000'
JSON             -- stores JSON as text (parsed on each access)
JSONB            -- stores JSON in binary (indexed, faster queries — prefer this over JSON)
ARRAY            -- e.g. TEXT[], INTEGER[]

```

### SELECT (Reading Data).

```sql
-- Select all columns from a table
SELECT * FROM users;

-- Select specific columns
SELECT name, email FROM users;

-- Computed column — alias with AS
SELECT name, price * quantity AS total FROM order_items;

-- Filtering with WHERE
SELECT * FROM users WHERE is_active = TRUE;
SELECT * FROM users WHERE age >= 18 AND role = 'admin';
SELECT * FROM users WHERE email LIKE '%@gmail.com';  -- pattern match
SELECT * FROM users WHERE name ILIKE 'alice%';       -- case-insensitive LIKE

-- Sorting
SELECT * FROM users ORDER BY created_at DESC;        -- newest first
SELECT * FROM users ORDER BY last_name ASC, first_name ASC;

-- Limiting and offsetting (pagination)
SELECT * FROM products ORDER BY created_at DESC LIMIT 10 OFFSET 20;
-- LIMIT 10 = return max 10 rows
-- OFFSET 20 = skip the first 20 rows (page 3 of 10-per-page = skip 20)

-- Distinct values
SELECT DISTINCT category FROM products;

-- Aggregate functions
SELECT COUNT(*)              FROM orders;             -- total row count
SELECT COUNT(*) FILTER (WHERE status = 'delivered')  -- conditional count
  FROM orders;
SELECT SUM(total)            FROM orders WHERE status = 'delivered';
SELECT AVG(price)            FROM products;
SELECT MIN(price), MAX(price) FROM products;

-- Grouping
SELECT category, COUNT(*), AVG(price)
FROM products
GROUP BY category
ORDER BY COUNT(*) DESC;

-- HAVING — filter AFTER grouping (WHERE filters BEFORE grouping)
SELECT category, COUNT(*) AS product_count
FROM products
GROUP BY category
HAVING COUNT(*) > 5;   -- only categories with more than 5 products
```

---

## 2. Tables & Relations.

A table in PostgreSQL is a named collection of rows, all with the same columns.

Designing your tables well by choosing the right columns, types and constraints is the foundation of everything else.

### Creating Tables.

```sql
-- Basic syntax
CREATE TABLE table_name (
  column_name data_type constraints,
  column_name data_type constraints,
  ...
  table_level_constraint
);

-- A real users table
CREATE TABLE users (
  id         BIGSERIAL    PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  password   TEXT         NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- A products table
CREATE TABLE products (
  id          BIGSERIAL      PRIMARY KEY,
  name        VARCHAR(255)   NOT NULL,
  description TEXT,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER        NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category    VARCHAR(100),
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
```

### Column Constraints.

```sql
NOT NULL          -- the column cannot be empty/null. Omitting it allows nulls (bad default habit).
UNIQUE            -- no two rows can have the same value in this column.
DEFAULT value     -- value used when the column is omitted on INSERT.
CHECK (condition) -- rejects any row where the condition is FALSE.
PRIMARY KEY       -- shorthand for NOT NULL + UNIQUE. Identifies each row uniquely.

-- Column-level CHECK examples
price NUMERIC(10, 2) CHECK (price >= 0)
age INTEGER CHECK (age BETWEEN 0 AND 150)
status VARCHAR(20) CHECK (status IN ('pending', 'active', 'cancelled'))

-- Table-level constraint (spans multiple columns)
CREATE TABLE order_items (
  order_id   BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id, product_id)  -- composite primary key
);
```

### Altering Tables.

```sql
-- Add a column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Drop a column
ALTER TABLE users DROP COLUMN phone;

-- Rename a column
ALTER TABLE users RENAME COLUMN name TO full_name;

-- Change a column's type (must be compatible or USING clause needed)
ALTER TABLE users ALTER COLUMN role TYPE TEXT;

-- Add a constraint after the fact
ALTER TABLE products ADD CONSTRAINT price_positive CHECK (price >= 0);

-- Drop a constraint
ALTER TABLE products DROP CONSTRAINT price_positive;

-- Add a NOT NULL constraint
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- Rename a table
ALTER TABLE users RENAME TO app_users;

-- Drop a table entirely
DROP TABLE IF EXISTS temp_data;
-- IF EXISTS prevents an error if the table doesn't exist
-- CASCADE drops dependent objects (foreign keys, views) too
DROP TABLE users CASCADE;
```

### INSERT, UPDATE, DELETE.

```sql
-- Insert a single row — explicit columns (always do this, never rely on column order)
INSERT INTO users (email, name, password)
VALUES ('alice@example.com', 'Alice', 'hashed_password');

-- Insert multiple rows
INSERT INTO products (name, price, stock, category) VALUES
  ('Laptop',   999.99, 10, 'electronics'),
  ('Phone',    599.99, 25, 'electronics'),
  ('T-Shirt',   29.99, 100, 'clothing');

-- RETURNING — get the inserted row back (very useful for getting the auto-generated id)
INSERT INTO users (email, name, password)
VALUES ('bob@example.com', 'Bob', 'hashed_password')
RETURNING id, email, created_at;

-- Update
UPDATE users
SET name = 'Alice Smith', updated_at = NOW()
WHERE id = 1;

-- Update with RETURNING
UPDATE products
SET stock = stock - 1
WHERE id = 1 AND stock > 0
RETURNING id, name, stock;

-- Delete
DELETE FROM users WHERE id = 5;

-- Delete with RETURNING
DELETE FROM sessions WHERE expires_at < NOW()
RETURNING id;

-- Upsert — insert OR update if conflict (PostgreSQL 9.5+)
INSERT INTO user_preferences (user_id, theme)
VALUES (1, 'dark')
ON CONFLICT (user_id)
DO UPDATE SET theme = EXCLUDED.theme;  -- EXCLUDED refers to the row that was rejected
```

---

## 3. Primary & Foreign Keys.

Primary and foreign keys are the mechanism that gives relational databases their structure and integrity.

They are not optional niceties, they are the foundation of correct data.

### Primary Keys.

A primary key uniquely identifies each row in a table. PostgreSQL enforces `NOT NULL + UNIQUE` automatically.

```sql
-- SERIAL (auto-increment integer) — the traditional approach
CREATE TABLE users (
  id SERIAL PRIMARY KEY,   -- PostgreSQL creates a sequence, auto-increments on insert
  ...
);

-- BIGSERIAL for large tables (safer default — you will never run out)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  ...
);

-- UUID primary key — better for distributed systems and public-facing APIs
-- UUIDs don't leak how many records you have (1 vs 1000000 is invisible)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ...
);

-- Or use the built-in gen_random_uuid() (PostgreSQL 13+)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
```

### Foreign Keys.

A foreign key is a column (or set of columns) that references the primary key of another table.

PostgreSQL enforces referential integrity, it prevents you from creating data that references something that doesn't exist.

```sql
-- orders references users
CREATE TABLE orders (
  id         BIGSERIAL      PRIMARY KEY,
  user_id    BIGINT         NOT NULL REFERENCES users(id),
  total      NUMERIC(10, 2) NOT NULL,
  status     VARCHAR(20)    NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- order_items references both orders and products
CREATE TABLE order_items (
  id         BIGSERIAL      PRIMARY KEY,
  order_id   BIGINT         NOT NULL REFERENCES orders(id),
  product_id BIGINT         NOT NULL REFERENCES products(id),
  quantity   INTEGER        NOT NULL CHECK (quantity > 0),
  price      NUMERIC(10, 2) NOT NULL   -- price snapshot at time of purchase
);

-- Explicit constraint syntax (preferred — you can name it for easier debugging)
CREATE TABLE posts (
  id        BIGSERIAL PRIMARY KEY,
  author_id BIGINT    NOT NULL,
  title     TEXT      NOT NULL,
  body      TEXT      NOT NULL,
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES users(id)
);
```

### ON DELETE Behaviour.

What happens to child rows when a parent row is deleted?

```sql
-- RESTRICT (default) — prevents deleting a user if they have orders
user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT

-- CASCADE — deletes all orders when the user is deleted
user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE

-- SET NULL — sets user_id to NULL on all orders (column must allow NULL)
user_id BIGINT REFERENCES users(id) ON DELETE SET NULL

-- SET DEFAULT — sets the column to its DEFAULT value
user_id BIGINT NOT NULL DEFAULT 0 REFERENCES users(id) ON DELETE SET DEFAULT

```

```sql
-- Which to use?
RESTRICT    → Most common. Hard fail. Forces you to clean up manually. Safer for audit trails.
CASCADE     → Use for dependent data that has no meaning without the parent (e.g. cart items → cart).
SET NULL    → Use when the child can exist independently (e.g. a post can exist without an author).
```

### Checking Referential Integrity.

```sql
-- PostgreSQL will reject this if user_id 999 doesn't exist in users
INSERT INTO orders (user_id, total) VALUES (999, 100.00);
-- ERROR: insert or update on table "orders" violates foreign key constraint
-- DETAIL:  Key (user_id)=(999) is not present in table "users".

-- PostgreSQL will reject this if orders reference this user
DELETE FROM users WHERE id = 1;
-- ERROR: update or delete on table "users" violates foreign key constraint on table "orders"
-- DETAIL: Key (id)=(1) is still referenced from table "orders".
```

---

## 4. Joins.

Joins combine rows from two or more tables based on a related column.

They are the SQL equivalent of MongoDB's `populate()`, but more explicit and more powerful.

```
Table A                  Table B
users                    orders
id | name                id | user_id | total
1  | Alice               1  | 1       | 150.00
2  | Bob                 2  | 1       | 75.00
3  | Carol               3  | 2       | 200.00
                         4  | 99      | 50.00   ← user_id 99 doesn't exist

```

### INNER JOIN.

Returns only rows where the condition matches in **both** tables.

Rows with no match on either side are excluded.

```sql
SELECT users.name, orders.id, orders.total
FROM users
INNER JOIN orders ON orders.user_id = users.id;

-- Result:
-- Alice | 1 | 150.00
-- Alice | 2 | 75.00
-- Bob   | 3 | 200.00
-- (Carol excluded — no orders. Order 4 excluded — user 99 doesn't exist.)

-- Shorthand: JOIN is INNER JOIN
SELECT u.name, o.total
FROM users u
JOIN orders o ON o.user_id = u.id;
-- u and o are table aliases — much cleaner in complex queries
```

### LEFT JOIN.

Returns **all rows from the left table**, plus matching rows from the right. If there's no match on the right, columns from the right table are NULL.

```sql
SELECT u.name, o.id AS order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- Result:
-- Alice | 1 | 150.00
-- Alice | 2 | 75.00
-- Bob   | 3 | 200.00
-- Carol | NULL | NULL   ← Carol has no orders, but she's still in the result

-- Classic use: find users who have NO orders
SELECT u.name
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE o.id IS NULL;
-- Result: Carol
```

### RIGHT JOIN.

Returns **all rows from the right table**, plus matching rows from the left.

Rarely used, you can always rewrite a RIGHT JOIN as a LEFT JOIN by swapping the table order.

### FULL OUTER JOIN.

Returns all rows from both tables. NULLs appear on either side where there's no match.

```sql
SELECT u.name, o.id, o.total
FROM users u
FULL OUTER JOIN orders o ON o.user_id = u.id;

-- Result:
-- Alice | 1    | 150.00
-- Alice | 2    | 75.00
-- Bob   | 3    | 200.00
-- Carol | NULL | NULL    ← user with no orders
-- NULL  | 4    | 50.00   ← order with no matching user
```

### Joining Multiple Tables.

```sql
-- orders → order_items → products (three table join)
SELECT
  u.name         AS customer,
  o.id           AS order_id,
  p.name         AS product,
  oi.quantity,
  oi.price       AS unit_price,
  oi.quantity * oi.price AS line_total
FROM orders o
JOIN users u        ON u.id = o.user_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p     ON p.id = oi.product_id
WHERE o.status = 'delivered'
ORDER BY o.id, p.name;
```

### Aggregations with Joins.

```sql
-- Total spent per customer
SELECT
  u.name,
  COUNT(DISTINCT o.id) AS order_count,
  SUM(o.total)         AS total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_spent DESC NULLS LAST;  -- NULLS LAST puts users with no orders at the bottom

-- Products never ordered
SELECT p.name
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.id IS NULL;
```

### Self Join.

A table joining itself — useful for hierarchical data like an employee reporting structure.

```sql
CREATE TABLE employees (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  manager_id BIGINT REFERENCES employees(id)  -- self-referencing
);

-- Each employee with their manager's name
SELECT
  e.name    AS employee,
  m.name    AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;
```

---

## 5. Indexes.

Without an index, PostgreSQL reads every row in a table to find matches, a **sequential scan (Seq Scan)**.

Indexes create a separate data structure that lets PostgreSQL jump directly to matching rows, an **index scan (Index Scan)**.

```
Table: orders (1,000,000 rows)

Find orders for user_id = 42 WITHOUT index:
  → PostgreSQL reads all 1,000,000 rows
  → ~800ms

Find orders for user_id = 42 WITH index on user_id:
  → PostgreSQL looks up 42 in the B-tree index → jumps to 15 matching rows
  → ~1ms

```

### Creating Indexes.

```sql
-- Single-column index
CREATE INDEX idx_orders_user_id ON orders(user_id);
-- Name convention: idx_<table>_<column(s)>

-- Unique index (also enforces uniqueness, like UNIQUE constraint)
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Composite index — covers queries filtering by BOTH columns together
-- Index on (user_id, status) helps: WHERE user_id = 1 AND status = 'pending'
-- It also helps:                    WHERE user_id = 1  (leftmost column rule)
-- It does NOT help:                 WHERE status = 'pending'  (can't skip leading columns)
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Index for ORDER BY — descending
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Partial index — index only a subset of rows
-- More efficient if you frequently query only active users (much smaller index)
CREATE INDEX idx_users_active ON users(email) WHERE is_active = TRUE;

-- Expression index — index on a computed value
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
-- Needed for: WHERE LOWER(email) = LOWER($1)

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));
```

### Checking If Your Indexes Are Used.

```sql
-- EXPLAIN ANALYZE shows the actual execution plan and timings
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 42;

-- Look for:
-- Seq Scan       → reading every row (no index used — consider adding one)
-- Index Scan     → using an index (good)
-- Index Only Scan → all needed data is in the index itself (best — no table access)

-- Example output:
--  Index Scan using idx_orders_user_id on orders  (cost=0.43..12.18 rows=15)
--    Index Cond: (user_id = 42)
--  Planning Time: 0.5 ms
--  Execution Time: 0.3 ms
```

### Index Trade-offs.

```
Indexes speed up READ (SELECT).
Indexes slow down WRITE (INSERT, UPDATE, DELETE) — PostgreSQL must update every index on write.

Rule of thumb:
  Index columns you filter by (WHERE), join on (ON), or sort by (ORDER BY).
  Don't index every column — only the ones your queries actually use.

Good index candidates:
  Foreign keys (user_id, order_id)  → almost always need an index
  Columns in WHERE clauses          → email, status, created_at
  Columns in ORDER BY               → created_at DESC

Bad index candidates:
  Boolean columns with low cardinality (only TRUE/FALSE) → index barely helps
  Very small tables (< a few thousand rows)              → seq scan is fine
  Columns rarely queried                                 → wasted write overhead
```

---

## 6. Transactions.

A transaction is a sequence of SQL statements that executes as a single, indivisible unit. Either **all** statements succeed, or **none** of them take effect.

The four properties of a database transaction are called **ACID**:

```
Atomicity    →  All or nothing. If any statement fails, the whole transaction is rolled back.
Consistency  →  A transaction takes the database from one valid state to another.
                Constraints (NOT NULL, UNIQUE, CHECK, FK) are always enforced.
Isolation    →  Concurrent transactions don't interfere with each other.
                Each transaction sees a consistent snapshot of the database.
Durability   →  Once committed, the data is permanently saved — even if the server crashes.

```

### Why Transactions Matter.

The classic example: transferring money between two bank accounts.

```sql
-- Without a transaction — DANGEROUS
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
-- Server crashes here. Account 1 lost $100, Account 2 never got it.
UPDATE accounts SET balance = balance + 100 WHERE id = 2;

-- With a transaction — SAFE
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- If ANYTHING fails between BEGIN and COMMIT, nothing is written.
```

### Transaction Syntax.

```sql
BEGIN;    -- or: START TRANSACTION;

  -- Your SQL statements
  INSERT INTO orders (user_id, total) VALUES (1, 150.00) RETURNING id;
  INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (1, 1, 2, 75.00);
  UPDATE products SET stock = stock - 2 WHERE id = 1 AND stock >= 2;

COMMIT;   -- write everything to disk permanently

-- If something goes wrong:
ROLLBACK; -- undo everything since BEGIN
```

### SAVEPOINT (Partial Rollback).

```sql
BEGIN;
  INSERT INTO users (email, name) VALUES ('a@test.com', 'A');

  SAVEPOINT before_second_insert;

  INSERT INTO users (email, name) VALUES ('b@test.com', 'B');
  -- Suppose this fails (duplicate email)

  ROLLBACK TO SAVEPOINT before_second_insert;
  -- Only the second insert is undone. The first insert is still pending.

  INSERT INTO users (email, name) VALUES ('c@test.com', 'C');

COMMIT;
-- Result: users A and C are inserted, B is not.
```

### Transactions in Node.js with `pg`.

```javascript
const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// The key: use a single client from the pool for the whole transaction.
// pool.query() could use different clients for each call — transaction state would be lost.
const transferFunds = async (fromId, toId, amount) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check balance
    const { rows } = await client.query(
      "SELECT balance FROM accounts WHERE id = $1 FOR UPDATE", // FOR UPDATE locks the row
      [fromId],
    );
    if (rows[0].balance < amount) {
      throw new Error("Insufficient funds");
    }

    await client.query(
      "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
      [amount, fromId],
    );
    await client.query(
      "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
      [amount, toId],
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release(); // always return the client to the pool
  }
};
```

### Isolation Levels.

When two transactions run concurrently, how much do they see of each other's work?

```sql
-- PostgreSQL's isolation levels (from least to most strict)

READ COMMITTED   (default) → Each statement sees data committed before it started.
                              Good for most applications.

REPEATABLE READ            → All statements in the transaction see a snapshot from when the
                              transaction started. Use for long-running calculations.

SERIALIZABLE               → Strictest. Transactions execute as if they ran one at a time.
                              Use for financial operations where phantom reads matter.

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
  ...
COMMIT;
```

---

## 7. Normalization.

Normalization is the process of organising a database schema to reduce data redundancy and improve data integrity. It is the relational complement to MongoDB's embedding/referencing decision.

An unnormalised schema stores the same piece of data in multiple places.

When that data changes, you must update every copy and if you miss one, your database is inconsistent.

### The Problem with Unnormalised Data.

```
Suppose you store orders like this (everything in one table):

order_id | customer_name | customer_email     | product_name | category     | price
---------|---------------|--------------------|--------------|--------------| ------
1        | Alice         | alice@example.com  | Laptop       | Electronics  | 999
2        | Alice         | alice@example.com  | Phone        | Electronics  | 599
3        | Bob           | bob@example.com    | Laptop       | Electronics  | 999

Problems:
1. Alice's email is stored twice. If she changes it, you update row 1 but forget row 2 → inconsistency.
2. The Laptop price is stored twice. A price change needs updating in every row that has a Laptop.
3. To delete an order, you lose the customer's contact info if it's their only order.
4. You can't add a product to the system without also creating an order.

```

### First Normal Form (1NF).

Each column must contain **atomic** (indivisible) values. No repeating groups. Every row must be uniquely identifiable.

```sql
-- ❌ Not 1NF — tags stored as a comma-separated string
CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  name  TEXT,
  tags  TEXT   -- 'electronics,portable,wireless' — violates 1NF
);
-- You can't query: WHERE tags CONTAINS 'portable' without parsing the string.

-- ✅ 1NF — tags in a separate table
CREATE TABLE products (
  id   SERIAL PRIMARY KEY,
  name TEXT
);
CREATE TABLE product_tags (
  product_id INTEGER REFERENCES products(id),
  tag        TEXT,
  PRIMARY KEY (product_id, tag)
);
```

### Second Normal Form (2NF).

Must be in 1NF. Every non-key column must depend on the **whole** primary key, not just part of it. This only applies to tables with composite primary keys.

```sql
-- ❌ Not 2NF — composite PK is (order_id, product_id)
-- but product_name depends only on product_id, not on the full key
CREATE TABLE order_items (
  order_id     INTEGER,
  product_id   INTEGER,
  product_name TEXT,    -- depends only on product_id — partial dependency
  quantity     INTEGER,
  PRIMARY KEY (order_id, product_id)
);

-- ✅ 2NF — product_name lives in the products table
CREATE TABLE products (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE order_items (
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER NOT NULL,
  price      NUMERIC(10, 2) NOT NULL,  -- price snapshot (ok to store here)
  PRIMARY KEY (order_id, product_id)
);
```

### Third Normal Form (3NF).

Must be in 2NF. No **transitive dependencies** — non-key columns must not depend on other non-key columns.

```sql
-- ❌ Not 3NF — zip_code determines city and state (transitive dependency)
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT,
  zip_code VARCHAR(10),
  city     TEXT,    -- depends on zip_code, not on id
  state    TEXT     -- depends on zip_code, not on id
);

-- ✅ 3NF — separate zip code table
CREATE TABLE zip_codes (
  zip_code VARCHAR(10) PRIMARY KEY,
  city     TEXT NOT NULL,
  state    TEXT NOT NULL
);
CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  name     TEXT,
  zip_code VARCHAR(10) REFERENCES zip_codes(zip_code)
);
```

### Practical Normalization vs Denormalization.

In the real world, strict normalization is a starting point, not a religion. Controlled denormalization is sometimes the right call for performance.

```sql
-- Snapshots in order_items — intentional denormalization
-- We store price directly on the line item even though it also exists on products.
-- Why? If the product price changes later, the historical order must reflect the price AT purchase time.
-- This is not a bug — it is correct data modeling.

-- Category name on products — could be normalized into a categories table
-- For most apps: a VARCHAR with a CHECK constraint is fine
-- For apps where categories have attributes (image, slug, meta description): normalize it

-- The question is always: "Do I need to change this data in one place and have it update everywhere?"
-- If YES → normalize (foreign key reference)
-- If NO, or "I need a historical snapshot" → denormalize (copy the value)
```

---

## 8. Writing Raw SQL Queries.

Connecting PostgreSQL to Node.js without an ORM.

This is the layer that ORMs like Prisma sit on top of. Understanding it makes you a better user of those tools.

### Setting Up `pg` (node-postgres).

```bash
npm install pg dotenv
```

```javascript
// db.js
const { Pool } = require("pg");

// Pool manages a set of connections — much more efficient than creating a new
// connection for every query (TCP handshakes are expensive)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Or individual fields:
  // host:     process.env.DB_HOST,
  // port:     process.env.DB_PORT || 5432,
  // database: process.env.DB_NAME,
  // user:     process.env.DB_USER,
  // password: process.env.DB_PASS,
  max: 10, // max 10 connections in the pool
  idleTimeoutMillis: 30000, // close idle connections after 30s
  connectionTimeoutMillis: 2000, // error if can't connect within 2s
});

// Test the connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
  console.log("PostgreSQL connected");
  release();
});

module.exports = pool;
```

```
# .env
DATABASE_URL=postgresql://username:password@localhost:5432/mydb
```

### Parameterized Queries.

**Always use parameterized queries. Never concatenate user input into SQL strings.**

```javascript
const pool = require("./db");

// $1, $2, $3 are placeholders — values are passed as the second argument
// PostgreSQL handles type conversion and escaping safely

// SELECT
const getUser = async (id) => {
  const result = await pool.query(
    "SELECT id, email, name, role FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null; // rows is always an array; rows[0] is the first result
};

// INSERT with RETURNING
const createUser = async (email, name, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (email, name, password)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, name, passwordHash],
  );
  return result.rows[0];
};

// UPDATE
const updateUser = async (id, name) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, email, name, updated_at`,
    [name, id],
  );
  return result.rows[0] || null;
};

// DELETE
const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id],
  );
  return result.rowCount > 0; // rowCount is how many rows were affected
};

// Multiple parameters
const getUserOrders = async (userId, status) => {
  const result = await pool.query(
    `SELECT o.id, o.total, o.status, o.created_at
     FROM orders o
     WHERE o.user_id = $1
       AND ($2::TEXT IS NULL OR o.status = $2)
     ORDER BY o.created_at DESC`,
    [userId, status || null],
  );
  return result.rows;
};
```

### Dynamic Queries.

Sometimes you need to build queries dynamically (e.g. optional filters). Do this safely:

```javascript
// Build WHERE clauses dynamically without SQL injection
const searchProducts = async ({ category, minPrice, maxPrice, search }) => {
  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (category) {
    conditions.push(`category = $${paramCount++}`);
    values.push(category);
  }
  if (minPrice !== undefined) {
    conditions.push(`price >= $${paramCount++}`);
    values.push(minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push(`price <= $${paramCount++}`);
    values.push(maxPrice);
  }
  if (search) {
    conditions.push(`name ILIKE $${paramCount++}`);
    values.push(`%${search}%`);
  }

  const whereClause =
    conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

  const result = await pool.query(
    `SELECT * FROM products ${whereClause} ORDER BY created_at DESC`,
    values,
  );
  return result.rows;
};
```

### Common Query Patterns in Express.

```javascript
// Pagination
const getPaginatedOrders = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [countResult, dataResult] = await Promise.all([
    pool.query("SELECT COUNT(*) FROM orders"),
    pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset],
    ),
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
};

// Check existence without fetching the whole row
const emailExists = async (email) => {
  const result = await pool.query("SELECT 1 FROM users WHERE email = $1", [
    email,
  ]);
  return result.rowCount > 0;
};
```

### Error Handling.

PostgreSQL error codes let you handle specific failures (duplicate key, constraint violation, etc.) without parsing error messages.

```javascript
const createUser = async (email, name, passwordHash) => {
  try {
    const result = await pool.query(
      "INSERT INTO users (email, name, password) VALUES ($1, $2, $3) RETURNING id, email",
      [email, name, passwordHash],
    );
    return result.rows[0];
  } catch (err) {
    // PostgreSQL error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
    if (err.code === "23505") {
      // 23505 = unique_violation — email already exists
      throw new Error("Email already in use");
    }
    if (err.code === "23503") {
      // 23503 = foreign_key_violation — referenced row doesn't exist
      throw new Error("Referenced record does not exist");
    }
    if (err.code === "23502") {
      // 23502 = not_null_violation
      throw new Error(`Required field missing: ${err.column}`);
    }
    throw err; // re-throw unknown errors
  }
};
```

---

## Assignment.

1. **Build a REST API with Raw SQL and PostgreSQL.**

   **What you practice:**
   - Connecting to PostgreSQL with `pg`
   - creating tables with proper types and constraints
   - parameterized queries for all CRUD operations
   - handling PostgreSQL error codes (23505 duplicate, 23503 FK violation)
   - `RETURNING` to get inserted/updated rows back
   - proper HTTP status codes.

   **Requirements:**
   - Set up a PostgreSQL database called `week14_easy`.
   - Create a `products` table: `id (BIGSERIAL PK)`, `name (VARCHAR 255, NOT NULL)`, `price (NUMERIC 10,2, NOT NULL, CHECK >= 0)`, `category (VARCHAR 100)`, `stock (INTEGER, DEFAULT 0, CHECK >= 0)`, `created_at (TIMESTAMPTZ, DEFAULT NOW())`.
   - Implement these endpoints using raw `pg` queries, no ORM:
     - `POST /api/products` → create, return `201` with the product. Return `400` if name or price missing.
     - `GET /api/products` → return all products, sorted newest first. Support `?category=electronics` filter.
     - `GET /api/products/:id` → return one product, `404` if not found.
     - `PUT /api/products/:id` → update name, price, stock, category. `404` if not found.
     - `DELETE /api/products/:id` → delete, return `{ message: 'Product deleted' }`. `404` if not found.
   - Write the table creation SQL in a `schema.sql` file.

   [Solution](./Assignment/code1)

   **POSTMAN Test Cases.**

   ```
   # 1. Create a product — success
   POST http://localhost:3000/api/products
   Body: { "name": "Laptop", "price": 999.99, "category": "electronics", "stock": 10 }
   → 201  { id: 1, name: "Laptop", price: "999.99", category: "electronics", stock: 10, created_at: "..." }

   # 2. Create — missing name
   POST http://localhost:3000/api/products
   Body: { "price": 49.99 }
   → 400  { message: "name and price are required" }

   # 3. Create — negative price
   POST http://localhost:3000/api/products
   Body: { "name": "Broken", "price": -10 }
   → 400  { message: "price must be a non-negative number" }

   # 4. Get all products
   GET http://localhost:3000/api/products
   → 200  [ { id: 1, ... }, ... ]

   # 5. Get all — filter by category
   GET http://localhost:3000/api/products?category=electronics
   → 200  [ only electronics products ]

   # 6. Get one — valid id
   GET http://localhost:3000/api/products/1
   → 200  { id: 1, name: "Laptop", ... }

   # 7. Get one — not found
   GET http://localhost:3000/api/products/9999
   → 404  { message: "Product not found" }

   # 8. Get one — invalid id format
   GET http://localhost:3000/api/products/abc
   → 400  { message: "Invalid ID format" }

   # 9. Update — partial update (only price)
   PUT http://localhost:3000/api/products/1
   Body: { "price": 849.99 }
   → 200  { id: 1, name: "Laptop", price: "849.99", stock: 10, ... }  (name and stock unchanged)

   # 10. Update — constraint violation (negative stock)
   PUT http://localhost:3000/api/products/1
   Body: { "stock": -5 }
   → 400  { message: "Value violates a constraint (price >= 0, stock >= 0)" }

   # 11. Update — not found
   PUT http://localhost:3000/api/products/9999
   Body: { "price": 100 }
   → 404  { message: "Product not found" }

   # 12. Delete — success
   DELETE http://localhost:3000/api/products/1
   → 200  { message: "Product deleted" }

   # 13. Delete — already deleted
   DELETE http://localhost:3000/api/products/1
   → 404  { message: "Product not found" }
   ```

2. **Multi-Table Blog API with Joins and Transactions.**

   **What you practice:**
   - Designing a multi-table relational schema with foreign keys
   - writing JOIN queries
   - using transactions for operations that span multiple tables
   - pagination with COUNT + LIMIT/OFFSET in parallel
   - `ON DELETE CASCADE`
   - handling FK violations gracefully.

   **Requirements:**
   - Set up a PostgreSQL database called `week14_medium`.
   - Create these tables in `schema.sql`:
     - `users` — `id, email (UNIQUE NOT NULL), name (NOT NULL), created_at`.
     - `posts` — `id, author_id (FK → users, ON DELETE CASCADE), title (NOT NULL), body (NOT NULL), tags TEXT[], views INTEGER DEFAULT 0, created_at`.
     - `comments` — `id, post_id (FK → posts, ON DELETE CASCADE), user_id (FK → users), body (NOT NULL), created_at`.
   - Endpoints:
     - `POST /api/users` — create a user.
     - `POST /api/posts` — create a post. Body: `{ authorId, title, body, tags }`.
     - `GET /api/posts` — return all posts with: author `name` and `email` (JOIN), comment count (subquery or JOIN), support `?tag=postgresql` filter (using `ANY($1)` on the tags array), `?page=1&limit=5` pagination. Return `{ data, page, limit, total, totalPages }`.
     - `GET /api/posts/:id` — return post with full author details, all comments with commenter name, increment `views` (use a transaction: UPDATE then SELECT).
     - `POST /api/posts/:id/comments` — add a comment. Verify both the post and user exist before inserting (handle FK violation by catching error code `23503`).
     - `DELETE /api/posts/:id` — delete a post. Because of `ON DELETE CASCADE`, all its comments should be deleted automatically.

   [Solution](./Assignment/code2)

   **POSTMAN Test Cases.**

   ```
   # 1. Create users
   POST http://localhost:3000/api/users
   Body: { "email": "alice@example.com", "name": "Alice" }
   → 201  { id: 1, email: "alice@example.com", name: "Alice", created_at: "..." }

   POST http://localhost:3000/api/users
   Body: { "email": "bob@example.com", "name": "Bob" }
   → 201  { id: 2, ... }

   # 2. Duplicate email
   POST http://localhost:3000/api/users
   Body: { "email": "alice@example.com", "name": "Alice2" }
   → 409  { message: "Email already in use" }

   # 3. Create a post
   POST http://localhost:3000/api/posts
   Body: { "authorId": 1, "title": "Intro to PostgreSQL", "body": "...", "tags": ["postgresql", "database"] }
   → 201  { id: 1, author_id: 1, title: "Intro to PostgreSQL", tags: ["postgresql","database"], views: 0, ... }

   # 4. Create post — author doesn't exist
   POST http://localhost:3000/api/posts
   Body: { "authorId": 999, "title": "Ghost Post", "body": "..." }
   → 404  { message: "Author not found" }

   # 5. Get all posts — no filter
   GET http://localhost:3000/api/posts
   → 200  { data: [...], page: 1, limit: 10, total: 3, totalPages: 1 }
           Each post includes: author { id, name, email }, comment_count

   # 6. Get all posts — tag filter
   GET http://localhost:3000/api/posts?tag=postgresql
   → 200  { data: [ only posts tagged postgresql ], total: 2, ... }

   # 7. Get all posts — pagination
   GET http://localhost:3000/api/posts?page=1&limit=2
   → 200  { data: [ 2 posts ], page: 1, limit: 2, total: 3, totalPages: 2 }

   # 8. Get one post — views increment
   GET http://localhost:3000/api/posts/1
   → 200  { ..., views: 1, author: { name, email }, comments: [] }

   GET http://localhost:3000/api/posts/1   (call again)
   → 200  { ..., views: 2, ... }

   # 9. Add a comment
   POST http://localhost:3000/api/posts/1/comments
   Body: { "userId": 2, "body": "Great post!" }
   → 201  { id: 1, post_id: 1, user_id: 2, body: "Great post!", created_at: "..." }

   # 10. Get post with comment
   GET http://localhost:3000/api/posts/1
   → 200  { ..., comments: [{ id: 1, body: "Great post!", commenter_name: "Bob", ... }] }

   # 11. Comment on non-existent post
   POST http://localhost:3000/api/posts/9999/comments
   Body: { "userId": 1, "body": "test" }
   → 404  { message: "Post or user not found" }

   # 12. Delete a post — cascade
   DELETE http://localhost:3000/api/posts/1
   → 200  { message: "Post deleted" }
   (All comments on post 1 are also deleted automatically via ON DELETE CASCADE)

   # 13. Get deleted post
   GET http://localhost:3000/api/posts/1
   → 404  { message: "Post not found" }
   ```

3. **E-Commerce API with Full Transactions, Aggregations and Advanced Queries.**

   **What you practice:**
   - Designing a production-like schema with 5 tables
   - `FOR UPDATE` row locking to prevent race conditions on stock
   - multi-statement transactions that roll back on partial failure
   - complex aggregation queries with GROUP BY, HAVING, multiple JOINs
   - window functions (`RANK()`)
   - dynamic filter building
   - upsert with `ON CONFLICT DO UPDATE`.

    **Requirements:**

     **Part 1 : Schema (`schema.sql`):** Create these 5 tables:

   - `users` : `id, email (UNIQUE), name, password_hash, role (DEFAULT 'user'), created_at`.
   - `categories` : `id, name (UNIQUE NOT NULL), slug (UNIQUE NOT NULL)`.
   - `products` : `id, name, description, price (CHECK >= 0), stock (CHECK >= 0), category_id (FK → categories), created_at`.
   - `orders` : `id, user_id (FK → users), total (NUMERIC 10,2), status (CHECK IN pending/shipped/delivered/cancelled, DEFAULT pending), created_at`.
   - `order_items` : `order_id (FK → orders ON DELETE CASCADE), product_id (FK → products), quantity (CHECK > 0), price (NUMERIC 10,2), PRIMARY KEY (order_id, product_id)`.

   Add indexes on: `products(category_id)`, `orders(user_id)`, `orders(status)`, `order_items(product_id)`.

   **Part 2 : Order Placement with Stock Locking:**
   - `POST /api/orders` — body: `{ userId, items: [{ productId, quantity }] }`.

   - For each item, use `SELECT ... FOR UPDATE` inside a transaction to lock the product row, then check stock, decrement it, and insert the line item. If **any** item has insufficient stock, `ROLLBACK` the whole transaction and return `400`. Snapshot `name` and `price` into `order_items`.

   **Part 3 : Dashboard Aggregations:**
   - `GET /api/dashboard/revenue` — revenue and order count per month for the current year (only `delivered` orders). Use `DATE_TRUNC('month', created_at)` for grouping.
   - `GET /api/dashboard/top-products` — top 5 products by quantity sold (across all `delivered` orders). JOIN `order_items` → `products`. Return `name, total_sold, total_revenue`.
   - `GET /api/dashboard/category-stats` — per category: product count, average price, total stock. JOIN `products → categories`. Use `HAVING` to exclude categories with 0 products.
   - `GET /api/dashboard/top-customers` — top 10 customers by total spend (only `delivered` orders). Use `RANK() OVER (ORDER BY SUM(total) DESC)` window function. Return `rank, name, email, order_count, total_spend`.

   **Part 4 : Upsert.**
   - `PUT /api/products/:id/stock` — body: `{ quantity }`
   - Use `INSERT INTO product_stock_log (product_id, quantity, action, created_at) VALUES (...) ON CONFLICT (product_id, DATE(created_at)) DO UPDATE SET quantity = product_stock_log.quantity + EXCLUDED.quantity` — a daily stock movement log that accumulates instead of duplicates.

   [Solution](./Assignment/code3)

   **POSTMAN Test Cases.**

    ```
    # ── Setup ──────────────────────────────────────────────────────────────────────
    # Run schema.sql then seed.sql before testing.
    # Note the IDs returned by seed — use them in the requests below.

    # ── Part 2: Order Placement ────────────────────────────────────────────────────

    # 1. Place a valid order
    POST http://localhost:3000/api/orders
    Body: {
      "userId": 1,
      "items": [
        { "productId": 1, "quantity": 2 },
        { "productId": 3, "quantity": 1 }
      ]
    }
    → 201  {
        id: 1, user_id: 1, total: "2149.97", status: "pending",
        lineItems: [
          { name: "Laptop",     price: 999.99, quantity: 2 },
          { name: "Headphones", price: 149.99, quantity: 1 }
        ]
      }
      (Check products table: Laptop stock went from 10 → 8, Headphones from 100 → 99)

    # 2. Insufficient stock
    POST http://localhost:3000/api/orders
    Body: { "userId": 1, "items": [{ "productId": 1, "quantity": 9999 }] }
    → 400  { message: "Insufficient stock for Laptop. Available: 8" }
      (Stock must still be 8 — transaction was rolled back)

    # 3. Product not found
    POST http://localhost:3000/api/orders
    Body: { "userId": 1, "items": [{ "productId": 9999, "quantity": 1 }] }
    → 404  { message: "Product 9999 not found" }

    # 4. Missing items array
    POST http://localhost:3000/api/orders
    Body: { "userId": 1 }
    → 400  { message: "userId and a non-empty items array are required" }

    # 5. Update order status
    PUT http://localhost:3000/api/orders/1/status
    Body: { "status": "delivered" }
    → 200  { id: 1, status: "delivered", ... }

    # 6. Invalid status
    PUT http://localhost:3000/api/orders/1/status
    Body: { "status": "flying" }
    → 400  { message: "status must be one of: pending, shipped, delivered, cancelled" }

    # ── Part 3: Dashboard (create a few more orders and mark them delivered first) ─

    # 7. Revenue by month
    GET http://localhost:3000/api/dashboard/revenue
    → 200  [ { month: 6, revenue: "2149.97", orders: 1 }, ... ]
      (Only delivered orders appear)

    # 8. Top products
    GET http://localhost:3000/api/dashboard/top-products
    → 200  [
        { name: "Laptop", total_sold: 2, total_revenue: "1999.98" },
        { name: "Headphones", total_sold: 1, total_revenue: "149.99" },
        ...
      ]

    # 9. Category stats
    GET http://localhost:3000/api/dashboard/category-stats
    → 200  [
        { category: "Electronics", product_count: 3, avg_price: "583.32", total_stock: 133 },
        { category: "Clothing",    product_count: 2, avg_price: "59.99",  total_stock: 280 },
        { category: "Books",       product_count: 1, avg_price: "49.99",  total_stock: 60  }
      ]

    # 10. Top customers
    GET http://localhost:3000/api/dashboard/top-customers
    → 200  [
        { rank: 1, name: "Alice", email: "alice@example.com", order_count: 1, total_spend: "2149.97" },
        ...
      ]

    # ── Part 4: Stock Upsert ────────────────────────────────────────────────────────

    # 11. First restock today
    PUT http://localhost:3000/api/products/1/stock
    Body: { "quantity": 20 }
    → 200  {
        product: { id: 1, name: "Laptop", stock: 28 },
        log: { product_id: 1, quantity: 20, action: "restock", log_date: "2026-06-27" }
      }

    # 12. Second restock same day — quantity accumulates in the log
    PUT http://localhost:3000/api/products/1/stock
    Body: { "quantity": 5 }
    → 200  {
        product: { id: 1, name: "Laptop", stock: 33 },
        log: { product_id: 1, quantity: 25, ... }
      }
      (log.quantity is now 25 = 20 + 5, not a new row — ON CONFLICT DO UPDATE fired)

    # 13. Invalid quantity
    PUT http://localhost:3000/api/products/1/stock
    Body: { "quantity": -10 }
    → 400  { message: "quantity must be a positive number" }

    # 14. Product not found
    PUT http://localhost:3000/api/products/9999/stock
    Body: { "quantity": 10 }
    → 404  { message: "Product not found" }
    ```
