# List of things learned.

## 1. What is an ORM?

An **ORM (Object-Relational Mapper)** is a library that sits between your application code and the database.

It translates between the two worlds.

Your JavaScript objects and SQL tables.

So you can work with your data using the language you already know instead of writing raw SQL for every operation.

Without an ORM, a simple "_get user by email_" looks like this:

```javascript
const result = await pool.query("SELECT * FROM users WHERE email = $1", [
  email,
]);
const user = result.rows[0];
```

With Prisma, the same operation is:

```javascript
const user = await prisma.user.findUnique({ where: { email } });
```

The ORM handles query building, parameterization, type conversion and result mapping.

### What an ORM Actually Does.

```
Without ORM                              With ORM
──────────────────────────────────────   ──────────────────────────────────────
Write raw SQL strings                    Write JavaScript method calls
Manually map result rows to objects      Results returned as typed objects
Maintain schema in SQL files             Schema defined in code (Prisma schema)
Write migrations by hand                 Migrations generated automatically
No type safety on query results          Full TypeScript types on every result
Repeat boilerplate for every table       Consistent API across all models
```

### ORM vs Query Builder vs Raw SQL.

```
Raw SQL (pg)
  Maximum control. Maximum verbosity. No type safety.
  Best when: you need a very specific query the ORM can't express.

Query Builder (Knex.js)
  Builds SQL programmatically. Still SQL-shaped thinking.
  Best when: you want the flexibility of SQL with programmatic composition.

ORM (Prisma, Drizzle)
  Highest abstraction. Type-safe. Auto-migrations. Less control.
  Best when: building typical CRUD applications quickly and safely.
```

### Prisma vs Drizzle.

These are the two dominant modern ORMs in the Node.js ecosystem.

```
Prisma
  Schema-first — you define your schema in a .prisma file, not in JS.
  Generates a fully type-safe client from your schema.
  Auto-generates migrations with prisma migrate.
  Excellent DX (developer experience) — great autocomplete.
  Slightly more magic — generated client, shadow database for migrations.
  Best for: teams, larger apps, when DX and type safety are the priority.

Drizzle
  Code-first — schema is defined in TypeScript files.
  Extremely lightweight — no generated client, no shadow DB.
  SQL-like API — feels close to writing SQL.
  Faster than Prisma in benchmarks.
  Less magic — you control exactly what runs.
  Best for: performance-sensitive apps, developers who prefer staying close to SQL.

This week covers both. We use Prisma as the primary (deeper coverage)
and introduce Drizzle as an alternative pattern.
```

---

## 2. Schema Definition.

### Prisma Schema.

Everything in Prisma starts with `schema.prisma`.

A single file that describes your database connection, your models (tables) and their relationships.

```bash
npm install prisma @prisma/client
npx prisma init
# Creates prisma/schema.prisma and a .env with DATABASE_URL
```

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  // Tells Prisma to generate a JavaScript/TypeScript client
}

datasource db {
  provider = "postgresql"
  // Also supports: "mysql", "sqlite", "sqlserver", "mongodb"
  url      = env("DATABASE_URL")
  // Reads the connection string from your .env file
}

model User {
  id        Int      @id @default(autoincrement())
  // @id         → primary key
  // @default(autoincrement()) → auto-increment integer (SERIAL in PostgreSQL)

  email     String   @unique
  // @unique → creates a UNIQUE constraint + index

  name      String
  password  String

  role      Role     @default(USER)
  // Role is an enum defined below

  isActive  Boolean  @default(true)
  // @default(true) → DEFAULT TRUE in SQL

  createdAt DateTime @default(now())
  // @default(now()) → DEFAULT NOW() in SQL

  updatedAt DateTime @updatedAt
  // @updatedAt → Prisma automatically sets this on every update

  posts     Post[]
  // Relation field — not stored in DB, used for Prisma queries
  // Post[] means: this user can have many posts

  profile   Profile?
  // Profile? means: this user can have zero or one profile (optional)

  @@map("users")
  // @@map → the actual table name in the database. Without this, Prisma uses "User".
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  // String? → nullable column. Without ?, the column is NOT NULL.

  userId Int    @unique
  // @unique here makes this a one-to-one relationship

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  // fields: [userId]    → the FK column on THIS model
  // references: [id]    → the PK column on the related model
  // onDelete: Cascade   → if User is deleted, Profile is also deleted

  @@map("profiles")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String
  published Boolean  @default(false)
  views     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  tags      Tag[]    @relation("PostTags")
  // Many-to-many with Tag — Prisma manages the join table automatically

  @@index([authorId])
  // @@index → creates a database index on authorId
  // Use for columns you filter or sort by frequently

  @@map("posts")
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] @relation("PostTags")

  @@map("tags")
}

enum Role {
  USER
  ADMIN
  MODERATOR
  // Becomes a PostgreSQL ENUM type
}
```

### Field Types in Prisma.

```prisma
// Prisma type → PostgreSQL type
String    → TEXT (or VARCHAR with @db.VarChar(255))
Int       → INTEGER
BigInt    → BIGINT
Float     → DOUBLE PRECISION
Decimal   → DECIMAL / NUMERIC  ← use for money, not Float (floating point errors)
Boolean   → BOOLEAN
DateTime  → TIMESTAMP WITH TIME ZONE
Json      → JSONB
Bytes     → BYTEA

// Database-specific type overrides
price     Decimal  @db.Decimal(10, 2)
name      String   @db.VarChar(255)
bio       String?  @db.Text
```

### Drizzle Schema (for comparison).

Drizzle defines schema in TypeScript files, not a separate DSL.

```typescript
// drizzle/schema.ts
import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["USER", "ADMIN", "MODERATOR"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").default("USER").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  published: boolean("published").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations — used by Drizzle's query builder for joins
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

---

## 3. Migrations.

A migration is a versioned SQL script that describes a change to your database schema.

Migrations let you evolve your schema over time without destroying existing data and keep schema changes in version control alongside your code.

### Prisma Migrations.

```bash
# After defining or changing your schema.prisma:

# Create and apply a migration (development)
npx prisma migrate dev --name init
# Prisma:
#   1. Diffs your schema against the current DB state
#   2. Generates SQL in prisma/migrations/TIMESTAMP_init/migration.sql
#   3. Applies it to your development DB
#   4. Regenerates the Prisma client

# Apply pending migrations (production — no interactive prompts, no client generation)
npx prisma migrate deploy

# See migration status — which are applied, which are pending
npx prisma migrate status

# Reset the DB entirely and reapply all migrations from scratch (dev only — destroys data)
npx prisma migrate reset
```

```sql
-- What Prisma generates in prisma/migrations/20240101000000_init/migration.sql
-- (You should read and understand this before committing it)

CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

CREATE TABLE "users" (
    "id"        SERIAL NOT NULL,
    "email"     TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "password"  TEXT NOT NULL,
    "role"      "Role" NOT NULL DEFAULT 'USER',
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

### What Happens When You Change the Schema.

```prisma
// You add a phone field to User
model User {
  // ... existing fields
  phone String?   // nullable — won't break existing rows
}
```

```bash
npx prisma migrate dev --name add_phone_to_users
# Generates:  ALTER TABLE "users" ADD COLUMN "phone" TEXT;
# Applies it. Safe — nullable column, existing rows get NULL.
```

```prisma
// You rename email to emailAddress
model User {
  emailAddress String @unique
}
```

```bash
npx prisma migrate dev --name rename_email
# ⚠️ Prisma warns: this will DROP the email column and CREATE emailAddress.
#    All existing email data will be lost.
#    In production, rename columns in two steps:
#    1. Add emailAddress, copy data, deploy
#    2. Remove email, deploy
```

### Drizzle Migrations.

```bash
npm install drizzle-orm drizzle-kit postgres

# drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema:    './drizzle/schema.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});

# Generate migration SQL from schema changes
npx drizzle-kit generate

# Apply migrations to the database
npx drizzle-kit migrate

# Push schema directly to DB without migration files (dev only, like Prisma db push)
npx drizzle-kit push
```

### Prisma DB Push (No Migration Files).

```bash
# Syncs the DB to match schema.prisma WITHOUT creating migration files.
# Useful for: rapid prototyping, throwaway dev databases, no data to preserve.
# NOT suitable for production — you lose the migration history.
npx prisma db push
```

### Seeding the Database.

```javascript
// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // upsert = insert if not exists, update if exists
  // Lets you run the seed script multiple times without errors
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  });

  console.log("Seeded:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```json
// package.json — tell Prisma where the seed script is
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

```bash
npx prisma db seed
```

---

## 4. CRUD Operations.

First, initialise the Prisma client.

Create one instance and reuse it across your application. Creating a new `PrismaClient` per request opens too many database connections.

```javascript
// lib/prisma.js
const { PrismaClient } = require("@prisma/client");

// In development, hot-reloading creates a new module instance on every change,
// which would create a new PrismaClient (and a new connection pool) each time.
// This pattern stores one instance globally to avoid that.
const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"], // log all queries in development
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

module.exports = prisma;
```

### CREATE.

```javascript
const prisma = require("./lib/prisma");

// Create one record
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice",
    password: hashedPassword,
  },
  // select: return only specific fields (never return the password)
  select: { id: true, email: true, name: true, createdAt: true },
});
// result: { id: 1, email: 'alice@example.com', name: 'Alice', createdAt: Date }

// Create with a nested relation (create user AND their profile in one query)
const userWithProfile = await prisma.user.create({
  data: {
    email: "bob@example.com",
    name: "Bob",
    password: hashedPassword,
    profile: {
      create: { bio: "Full-stack developer" },
      // Prisma creates the Profile record and links it automatically
    },
  },
  include: { profile: true }, // include the profile in the response
});

// Create many records at once
const { count } = await prisma.user.createMany({
  data: [
    { email: "carol@example.com", name: "Carol", password: hash1 },
    { email: "dave@example.com", name: "Dave", password: hash2 },
  ],
  skipDuplicates: true, // ignore records that violate unique constraints
});
console.log(`Created ${count} users`);
```

### READ.

```javascript
// Find one by primary key
const user = await prisma.user.findUnique({
  where: { id: 1 },
});
// Returns null if not found (never throws for missing records)

// Find one by any unique field
const user = await prisma.user.findUnique({
  where: { email: "alice@example.com" },
  select: { id: true, name: true, email: true },
  // select: only return these fields. omit 'password' — never send it to the client.
});

// Find first matching record (non-unique field)
const firstAdmin = await prisma.user.findFirst({
  where: { role: "ADMIN" },
  orderBy: { createdAt: "asc" },
});

// Find all with filters
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true,
    role: "USER",
  },
  orderBy: { createdAt: "desc" },
  take: 10, // LIMIT 10
  skip: 20, // OFFSET 20
  select: { id: true, name: true, email: true },
});

// Prisma filter operators
const results = await prisma.user.findMany({
  where: {
    name: { contains: "ali", mode: "insensitive" }, // ILIKE '%ali%'
    createdAt: { gte: new Date("2024-01-01") }, // >= date
    role: { in: ["ADMIN", "MODERATOR"] }, // IN (...)
    email: { not: "spam@example.com" }, // != value
    OR: [
      // WHERE x OR y
      { name: { contains: "alice" } },
      { email: { contains: "alice" } },
    ],
  },
});

// Pagination with total count in one round trip
const page = 1;
const limit = 10;
const [users, total] = await prisma.$transaction([
  prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  }),
  prisma.user.count(),
]);
// Returns both in parallel using a transaction

// Include related data (JOIN equivalent)
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: {
    author: { select: { name: true, email: true } },
    tags: true,
    // _count: { select: { comments: true } }  ← include counts without fetching all rows
  },
});
```

### UPDATE.

```javascript
// Update one record by unique field
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Alice Smith" },
  select: { id: true, name: true, updatedAt: true },
});
// Throws PrismaClientKnownRequestError with code P2025 if record not found

// Increment a numeric field atomically
await prisma.post.update({
  where: { id: 1 },
  data: { views: { increment: 1 } },
  // Other operators: decrement, multiply, divide, set
});

// Connect/disconnect relations
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      connect: [{ id: 2 }, { id: 3 }], // add existing tags to this post
      disconnect: [{ id: 1 }], // remove a tag from this post
    },
  },
});

// Upsert — insert if not exists, update if exists
const user = await prisma.user.upsert({
  where: { email: "alice@example.com" },
  update: { name: "Alice Smith" },
  create: { email: "alice@example.com", name: "Alice Smith", password: hash },
});

// Update many
const { count } = await prisma.user.updateMany({
  where: { isActive: false },
  data: { role: "USER" },
});
```

### DELETE.

```javascript
// Delete one by unique field
const deleted = await prisma.user.delete({
  where: { id: 1 },
});
// Throws P2025 if not found

// Delete many
const { count } = await prisma.user.deleteMany({
  where: { isActive: false },
});

// Soft delete pattern — mark as deleted instead of actually deleting
// Add deletedAt DateTime? to your model, then:
await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
});

// Filter out soft-deleted records in all queries
const users = await prisma.user.findMany({
  where: { deletedAt: null },
});
```

### Raw Queries (Escape Hatch).

When Prisma can't express a query, drop down to raw SQL.

```javascript
// $queryRaw — returns typed results
// sql template literal provides safe parameterization automatically
const { PrismaClient, Prisma } = require("@prisma/client");

const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// $executeRaw — for INSERT/UPDATE/DELETE (returns affected row count)
const count = await prisma.$executeRaw`
  UPDATE users SET is_active = false WHERE created_at < ${cutoffDate}
`;
```

---

## 5. Relations.

Relations in Prisma map directly to the foreign key relationships you learned in Week-14.

But Prisma gives you a clean API for querying across them.

### One-to-One.

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  userId Int  @unique              // @unique makes it one-to-one
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

```javascript
// Create user with profile
const user = await prisma.user.create({
  data: {
    email: "alice@example.com",
    name: "Alice",
    password: hash,
    profile: { create: { bio: "Developer" } },
  },
  include: { profile: true },
});

// Get user with profile
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { profile: true },
});

// Update profile through user
await prisma.user.update({
  where: { id: 1 },
  data: { profile: { update: { bio: "Senior Developer" } } },
});
```

### One-to-Many.

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  authorId Int
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

```javascript
// Create a post for an existing user
const post = await prisma.post.create({
  data: {
    title: "Hello World",
    body: "My first post",
    authorId: 1,
  },
});

// Get all posts by a user (nested read)
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    },
  },
});

// Get post count per user without fetching posts
const users = await prisma.user.findMany({
  include: {
    _count: { select: { posts: true } },
  },
});
// Result: [{ id: 1, name: 'Alice', _count: { posts: 3 } }, ...]
```

### Many-to-Many.

Prisma manages implicit many-to-many join tables automatically when both sides declare a list relation with the same string argument.

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[] @relation("PostTags")
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[] @relation("PostTags")
}
// Prisma creates a hidden _PostTags join table — you never write to it directly.
```

```javascript
// Create a post with existing tags
const post = await prisma.post.create({
  data: {
    title: "Learning Prisma",
    body: "...",
    authorId: 1,
    tags: {
      connect: [{ name: "prisma" }, { name: "orm" }],
      // connectOrCreate creates the tag if it doesn't exist
      connectOrCreate: [
        {
          where: { name: "database" },
          create: { name: "database" },
        },
      ],
    },
  },
  include: { tags: true },
});

// Filter posts by tag
const posts = await prisma.post.findMany({
  where: {
    tags: { some: { name: "prisma" } },
    // some → at least one tag matches
    // every → all tags match
    // none  → no tags match
  },
  include: { tags: true },
});
```

### Explicit Many-to-Many (with metadata on the join).

When the relationship itself has data (e.g. enrollment date, role in a team), use an explicit join model.

```prisma
model User {
  id          Int          @id @default(autoincrement())
  enrollments Enrollment[]
}

model Course {
  id          Int          @id @default(autoincrement())
  name        String
  enrollments Enrollment[]
}

model Enrollment {
  userId     Int
  courseId   Int
  enrolledAt DateTime @default(now())
  grade      Float?

  user   User   @relation(fields: [userId],   references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@id([userId, courseId])  // composite primary key
}
```

```javascript
// Enroll a user in a course
await prisma.enrollment.create({
  data: { userId: 1, courseId: 2 },
});

// Get all courses a user is enrolled in
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    enrollments: {
      include: { course: true },
      orderBy: { enrolledAt: "desc" },
    },
  },
});
```

---

## 6. Advanced Queries.

### Aggregations.

```javascript
// Count
const total = await prisma.user.count({
  where: { isActive: true },
});

// Aggregate — sum, avg, min, max, count
const stats = await prisma.order.aggregate({
  _sum: { total: true },
  _avg: { total: true },
  _min: { total: true },
  _max: { total: true },
  _count: { _all: true },
  where: { status: "DELIVERED" },
});
// Result: { _sum: { total: 45230.50 }, _avg: { total: 125.30 }, ... }

// GroupBy
const revenueByStatus = await prisma.order.groupBy({
  by: ["status"],
  _sum: { total: true },
  _count: { _all: true },
  orderBy: { _sum: { total: "desc" } },
});
// Result: [{ status: 'DELIVERED', _sum: { total: 45000 }, _count: { _all: 120 } }, ...]

// GroupBy with HAVING (filter after grouping)
const activeCategories = await prisma.product.groupBy({
  by: ["category"],
  _count: { _all: true },
  having: {
    _count: { _all: { gt: 5 } }, // only categories with more than 5 products
  },
});
```

### Nested Writes.

```javascript
// Create an order with line items in a single operation
const order = await prisma.order.create({
  data: {
    userId: 1,
    total: 1599.98,
    status: "PENDING",
    items: {
      create: [
        { productId: 1, quantity: 1, price: 999.99, name: "Laptop" },
        { productId: 2, quantity: 1, price: 599.99, name: "Phone" },
      ],
    },
  },
  include: { items: true },
});
```

### Fluent API (Chaining Relations).

```javascript
// Get all posts by the author of a specific comment
const posts = await prisma.comment
  .findUnique({ where: { id: commentId } })
  .author() // navigate to the author of the comment
  .posts(); // then get all their posts
```

### Filtering on Relations.

```javascript
// Find users who have at least one published post
const users = await prisma.user.findMany({
  where: {
    posts: { some: { published: true } },
  },
});

// Find users who have NO posts
const usersWithNoPosts = await prisma.user.findMany({
  where: {
    posts: { none: {} },
  },
});

// Find posts where ALL tags contain 'js'
const posts = await prisma.post.findMany({
  where: {
    tags: { every: { name: { contains: "js" } } },
  },
});
```

---

## 7. Performance Awareness.

### The N+1 Problem.

The most common ORM performance trap. It occurs when you fetch a list of records and then issue a separate query for each one to load related data.

```javascript
// ❌ N+1 — 1 query to get posts, then N queries (one per post) to get authors
const posts = await prisma.post.findMany(); // 1 query → 100 posts
for (const post of posts) {
  const author = await prisma.user.findUnique({ where: { id: post.authorId } });
  // ↑ 100 more queries — one per post. 101 queries total for 100 posts.
  console.log(post.title, author.name);
}

// ✅ Use include — Prisma fetches all authors in a single second query
const posts = await prisma.post.findMany({
  include: { author: { select: { name: true, email: true } } },
});
// 2 queries total regardless of how many posts there are.
```

### select vs include.

```javascript
// include: true → fetches ALL fields of the related model
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: { author: true }, // returns author with password, createdAt, updatedAt, etc.
});

// include + select → fetch the relation but only specific fields (better)
const post = await prisma.post.findUnique({
  where: { id: 1 },
  include: { author: { select: { name: true, email: true } } },
});

// select only at the top level — no include
// Use this when you need a lean response and don't need the full model
const post = await prisma.post.findUnique({
  where: { id: 1 },
  select: { id: true, title: true, author: { select: { name: true } } },
  // You can select into relations with select — no need for include
});
```

### Using `$transaction` for Atomicity.

```javascript
// Sequential transaction — operations share the same connection and commit together
// Use for operations that must all succeed or all fail (e.g. order placement)
const [order, updatedProduct] = await prisma.$transaction(async (tx) => {
  // tx is a transaction-scoped Prisma client — use it instead of prisma
  const product = await tx.product.findUnique({
    where: { id: productId },
  });

  if (product.stock < quantity) {
    throw new Error("Insufficient stock"); // throws ROLLBACK automatically
  }

  const order = await tx.order.create({
    data: { userId, total: product.price * quantity, status: "PENDING" },
  });

  const updatedProduct = await tx.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  return [order, updatedProduct];
});

// Batch transaction — run independent queries in parallel
const [userCount, postCount] = await prisma.$transaction([
  prisma.user.count(),
  prisma.post.count(),
]);
```

### Indexes in Prisma.

```prisma
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  authorId  Int
  createdAt DateTime @default(now())
  published Boolean  @default(false)

  // Single column index
  @@index([authorId])

  // Composite index — helps queries that filter by both authorId AND published
  @@index([authorId, published])

  // Composite index for sorting — helps ORDER BY createdAt DESC
  @@index([createdAt(sort: Desc)])
}
```

### Prisma Query Logging.

```javascript
const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "error" },
  ],
});

// Listen to query events — see exactly what SQL Prisma sends
prisma.$on("query", (e) => {
  console.log("Query:", e.query);
  console.log("Params:", e.params);
  console.log("Duration:", e.duration + "ms");
});
```

---

## Assignment.

1. **Blog API with Prisma and PostgreSQL.**

   **What you practice:**
   - `prisma init` and schema definition
   - `prisma migrate dev`
   - the Prisma client singleton
   - `findUnique`, `findMany`, `create`, `update`, `delete`
   - `select` to exclude the password field
   - `include` for relations
   - `_count` for post counts
   - handling `P2025` (not found) and `P2002` (unique constraint) errors gracefully.

   **Requirements:**
   - Define two models: `User` (id, email unique, name, password, createdAt) and `Post` (id, title, body, published Boolean default false, views Int default 0, authorId FK → User, createdAt, updatedAt).
   - Endpoints:
     - `POST /api/users` : create a user (hash password with bcrypt). Return user without password.
     - `GET /api/users` : return all users with their post count (`_count`). No passwords.
     - `GET /api/users/:id` : return one user with their published posts. 404 if not found.
     - `POST /api/posts` : create a post with `authorId`. Return post with author name.
     - `GET /api/posts` : return all published posts with author name and email. Support `?search=` (title contains) and `?page=&limit=` pagination.
     - `GET /api/posts/:id` : return post with author. Increment views by 1 atomically.
     - `PATCH /api/posts/:id/publish` : toggle `published` field.
     - `DELETE /api/posts/:id` : delete post. 404 if not found.

   [Solution](./Assignment/code1/)

   **POSTMAN Test Cases.**

   ```
   # 1. Create a user — success
   POST http://localhost:3000/api/users
   Body: { "email": "carol@example.com", "name": "Carol", "password": "secure123" }
   → 201  { id: 3, email: "carol@example.com", name: "Carol", createdAt: "..." }
       (no password field in response)

   # 2. Duplicate email
   POST http://localhost:3000/api/users
   Body: { "email": "carol@example.com", "name": "Carol2", "password": "abc" }
   → 409  { message: "Email already in use" }

   # 3. Get all users with post counts
   GET http://localhost:3000/api/users
   → 200  [ { id: 1, name: "Alice", _count: { posts: 2 } }, ... ]

   # 4. Get one user with their published posts
   GET http://localhost:3000/api/users/1
   → 200  { id: 1, name: "Alice", posts: [ { id: 1, title: "...", views: 0 }, ... ] }

   # 5. Get user — not found
   GET http://localhost:3000/api/users/9999
   → 404  { message: "User not found" }

   # 6. Create a post
   POST http://localhost:3000/api/posts
   Body: { "title": "My first post", "body": "Hello world", "authorId": 1 }
   → 201  { id: 4, title: "My first post", published: false, author: { name: "Alice", email: "..." } }

   # 7. Create post — author not found
   POST http://localhost:3000/api/posts
   Body: { "title": "Ghost", "body": "...", "authorId": 9999 }
   → 404  { message: "Author not found" }

   # 8. Get published posts — paginated
   GET http://localhost:3000/api/posts?page=1&limit=5
   → 200  { data: [...], page: 1, limit: 5, total: 2, totalPages: 1 }

   # 9. Get posts — search filter
   GET http://localhost:3000/api/posts?search=prisma
   → 200  { data: [ posts with 'prisma' in title ], ... }

   # 10. Get one post — views increment
   GET http://localhost:3000/api/posts/1
   → 200  { ..., views: 1, author: { name, email } }
   GET http://localhost:3000/api/posts/1
   → 200  { ..., views: 2 }

   # 11. Toggle publish
   PATCH http://localhost:3000/api/posts/3/publish
   → 200  { id: 3, published: true, ... }
   PATCH http://localhost:3000/api/posts/3/publish
   → 200  { id: 3, published: false, ... }

   # 12. Delete post
   DELETE http://localhost:3000/api/posts/4
   → 200  { message: "Post deleted" }

   # 13. Delete again — already gone
   DELETE http://localhost:3000/api/posts/4
   → 404  { message: "Post not found" }
   ```

2. **E-Commerce API with Relations, Transactions and GroupBy.**

   **What you practice:**
   - Multi-model Prisma schema with one-to-many and many-to-many
   - nested creates and connects
   - `$transaction` for atomic order placement with stock decrement
   - `aggregate` and `groupBy` for dashboard stats
   - Prisma error codes P2002, P2003, P2025 · `connectOrCreate` for tags
   - `_count` on relations.

   **Requirements:**
   - Models: `User`, `Product` (name, price Decimal, stock Int, category String), `Order` (status enum: PENDING/SHIPPED/DELIVERED/CANCELLED, total Decimal, userId), `OrderItem` (orderId, productId, quantity, price Decimal — composite PK), `Tag` (name unique), and a many-to-many between Product and Tag.
   - Endpoints:
     - `POST /api/products` — create a product with optional tags (use `connectOrCreate`).
     - `GET /api/products` — all products with tags and order count. Support `?category=` filter.
     - `POST /api/orders` — place an order. Use `$transaction` to check and decrement stock for each item. Snapshot `name` and `price` into each `OrderItem`. Return 400 with the product name if stock is insufficient.
     - `PUT /api/orders/:id/status` — update order status.
     - `GET /api/dashboard/stats` — return: total revenue from DELIVERED orders (`aggregate _sum`), order count per status (`groupBy status`), top 3 products by quantity sold (`groupBy productId` on OrderItem).

   [Solution](./Assignment/code2/)

   **POSTMAN Test Cases.**

   ```
   # 1. Create a product with tags
   POST http://localhost:3000/api/products
   Body: { "name": "Keyboard", "price": 79.99, "stock": 30, "category": "electronics", "tags": ["tech", "peripherals"] }
   → 201  { id: 5, name: "Keyboard", price: "79.99", stock: 30, tags: [{ name: "tech" }, { name: "peripherals" }] }

   # 2. Get all products
   GET http://localhost:3000/api/products
   → 200  [ { id, name, price, stock, tags, _count: { orderItems: 0 } }, ... ]

   # 3. Get products filtered by category
   GET http://localhost:3000/api/products?category=electronics
   → 200  [ only electronics products ]

   # 4. Place a valid order (use product ids from seed)
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 1, "quantity": 2 }, { "productId": 3, "quantity": 1 }] }
   → 201  { id: 1, userId: 1, total: "2029.97", status: "PENDING", items: [ { name, price, quantity }, ... ] }
         (Verify: Laptop stock went from 10 → 8, T-Shirt from 100 → 99)

   # 5. Insufficient stock
   POST http://localhost:3000/api/orders
   Body: { "userId": 1, "items": [{ "productId": 1, "quantity": 9999 }] }
   → 400  { message: "Insufficient stock for Laptop. Available: 8" }

   # 6. Update order status
   PUT http://localhost:3000/api/orders/1/status
   Body: { "status": "DELIVERED" }
   → 200  { id: 1, status: "DELIVERED", ... }

   # 7. Invalid status
   PUT http://localhost:3000/api/orders/1/status
   Body: { "status": "FLYING" }
   → 400  { message: "status must be one of: PENDING, SHIPPED, DELIVERED, CANCELLED" }

   # 8. Dashboard stats (after placing and delivering a few orders)
   GET http://localhost:3000/api/dashboard/stats
   → 200  {
       totalRevenue: "2029.97",
       ordersByStatus: [ { status: "DELIVERED", count: 1 } ],
       topProducts: [ { productId: 1, name: "Laptop", totalSold: 2 }, ... ]
     }
   ```

3. **Full API in Drizzle ORM, Soft Deletes and Advanced Aggregations.**

   **What you practice:**
   - Drizzle schema definition in TypeScript
   - Drizzle migrations with `drizzle-kit`
   - Drizzle's query builder API vs Prisma's model API
   - soft deletes with a `deletedAt` filter on every query
   - `$with` (CTEs) for readable complex queries
   - Drizzle's `sql` template tag for raw expressions
   - combining Drizzle for writes with raw SQL for complex reads
   - role-based middleware.

   **Requirements:**
   - Use **Drizzle ORM** (not Prisma) for this assignment. This exposes you to how different ORMs approach the same problems.
   - Models: `users` (id, email, name, passwordHash, role enum USER/ADMIN, deletedAt nullable), `posts` (id, title, body, status enum DRAFT/PUBLISHED/ARCHIVED, authorId, deletedAt nullable, createdAt, updatedAt), `comments` (id, postId, userId, body, deletedAt nullable, createdAt).
   - Soft delete throughout: never use `DELETE FROM`. Instead set `deletedAt = NOW()`. Filter `WHERE deletedAt IS NULL` on every query.
   - Endpoints:
     - `POST /api/users` — register. Role always defaults to USER (ignore any role in body).
     - `GET /api/users` — all non-deleted users. Admin only (check role from req header `x-role` for simplicity — no JWT needed for this assignment).
     - `POST /api/posts` — create post as DRAFT.
     - `GET /api/posts` — all PUBLISHED non-deleted posts with author name, comment count. Support `?authorId=` filter and pagination.
     - `PATCH /api/posts/:id/status` — change post status (DRAFT → PUBLISHED → ARCHIVED). Validate transitions: can only publish a DRAFT, can only archive a PUBLISHED post.
     - `POST /api/posts/:id/comments` — add a comment. Verify post is PUBLISHED and not deleted.
     - `DELETE /api/users/:id` — soft delete (set deletedAt). Also soft delete all their posts and comments.
     - `GET /api/stats` — using Drizzle `sql` template: posts count per status, users registered per month this year, average comments per post (only published, non-deleted posts).

   [Solution](./Assignment/code3/)

   **POSTMAN Test Cases.**

   ```
   # ── Users ──────────────────────────────────────────────────────────────────────

   # 1. Register Alice
   POST http://localhost:3000/api/users
   Body: { "email": "alice@example.com", "name": "Alice", "password": "secret123" }
   → 201  { id: 1, email: "alice@example.com", name: "Alice", role: "USER", createdAt: "..." }
         (no passwordHash in response)

   # 2. Register Bob
   POST http://localhost:3000/api/users
   Body: { "email": "bob@example.com", "name": "Bob", "password": "secret123" }
   → 201  { id: 2, email: "bob@example.com", name: "Bob", role: "USER", ... }

   # 3. Role is always USER — even if body says ADMIN
   POST http://localhost:3000/api/users
   Body: { "email": "evil@example.com", "name": "Evil", "password": "pw", "role": "ADMIN" }
   → 201  { role: "USER" }   ← role from body is ignored, model hardcodes USER

   # 4. Duplicate email
   POST http://localhost:3000/api/users
   Body: { "email": "alice@example.com", "name": "Alice2", "password": "pw" }
   → 409  { message: "Email already in use" }

   # 5. Get all users — admin header required
   GET http://localhost:3000/api/users
   Headers: { "x-role": "ADMIN" }
   → 200  [ { id: 1, name: "Alice", role: "USER" }, { id: 2, name: "Bob" }, { id: 3, name: "Evil" } ]

   # 6. Get all users — no admin header
   GET http://localhost:3000/api/users
   → 403  { message: "Admin access required" }

   # ── Posts ──────────────────────────────────────────────────────────────────────

   # 7. Create a post (always DRAFT)
   POST http://localhost:3000/api/posts
   Body: { "title": "Hello World", "body": "My first post", "authorId": 1 }
   → 201  { id: 1, title: "Hello World", status: "DRAFT", authorId: 1, ... }

   # 8. Create another post for Bob
   POST http://localhost:3000/api/posts
   Body: { "title": "Bob's Post", "body": "Bob writes here", "authorId": 2 }
   → 201  { id: 2, status: "DRAFT", authorId: 2, ... }

   # 9. Create post — author does not exist
   POST http://localhost:3000/api/posts
   Body: { "title": "Ghost", "body": "...", "authorId": 9999 }
   → 404  { message: "Author not found" }

   # 10. Get published posts — empty (both posts are DRAFT)
   GET http://localhost:3000/api/posts
   → 200  []

   # 11. Publish Alice's post (DRAFT → PUBLISHED)
   PATCH http://localhost:3000/api/posts/1/status
   Body: { "status": "PUBLISHED" }
   → 200  { id: 1, status: "PUBLISHED", updatedAt: "..." }

   # 12. Invalid transition — DRAFT cannot go straight to ARCHIVED
   PATCH http://localhost:3000/api/posts/2/status
   Body: { "status": "ARCHIVED" }
   → 400  { message: "Cannot transition from DRAFT to ARCHIVED. Expected: PUBLISHED" }

   # 13. Invalid transition — PUBLISHED cannot go back to DRAFT
   PATCH http://localhost:3000/api/posts/1/status
   Body: { "status": "DRAFT" }
   → 400  { message: "status must be one of: PUBLISHED, ARCHIVED" }

   # 14. Get published posts — Alice's post now appears
   GET http://localhost:3000/api/posts
   → 200  [{ id: 1, title: "Hello World", authorName: "Alice", authorEmail: "...", commentCount: 0 }]

   # 15. Filter by authorId
   GET http://localhost:3000/api/posts?authorId=2
   → 200  []   (Bob's post is still DRAFT)

   # 16. Add a comment to the published post
   POST http://localhost:3000/api/posts/1/comments
   Body: { "userId": 2, "body": "Great post Alice!" }
   → 201  { id: 1, postId: 1, userId: 2, body: "Great post!", createdAt: "..." }

   # 17. Add another comment
   POST http://localhost:3000/api/posts/1/comments
   Body: { "userId": 1, "body": "Thanks Bob!" }
   → 201  { id: 2, postId: 1, userId: 1, ... }

   # 18. Verify comment count updated
   GET http://localhost:3000/api/posts
   → 200  [{ ..., commentCount: 2 }]

   # 19. Comment on a DRAFT post — rejected
   POST http://localhost:3000/api/posts/2/comments
   Body: { "userId": 1, "body": "sneaky comment" }
   → 400  { message: "Can only comment on published posts" }

   # 20. Archive a published post (PUBLISHED → ARCHIVED)
   PATCH http://localhost:3000/api/posts/1/status
   Body: { "status": "ARCHIVED" }
   → 200  { id: 1, status: "ARCHIVED", ... }

   # 21. Archived post no longer appears in GET /api/posts
   GET http://localhost:3000/api/posts
   → 200  []   (archived posts are excluded — only PUBLISHED appear)

   # ── Soft Delete ────────────────────────────────────────────────────────────────

   # 22. Publish Bob's post first so there's something to soft-delete
   PATCH http://localhost:3000/api/posts/2/status
   Body: { "status": "PUBLISHED" }
   → 200  { status: "PUBLISHED" }

   # 23. Verify Bob's post appears
   GET http://localhost:3000/api/posts
   → 200  [{ id: 2, title: "Bob's Post", authorName: "Bob", commentCount: 0 }]

   # 24. Soft delete Bob (cascades to his posts and comments)
   DELETE http://localhost:3000/api/users/2
   Headers: { "x-role": "ADMIN" }
   → 200  { message: "User and all related content soft deleted" }

   # 25. Bob's post no longer appears (inner join filters out soft-deleted authors)
   GET http://localhost:3000/api/posts
   → 200  []

   # 26. Bob no longer appears in user list
   GET http://localhost:3000/api/users
   Headers: { "x-role": "ADMIN" }
   → 200  [ { id: 1, name: "Alice" }, { id: 3, name: "Evil" } ]
           (Bob is gone — deletedAt is set, physically still in DB)

   # ── Stats ──────────────────────────────────────────────────────────────────────

   # 27. Stats endpoint
   GET http://localhost:3000/api/stats
   → 200  {
       postsByStatus: [
         { status: "DRAFT",     count: 0 },
         { status: "PUBLISHED", count: 0 },
         { status: "ARCHIVED",  count: 1 }
       ],
       usersByMonth: [
         { month: 6, count: 3 }
       ],
       avgCommentsPerPost: "0.00"
       (no published non-deleted posts at this point — Alice's is archived, Bob's author is deleted)
     }
   ```
