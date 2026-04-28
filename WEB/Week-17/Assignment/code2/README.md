# How to Build.

```
Step 1 — Initialise
  mkdir code2 && cd code2
  npm init -y
  npm install express prisma @prisma/client bcrypt jsonwebtoken zod dotenv
  npm install --save-dev typescript tsx nodemon @types/express @types/node @types/bcrypt @types/jsonwebtoken
  npx tsc --init
  npx prisma init

Step 2 — Write prisma/schema.prisma
  enum Role { USER ADMIN }
  model User — all fields with @@map("users")
  model Post — authorId FK → User, views Int default 0, @@map("posts")

Step 3 — Run migration
  npx prisma migrate dev --name init

Step 4 — Create src/types/index.ts
  JwtPayload interface. PostQuery interface. Extend Express namespace with user?: JwtPayload.

Step 5 — Create src/errors/AppError.ts
  AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError.

Step 6 — Create src/lib/prisma.ts — singleton PrismaClient using globalThis.

Step 7 — Create src/middleware/authenticate.ts
  Read Bearer token, jwt.verify with algorithms: ['HS256'], set req.user.

Step 8 — Create src/middleware/validate.ts — generic Zod validator.

Step 9 — Create src/routes/auth.ts
  RegisterSchema and LoginSchema. Return user without password using select.
  Handle P2002 → 409.

Step 10 — Create src/routes/posts.ts
  PostSchema. Ownership check before publish/delete (req.user!.userId === post.authorId).
  Throw ForbiddenError if not owner.

Step 11 — Create src/server.ts — mount routes, typed error handler, JWT_SECRET startup check.
```