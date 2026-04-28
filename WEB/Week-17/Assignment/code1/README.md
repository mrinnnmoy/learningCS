# How to Build.

```
Step 1 — Initialise the project
  mkdir code1 && cd code1
  npm init -y
  npm install express zod dotenv
  npm install --save-dev typescript tsx nodemon @types/express @types/node
  npx tsc --init

Step 2 — Configure tsconfig.json
  Set target: ES2022, module: commonjs, outDir: ./dist, rootDir: ./src,
  strict: true, esModuleInterop: true, skipLibCheck: true, sourceMap: true.

Step 3 — Create src/types/index.ts
  Define Book interface. CreateBookDto = Omit<Book, 'id' | 'createdAt'>.
  UpdateBookDto = Partial<CreateBookDto>. BookQuery with optional genre and author.
  IdParam with id string for route params.

Step 4 — Create src/errors/AppError.ts
  AppError class (extends Error) with statusCode and isOperational.
  NotFoundError, ValidationError as subclasses.

Step 5 — Create src/data/store.ts
  Typed in-memory array with initial data.
  Export getAll(filters), getById(id), create(data), update(id, data), remove(id).

Step 6 — Create src/middleware/validate.ts
  Generic validate<T>(schema: ZodSchema<T>) middleware factory.

Step 7 — Create src/routes/books.ts
  Define CreateBookSchema with zod. Type request generics on every handler.
  Throw NotFoundError when book not found.

Step 8 — Create src/server.ts
  Mount routes. Typed error handler checks instanceof AppError.
  Start on PORT from process.env.PORT or 3000.
```