# List of things learned.

## 1. What is tRPC and Why Use It.

**tRPC** stands for TypeScript Remote Procedure Call.

It is a library that lets you build fully type-safe APIs without writing any schemas, code generators, or REST/GraphQL boilerplate.

Instead of defining a REST endpoint and then separately writing types for its request and response.

tRPC shares types directly between your server and your client. Both in the same TypeScript project (or monorepo).

```
Traditional REST API with TypeScript

  Server                          Client
  ──────────────────────────      ──────────────────────────────────
  POST /api/users                 fetch('/api/users', { method: 'POST', body: ... })
  → you define the handler        → you manually type the response
  → you write a Zod schema        → if the server shape changes, you find out at runtime
  → you write response types      → you write the same types twice
  → types do not cross the wire   → types drift from the actual implementation

tRPC

  Server                          Client
  ──────────────────────────      ──────────────────────────────────
  const userRouter = router({     const user = await trpc.user.create.mutate(...)
    create: procedure               ↑ TypeScript KNOWS the input and output types
      .input(CreateUserSchema)      ↑ Autocomplete works on the client
      .mutation(({ input }) => ...) ↑ If the server shape changes, TypeScript errors
  })                                  immediately on the client — not at runtime
```

### The Core Promise.

```
One source of truth for your types.
Your server procedure defines the input and output types once.
Your client automatically knows those types — no code generation step.
If you change a procedure's output shape, every client call site that
reads that output immediately shows a TypeScript error.
```

### When to Use tRPC.

```
✅ Full-stack TypeScript apps where the frontend and backend are in the same repo
   (Next.js monorepo, T3 Stack, Turborepo monorepo).
✅ Internal tools and dashboards where REST overhead is not worth it.
✅ Teams that want end-to-end type safety without the complexity of GraphQL.
✅ Projects that use React Query on the frontend (tRPC integrates with it directly).

❌ Public APIs consumed by non-TypeScript clients — use REST or GraphQL instead.
❌ Microservices written in different languages — tRPC is TypeScript-only.
❌ When you need fine-grained HTTP semantics (custom status codes, caching headers).
```

### tRPC vs REST vs GraphQL.

```
                REST          GraphQL           tRPC
──────────────────────────────────────────────────────────────────────
Type safety     Manual        Schema + codegen  Automatic (TypeScript)
Schema          You write     You write SDL     Inferred from code
Client types    Manual/OpenAPI Codegen required Zero config
Learning curve  Low           High              Medium
Best for        Public APIs   Complex queries   Full-stack TS monorepos
HTTP semantics  Full          Limited           Abstracted away
```

---

## 2. Setting Up tRPC.

### Installation.

```bash
# Core tRPC packages
npm install @trpc/server @trpc/client @trpc/react-query @tanstack/react-query

# Zod for input validation (highly recommended)
npm install zod

# For Next.js integration
npm install @trpc/next
```

### The tRPC Initialization File.

Every tRPC project starts with a single initialization call that creates the typed building blocks you export and reuse everywhere.

```typescript
// src/server/trpc.ts
import { initTRPC } from "@trpc/server";

// Context type — populated for every request (covered in section 5)
interface Context {
  userId?: string;
  role?: "user" | "admin";
}

// Initialize tRPC — this is where all the magic comes from
const t = initTRPC.context<Context>().create();

// Export the pieces you'll use across your app
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

// These are the three things you export and import everywhere:
// router    — creates a router with multiple procedures
// procedure — creates a single procedure (query or mutation)
// middleware — wraps procedures with shared logic (auth, logging, etc.)
```

### Creating a Basic Router.

```typescript
// src/server/routers/user.ts
import { z } from "zod";
import { router, procedure } from "../trpc";

export const userRouter = router({
  // A query — fetches data, does not modify anything
  // Equivalent to a GET endpoint in REST
  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // input is { id: string } — fully typed
      const user = await db.user.findUnique({ where: { id: input.id } });
      return user;
      // The return type is automatically inferred by TypeScript
    }),

  // A mutation — modifies data
  // Equivalent to POST/PUT/DELETE in REST
  create: procedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await db.user.create({ data: input });
      return user;
    }),

  // A query with no input
  getAll: procedure.query(async () => {
    return db.user.findMany();
  }),
});
```

### Merging Routers.

```typescript
// src/server/routers/_app.ts
import { router } from "../trpc";
import { userRouter } from "./user";
import { productRouter } from "./product";
import { orderRouter } from "./order";

// The appRouter merges all sub-routers
// This is what you export as your API surface
export const appRouter = router({
  user: userRouter,
  product: productRouter,
  order: orderRouter,
});

// Export the type of your router — this is what crosses to the client
// The AppRouter type is only a TypeScript type — it is never sent over the wire
export type AppRouter = typeof appRouter;
```

### The TypeScript Type That Crosses the Wire.

```typescript
// This is the key insight of tRPC:
// The 'AppRouter' TYPE is imported on the client, not the implementation.
// TypeScript uses it to infer what procedures exist and what their inputs/outputs are.
// At runtime, the client makes HTTP requests — no code is shared, only types.

// server/routers/_app.ts
export type AppRouter = typeof appRouter; // exported TYPE only

// client/trpc.ts
import type { AppRouter } from "../server/routers/_app"; // imported as TYPE only
```

---

## 3. Procedures (Queries and Mutations).

A **procedure** is a single callable function on the server.

There are two kinds:

- **queries** (read data, safe to call multiple times) and
- **mutations** (change data, has side effects).

### Queries.

```typescript
import { z } from "zod";
import { router, procedure } from "../trpc";

export const productRouter = router({
  // Query with no input — returns all products
  getAll: procedure.query(async () => {
    return db.product.findMany({ orderBy: { createdAt: "desc" } });
  }),

  // Query with input — returns one product by id
  getById: procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const product = await db.product.findUnique({ where: { id: input.id } });
      if (!product) {
        // tRPC has a typed error class
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      return product;
    }),

  // Query with multiple inputs — filtered list
  list: procedure
    .input(
      z.object({
        category: z.string().optional(),
        page: z.number().int().default(1),
        limit: z.number().int().default(10),
      }),
    )
    .query(async ({ input }) => {
      const { category, page, limit } = input;
      const [products, total] = await Promise.all([
        db.product.findMany({
          where: category ? { category } : undefined,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        db.product.count({ where: category ? { category } : undefined }),
      ]);
      return { products, total, page, totalPages: Math.ceil(total / limit) };
    }),
});
```

### Mutations.

```typescript
export const productRouter = router({
  // ...queries above...

  create: procedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        price: z.number().positive(),
        description: z.string().optional(),
        category: z.string().min(1),
        stock: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      return db.product.create({ data: input });
    }),

  update: procedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().optional(),
        price: z.number().positive().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const product = await db.product.findUnique({ where: { id } });
      if (!product)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      return db.product.update({ where: { id }, data });
    }),

  delete: procedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await db.product.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
```

### TRPCError (Typed Errors).

```typescript
import { TRPCError } from "@trpc/server";

// tRPC maps error codes to HTTP status codes automatically
throw new TRPCError({ code: "NOT_FOUND", message: "User not found" }); // 404
throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in" }); // 401
throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" }); // 403
throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input" }); // 400
throw new TRPCError({ code: "CONFLICT", message: "Email already exists" }); // 409
throw new TRPCError({
  code: "INTERNAL_SERVER_ERROR",
  message: "Something broke",
}); // 500
throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Slow down" }); // 429
throw new TRPCError({ code: "TIMEOUT", message: "Request timed out" }); // 408

// You can also attach extra data to an error
throw new TRPCError({
  code: "BAD_REQUEST",
  message: "Validation failed",
  cause: zodError, // the underlying error — shown in development
});
```

---

## 4. Input Validation with Zod.

tRPC and Zod are designed to work together.

The `.input()` method accepts any Zod schema and tRPC automatically validates every incoming request against it.

If validation fails, tRPC returns a `BAD_REQUEST` error before your handler function even runs.

### Basic Validation.

```typescript
import { z } from "zod";

procedure
  .input(
    z.object({
      // Primitives
      id: z.string().uuid(),
      name: z.string().min(2).max(100),
      email: z.string().email(),
      age: z.number().int().min(0).max(150),
      active: z.boolean(),

      // Optional and default
      bio: z.string().optional(), // may be undefined
      role: z.enum(["user", "admin"]).default("user"),

      // Nested objects
      address: z.object({
        street: z.string(),
        city: z.string(),
        country: z.string().length(2), // ISO country code
      }),

      // Arrays
      tags: z.array(z.string()).min(1).max(10),
    }),
  )
  .mutation(({ input }) => {
    // input is fully typed — all fields have been validated
    // input.id is string (UUID)
    // input.role is 'user' | 'admin'
    // input.bio is string | undefined
  });
```

### Reusing Schemas.

```typescript
// src/schemas/user.ts
// Define schemas once, reuse them in procedures AND on the client for form validation
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const UpdateUserSchema = CreateUserSchema.partial() // make all fields optional
  .extend({ id: z.string() }); // add the id field

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// In your router
import { CreateUserSchema, UpdateUserSchema } from "../../schemas/user";

export const userRouter = router({
  create: procedure.input(CreateUserSchema).mutation(({ input }) => {
    /* ... */
  }),
  update: procedure.input(UpdateUserSchema).mutation(({ input }) => {
    /* ... */
  }),
});
```

### Output Validation.

```typescript
// You can also validate the OUTPUT of a procedure.
// This is optional but useful for ensuring shape consistency.
procedure
  .input(z.object({ id: z.string() }))
  .output(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      // If your handler returns a field not listed here, it will be stripped
      // If it returns the wrong type, TypeScript will catch it at compile time
    }),
  )
  .query(async ({ input }) => {
    return db.user.findUnique({ where: { id: input.id } });
  });
```

---

## 5. Context and Middleware.

### Context.

The context is a per-request object that gets passed to every procedure handler.

It is the standard place to put the authenticated user, the database client and any other request-level data.

```typescript
// src/server/context.ts
import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// This function runs for EVERY request and builds the context
export async function createContext({ req, res }: CreateNextContextOptions) {
  const session = await getServerSession(req, res, authOptions);

  return {
    prisma, // DB client available in every procedure
    session, // null if not logged in
    userId: session?.user?.id, // convenient shorthand
  };
}

// Infer the context type automatically — no need to write it manually
export type Context = inferAsyncReturnType<typeof createContext>;

// Update trpc.ts to use this context type
// src/server/trpc.ts
import { Context } from "./context";
const t = initTRPC.context<Context>().create();
```

### Middleware.

Middleware wraps procedure execution and can modify the context, reject the request or add logging.

You define middleware with `t.middleware()` and apply it with `.use()`.

```typescript
// src/server/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure; // public, no auth required

// ─── Auth Middleware ────────────────────────────────────────────────────────

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  // next() passes control to the actual procedure handler
  // The returned context enriches ctx for downstream procedures
  return next({
    ctx: {
      ...ctx,
      // TypeScript now knows userId is definitely a string (not undefined)
      userId: ctx.userId,
    },
  });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

// ─── Logging Middleware ─────────────────────────────────────────────────────

const logDuration = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const ms = Date.now() - start;
  console.log(`[${type}] ${path} — ${ms}ms`);
  return result;
});

// ─── Export protected procedure builders ────────────────────────────────────

// A procedure that requires authentication
export const protectedProcedure = t.procedure
  .use(logDuration)
  .use(isAuthenticated);

// A procedure that requires admin role
export const adminProcedure = t.procedure.use(logDuration).use(isAdmin);
```

```typescript
// Using protected procedures in routers
import { procedure, protectedProcedure, adminProcedure } from "../trpc";

export const userRouter = router({
  // Anyone can call this
  getAll: procedure.query(() => db.user.findMany()),

  // Only authenticated users can call this
  me: protectedProcedure.query(({ ctx }) => {
    // ctx.userId is guaranteed to be a string here — middleware enforced it
    return db.user.findUnique({ where: { id: ctx.userId } });
  }),

  // Only admins can call this
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => db.user.delete({ where: { id: input.id } })),
});
```

---

## 6. tRPC with Next.js (App Router).

### Setting Up the API Route Handler.

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req } as any),
    onError: ({ error, path }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC Error] on ${path}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
```

### Setting Up the Client.

```typescript
// src/lib/trpc/client.ts
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

// Create a typed tRPC React client
// This gives you trpc.user.getAll.useQuery(), trpc.user.create.useMutation(), etc.
export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// src/lib/trpc/provider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink }                    from '@trpc/client';
import { useState }                         from 'react';
import { trpc }                             from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000 }, // 1 minute
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          // Batches multiple requests into one HTTP call automatically
          url: '/api/trpc',
          // Optional: add auth headers to every request
          async headers() {
            return {
              // authorization: `Bearer ${getToken()}`,
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryContext={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

```tsx
// src/app/layout.tsx — wrap the app in the provider
import { TRPCProvider } from "@/lib/trpc/provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
```

---

## 7. Calling Procedures from the Client.

### useQuery (Fetching Data).

```tsx
'use client';
import { trpc } from '@/lib/trpc/client';

function ProductList() {
  // Exactly like React Query's useQuery, but fully typed
  const { data, isLoading, error } = trpc.product.getAll.useQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error)     return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.map(product => (
        // TypeScript knows the exact shape of each product
        <li key={product.id}>{product.name} — ${product.price}</li>
      ))}
    </ul>
  );
}

// With input — fetches one product
function ProductDetail({ id }: { id: number }) {
  const { data: product } = trpc.product.getById.useQuery({ id });
  // TypeScript knows 'id' must be a number (from your Zod schema)

  return <h1>{product?.name}</h1>;
}

// With parameters — filtered list
function FilteredProducts({ category }: { category: string }) {
  const { data } = trpc.product.list.useQuery({
    category,
    page:  1,
    limit: 10,
  });

  return (/* render */);
}
```

### useMutation (Modifying Data).

```tsx
"use client";
import { trpc } from "@/lib/trpc/client";

function CreateProductForm() {
  const utils = trpc.useUtils(); // access to query utilities (for invalidation)

  const createProduct = trpc.product.create.useMutation({
    onSuccess: () => {
      // Invalidate the 'getAll' query so it refetches with the new product
      utils.product.getAll.invalidate();
      alert("Product created!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    createProduct.mutate({
      name: data.get("name") as string,
      price: parseFloat(data.get("price") as string),
      category: data.get("category") as string,
      stock: parseInt(data.get("stock") as string, 10),
    });
    // TypeScript will error if you pass the wrong shape here
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" required />
      <input name="price" type="number" required />
      <input name="category" type="text" required />
      <input name="stock" type="number" required />
      <button type="submit" disabled={createProduct.isPending}>
        {createProduct.isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

### Optimistic Updates.

```tsx
"use client";
import { trpc } from "@/lib/trpc/client";

function DeleteProductButton({ id }: { id: number }) {
  const utils = trpc.useUtils();

  const deleteProduct = trpc.product.delete.useMutation({
    // Optimistically remove the product from the list before the server responds
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await utils.product.getAll.cancel();

      // Snapshot the previous value (to restore on error)
      const previousProducts = utils.product.getAll.getData();

      // Optimistically update the list
      utils.product.getAll.setData(
        undefined,
        (old) => old?.filter((p) => p.id !== id) ?? [],
      );

      return { previousProducts };
    },

    // If the mutation fails, roll back to the snapshot
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        utils.product.getAll.setData(undefined, context.previousProducts);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      utils.product.getAll.invalidate();
    },
  });

  return (
    <button onClick={() => deleteProduct.mutate({ id })}>
      {deleteProduct.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
```

### Calling tRPC from Server Components.

```tsx
// In Next.js App Router, you can also call tRPC directly from Server Components
// without going through HTTP — this gives you type safety AND no network overhead.

// src/lib/trpc/server.ts
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "@/server/routers/_app";
import { prisma } from "@/lib/prisma";

const createCaller = createCallerFactory(appRouter);

export const serverTrpc = createCaller({
  prisma,
  session: null, // provide session here if needed
  userId: undefined,
});

// src/app/products/page.tsx — Server Component
import { serverTrpc } from "@/lib/trpc/server";

export default async function ProductsPage() {
  // Direct call — no HTTP request, no serialization overhead
  const products = await serverTrpc.product.getAll();

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

---

## 8. Subscriptions.

tRPC supports real-time subscriptions using Server-Sent Events (SSE) or WebSockets.

Subscriptions let the server push updates to the client without the client needing to poll.

### Setting Up SSE Subscriptions.

```typescript
// src/server/routers/notification.ts
import { observable } from "@trpc/server/observable";
import { router, protectedProcedure } from "../trpc";
import { EventEmitter } from "events";

// A simple in-memory event emitter — in production use Redis pub/sub
const ee = new EventEmitter();

export const notificationRouter = router({
  // Subscription procedure — runs as long as the client is connected
  onNewNotification: protectedProcedure.subscription(({ ctx }) => {
    // observable() returns a stream of values
    return observable<{ message: string; type: string }>(({ emit }) => {
      const onNotification = (data: { message: string; type: string }) => {
        emit.next(data); // push a value to the client
      };

      const channel = `notifications:${ctx.userId}`;
      ee.on(channel, onNotification);

      // Cleanup function — called when the client disconnects
      return () => {
        ee.off(channel, onNotification);
      };
    });
  }),
});

// Emitting a notification (from a mutation or server event)
export function sendNotification(
  userId: string,
  data: { message: string; type: string },
) {
  ee.emit(`notifications:${userId}`, data);
}
```

```tsx
// Client — subscribing
"use client";
import { trpc } from "@/lib/trpc/client";

function NotificationListener() {
  trpc.notification.onNewNotification.useSubscription(undefined, {
    onData: (notification) => {
      console.log("New notification:", notification.message);
      // Show a toast, update state, etc.
    },
    onError: (err) => {
      console.error("Subscription error:", err);
    },
  });

  return null; // this component just sets up the subscription
}
```

---

## 9. Error Handling.

### Server-Side Error Formatting.

```typescript
// src/server/trpc.ts
const t = initTRPC.context<Context>().create({
  // Format errors before they are sent to the client
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Include Zod validation details in development
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
```

### Client-Side Error Handling.

```tsx
"use client";
import { trpc } from "@/lib/trpc/client";
import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/routers/_app";

function CreateUser() {
  const createUser = trpc.user.create.useMutation({
    onError: (error) => {
      // error is typed as TRPCClientError<AppRouter>
      console.log(error.message); // the error message
      console.log(error.data?.code); // 'BAD_REQUEST', 'UNAUTHORIZED', etc.

      // Access Zod validation errors (if you set up the error formatter)
      if (error.data?.zodError) {
        const fieldErrors = error.data.zodError.fieldErrors;
        // fieldErrors.email, fieldErrors.name, etc.
      }
    },
  });

  // Type-safe error check in render
  return (
    <div>
      {createUser.error && (
        <p className="text-red-500">{createUser.error.message}</p>
      )}
      <button
        onClick={() => createUser.mutate({ name: "Alice", email: "bad-email" })}
      >
        Create
      </button>
    </div>
  );
}

// Handling errors outside of hooks
async function fetchUserManually(id: string) {
  try {
    const user = await trpcClient.user.getById.query({ id });
    return user;
  } catch (err) {
    if (err instanceof TRPCClientError) {
      if (err.data?.code === "NOT_FOUND") return null;
      if (err.data?.code === "UNAUTHORIZED") redirect("/login");
    }
    throw err;
  }
}
```

---

## 10. Type Inference Utilities.

tRPC exports several TypeScript utilities for extracting types from your router. Useful for writing helper functions, testing or building additional tooling.

```typescript
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

// Infer all input types
type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

// Extract specific types
type CreateProductInput = RouterInput["product"]["create"];
// { name: string; price: number; description?: string; category: string; stock: number }

type ProductListOutput = RouterOutput["product"]["list"];
// { products: Product[]; total: number; page: number; totalPages: number }

type GetUserByIdOutput = RouterOutput["user"]["getById"];
// The exact return type of your getById query

// Use these types in your components, helpers, or tests
function buildProductPayload(data: CreateProductInput) {
  return { ...data, createdAt: new Date() };
}

// Works great with React state
const [newProduct, setNewProduct] = useState<CreateProductInput>({
  name: "",
  price: 0,
  category: "",
  stock: 0,
});
```

---

## Assignment.

1. **Type-Safe CRUD API with tRPC, Zod, and an In-Memory Store.**

   **What you practice:**
   - Initialising tRPC with `initTRPC` and exporting `router`, `procedure`
   - Writing `query` and `mutation` procedures with typed Zod `.input()` schemas
   - Throwing `TRPCError` with appropriate codes (`NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`)
   - Merging sub-routers into a single `appRouter` and exporting `AppRouter` type
   - Setting up the Next.js App Router API route handler with `fetchRequestHandler`
   - Creating the tRPC React client with `createTRPCReact<AppRouter>()`
   - Wrapping the app in `TRPCProvider` + `QueryClientProvider`
   - `useQuery` for fetching data and `useMutation` for mutations in Client Components
   - `utils.invalidate()` after mutations to keep the UI in sync
   - `inferRouterInputs` and `inferRouterOutputs` for extracting types

   **Requirements:**
   - Create a Next.js + TypeScript + Tailwind app with tRPC.
   - Build a **Task Manager** with these tRPC procedures (in-memory store — no DB):
     - `task.getAll` — query, returns all tasks.
     - `task.getById` — query, input `{ id: string }`, returns one task or throws `NOT_FOUND`.
     - `task.create` — mutation, input `{ title: string (min 1), description?: string, priority: 'low'|'medium'|'high' }`, returns the new task.
     - `task.update` — mutation, input `{ id: string, title?: string, description?: string, priority?: enum, completed?: boolean }`, returns updated task or throws `NOT_FOUND`.
     - `task.delete` — mutation, input `{ id: string }`, returns `{ success: true }` or throws `NOT_FOUND`.
     - `task.getByPriority` — query, input `{ priority: 'low'|'medium'|'high' }`, returns filtered tasks.
   - Build a UI page at `/` that:
     - Shows all tasks in a list using `task.getAll.useQuery()`.
     - Has a "Create Task" form using `task.create.useMutation()`.
     - Each task has a "Complete" toggle button using `task.update.useMutation()`.
     - Each task has a "Delete" button using `task.delete.useMutation()`.
     - Shows loading and error states properly.

   [Solution](./Assignment/code1)

   **Manual Test Cases:**

   ```
   # 1. Start dev server
   npm run dev → open http://localhost:3000
   → 3 seed tasks render (Learn tRPC, Write tests, Deploy to Vercel).
   → Each task shows a priority badge and a checkbox.

   # 2. Create a task
   Fill in Title: "Review PR", Priority: "high". Click "Create Task".
   → Button shows "Creating..." during the mutation.
   → New task appears in the list immediately (invalidation worked).
   → Form clears after success.

   # 3. Create task — validation error
   Leave title empty. Click "Create Task" (button should be disabled).
   → Button is disabled when title is empty — cannot submit.

   # 4. Toggle completion
   Click the checkbox on any task.
   → Task text gets a strikethrough and the row fades.
   → Counter at the bottom ("1/4 completed") updates.
   Click the checkbox again.
   → Task is marked incomplete again.

   # 5. Delete a task
   Click the × button on any task.
   → Task is immediately removed from the list.

   # 6. API directly via browser
   GET http://localhost:3000/api/trpc/task.getAll
   → Returns JSON: { result: { data: [...tasks] } }

   GET http://localhost:3000/api/trpc/task.getById?input={"id":"<valid-uuid>"}
   → Returns the task.

   GET http://localhost:3000/api/trpc/task.getById?input={"id":"00000000-0000-0000-0000-000000000000"}
   → Returns: { error: { message: "Task ... not found", code: "NOT_FOUND" } }
   ```

2. **Full-Stack App with tRPC, Prisma, Context and Protected Procedures.**

   **What you practice:**
   - Creating a tRPC `Context` that contains the Prisma client and the authenticated user
   - Writing `protectedProcedure` using `t.middleware()` that throws `UNAUTHORIZED` if no user
   - Typing the enriched context after middleware so TypeScript knows `userId` is `string`
   - Multi-router architecture: `userRouter`, `postRouter` merged into `appRouter`
   - Using `inferRouterInputs` / `inferRouterOutputs` to extract types for form state
   - `useQuery` with `enabled` option (only fetch when a condition is true)
   - `useMutation` with `onSuccess` + `utils.invalidate()` for cache management
   - Session-based auth passed through tRPC context (no NextAuth — simple cookie-based session)

   **Requirements:**
   - Prisma with SQLite. Models: `User` (id, email, name, password, createdAt), `Post` (id, title, content, published, authorId, createdAt).
   - tRPC procedures:
     - `user.register` — mutation, creates a user (bcrypt hash), returns `{ id, email, name }`.
     - `user.login` — mutation, checks credentials, sets a session cookie, returns `{ id, email, name }`.
     - `user.me` — protected query, returns the current user from context.
     - `user.logout` — protected mutation, clears the session cookie.
     - `post.getAll` — query, returns all published posts with author name.
     - `post.getById` — query, input `{ id: number }`, returns one post with author.
     - `post.create` — protected mutation, creates a post linked to `ctx.userId`.
     - `post.update` — protected mutation, only the author can update their own post (throws `FORBIDDEN` otherwise).
     - `post.delete` — protected mutation, only the author can delete (throws `FORBIDDEN` otherwise).
     - `post.togglePublish` — protected mutation, flips `published` boolean, author only.
   - Pages:
     - `/` — public post list using `post.getAll.useQuery()`.
     - `/register` and `/login` — forms using their respective mutations.
     - `/dashboard` — shows `user.me.useQuery()` info and a list of the user's own posts with actions.
     - `/posts/new` — create post form using `post.create.useMutation()`.

   [Solution](./Assignment/code2)

   **Setup Commands.**

   ```
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```

   **Manual Test Cases:**

   ```
   # 1. Register
   Visit /register. Fill in name, email, password. Click "Create Account".
   → Redirected to /login?registered=true with success message.

   # 2. Login
   Fill in credentials. Click "Sign In".
   → Cookie "userId" is set (check DevTools → Application → Cookies).
   → Redirected to /dashboard showing "Welcome back, {name}".

   # 3. Protected procedure without auth
   Visit /dashboard while not logged in (clear the userId cookie).
   → "You must be logged in to view the dashboard." message renders.
   → user.me returned UNAUTHORIZED — retry: false prevented repeated requests.

   # 4. Create a post
   Click "+ New Post" on the dashboard. Fill in title and content.
   → Redirected to /dashboard. New post appears as "Draft".

   # 5. Publish/Unpublish
   Click "Publish" on any draft post.
   → Badge changes from "Draft" to "Published". Post now appears on the homepage (/).
   Click "Unpublish".
   → Badge reverts to "Draft". Post disappears from the homepage.

   # 6. Delete a post
   Click "Delete" on any post.
   → Post is immediately removed from the list (invalidation fired).

   # 7. FORBIDDEN — ownership check
   Register a second user in a different browser.
   Try calling the delete mutation for a post owned by the first user.
   → tRPC returns FORBIDDEN error (403).

   # 8. Homepage — only published posts
   Visit /. Only posts with published: true appear.
   Unpublished drafts are not visible.

   # 9. Logout
   Click "Sign out" on the dashboard.
   → userId cookie is cleared. Redirected to /.
   → Visiting /dashboard now shows the unauthenticated message.
   ```

3. **Type-Safe Full-Stack E-Commerce with tRPC, Prisma, Zod v3, Subscriptions and Optimistic Updates.**

   **What you practice:**
   - Multi-router architecture with shared context (Prisma + session)
   - `inferRouterInputs` / `inferRouterOutputs` used for form state typing
   - Optimistic updates with `onMutate` / `onError` rollback / `onSettled` invalidation
   - tRPC subscriptions via SSE for real-time order status updates
   - `createCallerFactory` to call tRPC from Server Components (zero HTTP overhead)
   - Nested protected procedure chains (authenticated → owner check)
   - Prisma transactions in a tRPC mutation (atomic checkout)
   - `useQuery` with `select` to derive computed data client-side
   - Full Zod schemas exported from a `src/schemas/` folder, reused on client for form validation

   **Requirements:**
   - Models: `User`, `Product`, `CartItem` (userId, productId, quantity), `Order`, `OrderItem`.
   - tRPC routers: `auth` (register, login, me, logout), `product` (getAll, getById, create [admin]), `cart` (getCart, addItem, updateItem, removeItem, clear), `order` (checkout [transaction], getMyOrders, getById, updateStatus [admin]).
   - Real-time: `order.onStatusChange` subscription — when an admin changes an order's status, emit to the subscriber. Use a Node.js `EventEmitter` as the in-process pub/sub.
   - Optimistic updates on `cart.addItem` and `cart.removeItem` — the UI updates instantly without waiting for the server.
   - `createCallerFactory` used in the products Server Component for zero-network SSG.
   - All Zod schemas exported from `src/schemas/` and reused in React Hook Form on the client.

   [Solution](./Assignment/code3)

   **Setup Commands.**

   ```
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```

   **Manual Test Cases:**

   ```
   # 1. Homepage (Server Component + serverTrpc)
   npm run dev → open http://localhost:3000
   → Products fetched via serverTrpc.product.getAll() — no HTTP request fired.
   Verify in DevTools Network tab: no /api/trpc call on initial load for products.

   # 2. Register and login
   Visit /register → create an account.
   Visit /login → sign in.
   → userId cookie set (DevTools → Application → Cookies).

   # 3. Add to cart — optimistic update
   Visit /products/1. Click "Add to Cart".
   → Button immediately shows "Adding..." then "✓ Added to cart".
   → Visit /cart — item appears with correct quantity and price.
   Click "+" twice on the item in /cart.
   → Quantity updates optimistically (UI changes before server confirms).
   Click "−" until 0 — item is removed.

   # 4. Checkout — Prisma transaction
   Add a few items to the cart. Click "Place Order".
   → Redirected to /orders.
   → New order appears with "pending" status.
   → Visit / — product stock counts decremented.
   → Cart is now empty.

   # 5. Real-time subscription (requires admin)
   Manually update an order status in Prisma Studio (npx prisma studio) OR
   add an admin user (set role = 'admin' in the DB) and call order.updateStatus.
   On /orders, the OrderStatusListener component will immediately show
   the new status without a page refresh — SSE subscription fired.

   # 6. FORBIDDEN check
   Try calling order.getById for an order owned by a different user.
   → tRPC returns FORBIDDEN error.

   # 7. inferRouterOutputs type safety
   In CartItemRow.tsx, the item prop type is derived from:
   inferRouterOutputs<AppRouter>['cart']['getCart'][number]
   → TypeScript knows item.product.name is string, item.quantity is number, etc.
   → If the Prisma query changes, TypeScript immediately flags every call site.

   # 8. Schemas reused across layers
   The Zod schemas in src/schemas/ are used by:
   - Server: procedure .input() validation
   - Client: can be passed to react-hook-form's zodResolver
   This is single-source-of-truth validation — change the schema once, both layers update.
   ```
