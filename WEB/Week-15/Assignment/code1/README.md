# How to Build.

```
Step 1 — Initialise the project
  mkdir code1 && cd code1
  npm init -y
  npm install express prisma @prisma/client bcrypt dotenv
  npm install --save-dev nodemon
  npx prisma init
  (Creates prisma/schema.prisma and .env with DATABASE_URL placeholder)

Step 2 — Set DATABASE_URL in .env
  DATABASE_URL="postgresql://username:password@localhost:5432/week15_easy"

Step 3 — Write prisma/schema.prisma
  Define the generator block, datasource block, User model, and Post model.
  Add @@map("users") and @@map("posts") for clean table names.
  Add @@index([authorId]) to Post.

Step 4 — Run the first migration
  npx prisma migrate dev --name init
  (Creates the tables in your DB and generates the Prisma client)

Step 5 — Write prisma/seed.js
  Create 2 users and 3 posts using prisma.user.upsert and prisma.post.create.
  Add "prisma": { "seed": "node prisma/seed.js" } to package.json.
  Run: npx prisma db seed

Step 6 — Create lib/prisma.js
  Export the PrismaClient singleton using the globalThis pattern.

Step 7 — Create models/user.js
  createUser({ email, name, password })     → prisma.user.create with bcrypt hash
  getAllUsers()                              → findMany with _count: { select: { posts: true } }
  getUserById(id)                           → findUnique with include: { posts: { where: { published: true } } }

Step 8 — Create models/post.js
  createPost({ title, body, authorId })     → prisma.post.create with include: { author: { select: ... } }
  getPosts({ search, page, limit })         → findMany with where: { published, title: { contains } }, take, skip
  getPostById(id)                           → findUnique + update views via $transaction
  togglePublish(id)                         → findUnique then update published: !post.published
  deletePost(id)                            → prisma.post.delete

Step 9 — Create routes/users.js and routes/posts.js
  Handle Prisma errors: P2025 → 404, P2002 → 409.
  Never return the password field in any response.

Step 10 — Create server.js
  Mount routes, add global error handler, listen on PORT.
```