# How to Build.

```
Step 1 — Initialise
  mkdir code3 && cd code3
  npm init -y
  npm install express drizzle-orm postgres dotenv
  npm install --save-dev drizzle-kit tsx @types/express nodemon
  (We use .ts files — tsx runs TypeScript without a build step in development)

Step 2 — Write drizzle/schema.ts
  Define roleEnum, postStatusEnum, users table, posts table, comments table.
  Export usersRelations, postsRelations, commentsRelations.

Step 3 — Write drizzle.config.ts
  Point to schema: './drizzle/schema.ts', out: './drizzle/migrations', dialect: 'postgresql'.

Step 4 — Generate and apply migration
  npx drizzle-kit generate
  npx drizzle-kit migrate

Step 5 — Write lib/db.ts
  Create postgres() connection and drizzle(connection, { schema }) instance. Export db.

Step 6 — Write middleware/adminOnly.ts
  Check req.headers['x-role'] === 'ADMIN'. Return 403 if not.

Step 7 — Write models/user.ts
  createUser — insert, return without passwordHash
  getAllUsers — select where deletedAt IS NULL
  softDeleteUser — update deletedAt = new Date() on user, all their posts, all their comments

Step 8 — Write models/post.ts
  createPost — insert as DRAFT
  getPosts — select with left join users for author name,
             subquery for comment count, where published and deletedAt IS NULL
  changeStatus — validate transition, update status
  getPublishedPostById — for comment creation validation

Step 9 — Write models/comment.ts
  createComment — insert after verifying post is PUBLISHED

Step 10 — Write models/stats.ts
  Three queries using db.execute(sql`...`) for complex aggregations.

Step 11 — Wire routes and server.ts
```