# List of things learned.

## 1. Why Error Handling & Logging Matter

### The Cost of Poor Error Handling.

Without proper error handling:

- A single unhandled error **crashes the entire Node.js process**, taking down all users.

- Errors surface as cryptic `Cannot read property of undefined` messages with no context.

- Stack traces containing internal file paths and database queries get sent to clients, a security risk.

- Debugging production issues takes hours because there are no logs to trace the failure.

### What Good Error Handling Achieves

```
User makes bad request
    → API returns clear, helpful 400 with field details
    → Server logs the event at "warn" level with request ID
    → Monitoring system does NOT alert (expected operational error)

Database crashes unexpectedly
    → API returns generic "Something went wrong" to client (no internals exposed)
    → Server logs full stack trace at "error" level with request ID
    → Monitoring system fires an alert to the on-call engineer
    → Process restarts cleanly (no zombie state)
```

### What Good Logging Achieves

```
"Why did user Alice's request fail at 3 PM yesterday?"
    → Search logs by requestId
    → See full request, validation context, DB query, and error in sequence
    → Identify root cause in 2 minutes instead of 2 hours
```

<hr />

## 2. Types of Errors in Node.js

### Operational Errors

Errors that are **expected at runtime**, they represent valid failure scenarios your code should handle gracefully.

```
User not found           → 404
Invalid email format     → 400
Duplicate record         → 409
JWT token expired        → 401
Rate limit exceeded      → 429
File not found           → 404
External API timeout     → 503
Database connection lost → 503
```

These are NOT bugs. They happen in production all the time. Handle them explicitly, return a proper HTTP response, log at `warn` or `info` level.

### Programmer Errors

Errors caused by **bugs in your code**, things that should never happen if the code is correct.

```
TypeError: Cannot read property 'id' of undefined
ReferenceError: someVariable is not defined
Calling a function with the wrong number of arguments
Passing a string where a number is expected
Logic bug producing wrong results
```

These ARE bugs.

Don't try to recover from them, **let the process crash** so the bug gets noticed and fixed.

A process manager (PM2, Docker) will restart it.

### System Errors

Low-level errors from the OS:

```
ENOENT  — file or directory not found
EACCES  — permission denied
EADDRINUSE — port already in use
ECONNREFUSED — connection refused (DB, Redis, external service)
ETIMEDOUT — network connection timed out
```

```javascript
const fs = require("fs");

fs.readFile("/nonexistent.txt", (err, data) => {
  if (err) {
    if (err.code === "ENOENT") {
      console.error("File not found");
    } else if (err.code === "EACCES") {
      console.error("Permission denied");
    } else {
      throw err; // unexpected system error — let it crash
    }
  }
});
```

<hr />

## 3. The Error Object in JavaScript.

### The Built-in `Error` Class.

```javascript
const err = new Error("Something went wrong");

console.log(err.message); // 'Something went wrong'
console.log(err.name); // 'Error'
console.log(err.stack);
// Error: Something went wrong
//     at Object.<anonymous> (/app/index.js:1:13)
//     at Module._compile (node:internal/modules/cjs/loader:1364:14)
//     ...
```

### Built-in Error Subclasses

```javascript
// TypeError — wrong type
const x = null;
x.toString();
// TypeError: Cannot read properties of null (reading 'toString')

// ReferenceError — variable doesn't exist
console.log(undeclaredVar);
// ReferenceError: undeclaredVar is not defined

// SyntaxError — invalid JS syntax
eval("{ bad json }");
// SyntaxError: Unexpected token '}'

// RangeError — value out of acceptable range
new Array(-1);
// RangeError: Invalid array length
```

### `Error.captureStackTrace`

```javascript
class MyError extends Error {
  constructor(message) {
    super(message);
    this.name = "MyError";
    // Removes the constructor call from the stack trace
    // so the trace starts at the CALLER, not the Error class itself
    Error.captureStackTrace(this, this.constructor);
  }
}

const err = new MyError("test");
console.log(err.stack);
// MyError: test
//     at someFunction (/app/routes/users.js:42:11)  ← starts at caller
//     at Layer.handle (/app/node_modules/express/...)
```

Without `captureStackTrace`, the stack trace would show the `MyError` constructor call as the first frame — which is misleading.

<hr />

## 4. Synchronous Error Handling.

### `try/catch`

The fundamental mechanism for catching synchronous errors:

```javascript
function parseConfig(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    return config;
  } catch (err) {
    // err is the SyntaxError thrown by JSON.parse
    console.error("Failed to parse config:", err.message);
    return null; // or throw a custom error
  }
}

parseConfig("{ invalid json }"); // caught, returns null
```

### `try/catch/finally`

`finally` runs regardless of whether an error occurred — useful for cleanup:

```javascript
function readAndClose(filePath) {
  let fileHandle = null;
  try {
    fileHandle = openFile(filePath);
    return processFile(fileHandle);
  } catch (err) {
    console.error("Error processing file:", err.message);
    throw err; // re-throw so caller knows it failed
  } finally {
    // This ALWAYS runs — with or without an error
    if (fileHandle) closeFile(fileHandle);
  }
}
```

### Re-throwing Errors

Sometimes you catch to add context, then re-throw:

```javascript
function getUser(id) {
  try {
    return db.findUser(id);
  } catch (err) {
    // Wrap the low-level DB error in a domain-level error
    throw new Error(`Failed to retrieve user ${id}: ${err.message}`);
  }
}
```

### Throwing in Express Sync Routes

Express automatically catches errors thrown synchronously in route handlers:

```javascript
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);

  // Synchronous throw — Express catches it and forwards to error middleware
  if (isNaN(id)) {
    throw new AppError("User ID must be a number", 400, "INVALID_ID");
  }

  // ...
});
```

<hr />

## 5. Asynchronous Error Handling.

### The Problem with Async Errors in Express 4

Express 4 does **not** automatically catch errors thrown inside `async` functions:

```javascript
// ❌ This crashes the Node.js process — error is NOT caught by Express
app.get("/users/:id", async (req, res) => {
  const user = await db.findUser(req.params.id); // if this throws, it's unhandled
  res.json(user);
});
```

### Solution 1. `try/catch` + `next(err)`

The manual way — wraps every async handler:

```javascript
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await db.findUser(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    res.json(user);
  } catch (err) {
    next(err); // forward to error handler middleware
  }
});
```

### Solution 2. `asyncHandler` Wrapper (Recommended)

Write the wrapper once, use everywhere — no `try/catch` cluttering every route:

```javascript
// utils/asyncHandler.js
function asyncHandler(fn) {
  return function (req, res, next) {
    // Wrap in Promise.resolve to catch both thrown errors and rejected promises
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
module.exports = asyncHandler;
```

```javascript
const asyncHandler = require("./utils/asyncHandler");

// Clean — no try/catch needed
app.get(
  "/users/:id",
  asyncHandler(async (req, res, next) => {
    const user = await db.findUser(req.params.id);
    if (!user) return next(new AppError("User not found", 404));
    res.json(user);
  }),
);
```

### Solution 3. Express 5 (Automatic Async Error Catching)

Express 5 (currently in beta, released as `express@5`) automatically catches errors from `async` route handlers:

```javascript
// With Express 5, no asyncHandler needed
app.get("/users/:id", async (req, res) => {
  const user = await db.findUser(req.params.id); // thrown errors auto-forwarded to error middleware
  res.json(user);
});
```

For now (Express 4), always use `asyncHandler`.

### Promise Chains

```javascript
// ❌ Unhandled — error in .then() or missing .catch()
app.get("/data", (req, res) => {
  fetchData().then((data) => res.json(data));
  // No .catch() — rejection is unhandled!
});

// ✅ Always add .catch(next)
app.get("/data", (req, res, next) => {
  fetchData()
    .then((data) => res.json(data))
    .catch(next); // passes rejection to error handler
});
```

### Async Errors in Middleware

```javascript
// Custom async middleware — must use try/catch + next(err)
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(new AppError("No token provided", 401));
    req.user = await verifyToken(token); // async — could throw
    next();
  } catch (err) {
    next(new AppError("Invalid token", 401));
  }
}
```

<hr />

## 6. The Custome AppError Class.

### Why a Custom Error Class?

The built-in `Error` only has `message` and `stack`. For HTTP APIs you need:

- `statusCode` : which HTTP status to send
- `code` : machine-readable error identifier
- `isOperational` : is this an expected error or a bug?

### Full Implementation

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message); // sets this.message

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code || "APP_ERROR";

    // 'fail' for client errors (4xx), 'error' for server errors (5xx)
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    // Marks this as an expected, handled error (vs a programmer bug)
    this.isOperational = true;

    // Removes AppError constructor from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

### Using AppError

```javascript
const AppError = require("./utils/AppError");

// 404 — resource not found
throw new AppError("User not found", 404, "USER_NOT_FOUND");

// 400 — validation failed
throw new AppError("Email is required", 400, "VALIDATION_ERROR");

// 401 — not authenticated
throw new AppError(
  "Please log in to access this resource",
  401,
  "UNAUTHORIZED",
);

// 403 — not authorized
throw new AppError(
  "You do not have permission to perform this action",
  403,
  "FORBIDDEN",
);

// 409 — conflict
throw new AppError("Email already registered", 409, "DUPLICATE_EMAIL");

// 429 — rate limited
throw new AppError(
  "Too many requests, please slow down",
  429,
  "RATE_LIMIT_EXCEEDED",
);
```

### AppError with Extra Fields

For validation errors, attach a `details` array:

```javascript
const err = new AppError("Validation failed", 400, "VALIDATION_ERROR");
err.details = [
  { field: "email", message: "Email is required" },
  { field: "password", message: "Must be at least 8 characters" },
];
return next(err);
```

<hr />

## 7. Express Error Handling Pipeline.

### The 4-Argument Error Middleware

Express identifies error-handling middleware by its **exactly 4 arguments**: `(err, req, res, next)`.

If you write 3 arguments, Express treats it as a regular middleware.

```javascript
// Regular middleware — 3 args
function logger(req, res, next) { ... }

// Error middleware — 4 args (MUST have all 4, even if you don't use next)
function errorHandler(err, req, res, next) { ... }
```

### Complete Error Handler Middleware

```javascript
// middleware/errorHandler.js
const AppError = require("../utils/AppError");

module.exports = function errorHandler(err, req, res, next) {
  // Set defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production";

  // ── Development: full details ──────────────────────────────────────────────
  if (isDev) {
    return res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
      stack: err.stack, // show stack in dev
    });
  }

  // ── Production: safe, clean response ──────────────────────────────────────
  if (isProd) {
    // Operational errors — safe to send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        statusCode: err.statusCode,
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      });
    }

    // Programmer errors — do NOT expose details, log for internal inspection
    console.error("[PROGRAMMER ERROR]", err);
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again later.",
    });
  }
};
```

### Middleware Order — Why It Matters

```javascript
// index.js — order is CRITICAL

app.use(helmet());
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/products", productsRouter);

// ── These MUST come AFTER all routes ──────────────────────────────────────────
app.use(notFoundHandler); // catches any unmatched route
app.use(errorHandler); // catches all errors forwarded via next(err)
```

### The `notFound` Middleware

```javascript
// middleware/notFound.js
const AppError = require("../utils/AppError");

module.exports = function notFound(req, res, next) {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};
```

### Passing Errors with `next(err)`

```javascript
// In any route handler or middleware:
app.get(
  "/users/:id",
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    // Pass an AppError — goes to error handler, sends 404
    if (!user)
      return next(new AppError("User not found", 404, "USER_NOT_FOUND"));

    res.json({ status: "success", data: user });
  }),
);

// Passing an unexpected error
app.get(
  "/risky",
  asyncHandler(async (req, res, next) => {
    try {
      await someRiskyOperation();
    } catch (err) {
      // Pass raw error — error handler treats it as non-operational → 500
      return next(err);
    }
  }),
);
```

### Handling Specific Database Errors

Wrap known DB errors in operational `AppError`s so they produce proper HTTP responses:

```javascript
// middleware/errorHandler.js (enhanced)
function handleCastError(err) {
  return new AppError(
    `Invalid value for field: ${err.path}`,
    400,
    "INVALID_FIELD",
  );
}

function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(`${field} already exists`, 409, "DUPLICATE_VALUE");
}

function handleValidationError(err) {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(
    `Validation failed: ${messages.join(". ")}`,
    400,
    "VALIDATION_ERROR",
  );
}

module.exports = function errorHandler(err, req, res, next) {
  let error = { ...err, message: err.message };

  // Transform known error types into operational AppErrors
  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err); // MongoDB duplicate
  if (err.name === "ValidationError") error = handleValidationError(err); // Mongoose validation
  if (err.name === "JsonWebTokenError")
    error = new AppError("Invalid token", 401, "INVALID_TOKEN");
  if (err.name === "TokenExpiredError")
    error = new AppError("Token expired", 401, "TOKEN_EXPIRED");
  if (err.name === "SyntaxError" && err.type === "entity.parse.failed")
    error = new AppError("Invalid JSON in request body", 400, "INVALID_JSON");

  // Log all 5xx errors
  if ((error.statusCode || 500) >= 500) {
    console.error(`[ERROR] ${error.message}`, { stack: error.stack });
  }

  const isDev = process.env.NODE_ENV === "development";

  if (error.isOperational || isDev) {
    return res.status(error.statusCode || 500).json({
      status: error.status || "error",
      statusCode: error.statusCode || 500,
      code: error.code || "ERROR",
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(isDev && { stack: err.stack }),
    });
  }

  return res.status(500).json({
    status: "error",
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again later.",
  });
};
```

<hr />

## 8. Handling Uncaught Exceptions & Unhandled Rejections.

### `uncaughtException`

Fires when a synchronous error is thrown outside of any `try/catch` and not caught anywhere:

```javascript
// This crashes Node without any handler
throw new Error("Oops — nobody caught me");

// ── Handle it ────────────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION — shutting down");
  console.error(err.name, err.message);
  console.error(err.stack);

  // Exit the process after logging
  // A process manager (PM2, Docker) will restart it
  process.exit(1);
});
```

> **Important:** You cannot safely recover from an `uncaughtException`. The process may be in an inconsistent state. Always exit and let the process manager restart.

### `unhandledRejection`

Fires when a Promise is rejected and no `.catch()` / `try/catch` handles it:

```javascript
// This used to silently swallow the error — now crashes in Node 15+
async function badFn() {
  throw new Error("Async error with no handler");
}
badFn(); // Promise rejected, no await, no catch

// ── Handle it ────────────────────────────────────────────────────────────────
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise);
  console.error("Reason:", reason);

  // Graceful shutdown — let existing requests finish, then exit
  server.close(() => {
    process.exit(1);
  });
});
```

### Graceful Shutdown

```javascript
// index.js — full startup with graceful shutdown
require("dotenv").config();
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});

// Handle uncaught synchronous exceptions
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION — shutting down", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1); // exit immediately — state is unknown
});

// Handle unhandled Promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED REJECTION — shutting down", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  // Give server time to finish pending requests
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM (sent by Docker/Kubernetes/PM2 on graceful stop)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});
```

<hr />

## 9. HTTP Error Libraries.

### The `http-errors` Package

A convenient package for creating HTTP errors without a custom AppError class:

```bash
npm install http-errors
```

```javascript
const createError = require("http-errors");

// Create errors
throw createError(404, "User not found");
throw createError(400, "Email is required");
throw createError.Unauthorized("Please log in");
throw createError.Forbidden("Access denied");
throw createError.NotFound("Post not found");
throw createError.Conflict("Email already registered");
throw createError.TooManyRequests("Rate limit exceeded");
throw createError.InternalServerError();

// The created error has:
// err.status     → 404
// err.message    → 'User not found'
// err.expose     → true if status < 500 (safe to send to client)
```

### Checking `err.expose`

`http-errors` sets `err.expose = true` for 4xx errors (safe to return to client) and `err.expose = false` for 5xx errors (internal — don't expose):

```javascript
module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    status: statusCode < 500 ? "fail" : "error",
    message: err.expose ? err.message : "Something went wrong",
    // Only expose the message if it's safe (4xx) or if it's dev mode
  });
};
```

### Custom AppError vs `http-errors`

|                         | Custom AppError     | `http-errors`          |
| ----------------------- | ------------------- | ---------------------- |
| Machine-readable `code` | ✅ Custom           | ❌ Not built-in        |
| `isOperational` flag    | ✅ Custom           | ✅ Via `err.expose`    |
| `details` array         | ✅ Custom           | ❌ Not built-in        |
| Zero setup              | ❌ Need to write it | ✅ `npm install`       |
| Best for                | Your own apps       | Libraries, quick setup |

**Recommendation:** Use a custom `AppError` for applications — you get full control. Use `http-errors` for libraries or rapid prototypes.

<hr />

## 10. Logging Fundamentals.

### Why `console.log` Is Not Enough

```javascript
// ❌ Problems with console.log:
console.log("User created"); // no timestamp
console.log(userObject); // no log level
console.log("Error:", err); // no structure — hard to query in production
// no way to turn it off per environment
// no file output
// no log rotation

// ✅ A proper logger:
logger.info({ event: "user.created", userId: 42, email: "alice@x.com" });
logger.error({ event: "db.error", message: err.message, requestId: req.id });
```

### What a Good Logger Provides

- **Levels** : `error`, `warn`, `info`, `http`, `debug` — filter by severity
- **Timestamps** : know exactly when things happened
- **Structure** : JSON format so log aggregators can parse, filter, and alert
- **Transports** : write to console, file, remote service simultaneously
- **Context** : attach request IDs, user IDs, environment to every log entry
- **Performance** : async writes, doesn't block the event loop

<hr />

## 11. Morgan. (HTTP Request Logger)

Morgan is a dedicated **HTTP request logging middleware** — it logs one line per incoming request.

```bash
npm install morgan
```

### Built-in Format Tokens

```javascript
const morgan = require("morgan");

// ── Pre-built formats ─────────────────────────────────────────────────────────
app.use(morgan("dev"));
// GET /users 200 12.345 ms - 248

app.use(morgan("combined"));
// 127.0.0.1 - - [01/Jan/2024:12:00:00 +0000] "GET /users HTTP/1.1" 200 248

app.use(morgan("tiny"));
// GET /users 200 248 - 12.345 ms

app.use(morgan("short"));
// 127.0.0.1 - GET /users HTTP/1.1 200 248 - 12.345 ms
```

### Custom Morgan Format

```javascript
// Custom format with request ID and response time
morgan.token("id", (req) => req.requestId || "-");

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms [:id]"),
);
// POST /users 201 82 - 8.234 ms [a3f2-b1c4-...]
```

### Writing Morgan Logs to a File

```javascript
const fs = require("fs");
const path = require("path");

// Create a write stream (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "logs", "access.log"),
  { flags: "a" },
);

// Write combined logs to file
app.use(morgan("combined", { stream: accessLogStream }));

// Also write dev format to console
app.use(morgan("dev"));
```

### Skipping Logs Conditionally

```javascript
// Skip logging health check endpoints (they'd spam logs)
app.use(
  morgan("dev", {
    skip: (req, res) => req.path === "/health" || req.path === "/ping",
  }),
);

// Only log errors in production
app.use(
  morgan("combined", {
    skip: (req, res) =>
      process.env.NODE_ENV === "production" && res.statusCode < 400,
  }),
);
```

<hr />

## 12. Winston. (Production Logger)

Winston is the most widely used Node.js logger. It supports multiple transports, log levels, custom formats, and structured JSON output.

```bash
npm install winston
```

### Basic Winston Setup

```javascript
// config/logger.js
const winston = require("winston");

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ── Custom format for console (development) ───────────────────────────────────
const devFormat = combine(
  colorize({ all: true }), // colorized output
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }), // include stack traces
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  }),
);

// ── Production format — JSON ──────────────────────────────────────────────────
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(), // outputs: { "level":"error","message":"...","timestamp":"...","stack":"..." }
);

const isDev = process.env.NODE_ENV !== "production";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,

  transports: [
    // Always write to console
    new winston.transports.Console(),
  ],
});

// ── In production: also write to files ───────────────────────────────────────
if (!isDev) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error", // only error and above
      maxsize: 5 * 1024 * 1024, // 5MB per file
      maxFiles: 5, // keep last 5 files
      tailable: true,
    }),
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  );
}

module.exports = logger;
```

### Winston Log Levels

Winston uses npm log levels by default (lower number = higher priority):

```javascript
// 0 — highest priority
logger.error("Database connection failed");
// 1
logger.warn("Rate limit approaching for user 42");
// 2
logger.info("Server started on port 3000");
// 3
logger.http("GET /users 200 12ms");
// 4
logger.verbose("Config loaded successfully");
// 5
logger.debug("Processing user payload", { body: req.body });
// 6 — lowest priority
logger.silly("Inside some deeply nested function");
```

Setting `level: 'info'` means only `error`, `warn`, and `info` are logged. `http`, `debug`, and below are suppressed.

### Using the Logger

```javascript
const logger = require("./config/logger");

// Simple message
logger.info("Server started");

// With metadata (structured logging)
logger.info("User created", {
  userId: 42,
  email: "alice@example.com",
  requestId: req.requestId,
});

// Error with full context
logger.error("Database query failed", {
  error: err.message,
  stack: err.stack,
  query: "SELECT * FROM users WHERE id = ?",
  requestId: req.requestId,
  userId: req.user?.id,
});

// Warning
logger.warn("Deprecated endpoint called", {
  endpoint: req.path,
  userAgent: req.get("User-Agent"),
});
```

### Winston with Morgan Integration

Route Morgan's output through Winston so all logs go to the same place:

```javascript
// config/logger.js — add this export
const morganStream = {
  write: (message) => logger.http(message.trim()),
};
module.exports = { logger, morganStream };

// index.js
const { logger, morganStream } = require("./config/logger");
app.use(morgan("combined", { stream: morganStream }));
```

<hr />

## 13. Structured Logging.

### What is Structured Logging?

Structured logging means writing logs as **JSON objects** instead of human-readable strings.

This makes them **machine-parseable**, log aggregation tools (Datadog, Grafana Loki, CloudWatch) can search, filter and alert on specific fields.

```javascript
// ❌ Unstructured — hard to query
logger.info("User 42 logged in from 192.168.1.1 at 2024-01-15 using Chrome");

// ✅ Structured — easy to query
logger.info("User login", {
  event: "user.login",
  userId: 42,
  ip: "192.168.1.1",
  userAgent: "Chrome/120.0",
  timestamp: new Date().toISOString(),
});
```

**In a log aggregator you can now:**

- `event = "user.login"` → count logins per hour
- `userId = 42` → see all activity for this user
- `ip = "192.168.1.1"` → detect suspicious IPs
- `status >= 500` → alert on server errors

### JSON Log Output

```json
{
  "level": "info",
  "message": "User login",
  "event": "user.login",
  "userId": 42,
  "ip": "192.168.1.1",
  "requestId": "a3f2b1c4-0001",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

```json
{
  "level": "error",
  "message": "Database query failed",
  "event": "db.query.error",
  "error": "Connection timeout after 5000ms",
  "query": "SELECT * FROM users WHERE id = 42",
  "requestId": "a3f2b1c4-0001",
  "userId": 42,
  "duration": 5032,
  "timestamp": "2024-01-15T10:30:01.000Z",
  "stack": "Error: Connection timeout\n  at Pool.query..."
}
```

### Consistent Event Names

Use dot-notation event names for easy filtering:

```javascript
// Auth
logger.info("auth.login.success", { userId, ip });
logger.warn("auth.login.failed", { email, ip, reason: "wrong_password" });
logger.warn("auth.login.failed", { email, ip, reason: "account_locked" });
logger.info("auth.logout", { userId });
logger.info("auth.token.refresh", { userId });

// Users
logger.info("user.created", { userId, email });
logger.info("user.updated", { userId, fields: ["email", "name"] });
logger.info("user.deleted", { userId });

// API
logger.warn("api.rate_limit", { ip, endpoint, remaining: 0 });
logger.error("api.error", { requestId, statusCode: 500, error: err.message });

// Database
logger.error("db.connection.lost", { host, error: err.message });
logger.warn("db.query.slow", { query, duration: 3200, threshold: 1000 });
```

<hr />

## 14. Log Levels & When to Use Them.

### Level Decision Guide

```
Level     | When to use
──────────────────────────────────────────────────────────────────────
error     | The system cannot complete a critical operation. Requires immediate attention.
          | Examples: DB connection lost, unhandled exception, payment failed, file write failed
          |
warn      | Something unexpected happened but the system can continue. Investigate soon.
          | Examples: rate limit approaching, slow query detected, deprecated endpoint called,
          |           retrying a failed operation, config fallback to default
          |
info      | Normal significant business events. Things you want in audit logs.
          | Examples: server started, user created, order placed, cache cleared,
          |           background job completed, feature flag changed
          |
http      | HTTP request/response logging (usually handled by Morgan)
          |
debug     | Detailed diagnostic info for developers. Disabled in production.
          | Examples: SQL query content, middleware execution, parsed config values,
          |           function inputs and outputs during debugging
          |
verbose   | Even more detail than debug. Rarely used.
silly     | Maximum verbosity. Trace-level detail.
```

### Level by Environment

```javascript
// .env.development
LOG_LEVEL = debug; // see everything

// .env.test
LOG_LEVEL = warn; // only warnings and errors (keep test output clean)

// .env.production
LOG_LEVEL = info; // info and above (no debug spam)
```

### What NOT to Log

```javascript
// ❌ NEVER log these — security risk
logger.info("User password:", req.body.password);
logger.debug("JWT secret:", process.env.JWT_SECRET);
logger.info("Card details:", req.body.creditCard);
logger.debug("Full env:", process.env);

// ❌ NEVER log PII (Personally Identifiable Information) at debug level
logger.debug("User data:", { email, ssn, dateOfBirth, address });

// ✅ Log only what you need — mask sensitive fields
logger.info("User authenticated", {
  userId: user.id,
  email: maskEmail(user.email), // alice@example.com → a***@example.com
});

function maskEmail(email) {
  const [local, domain] = email.split("@");
  return local[0] + "***@" + domain;
}
```

<hr />

## 15. Request ID Tracing.

### Why Request IDs?

Without request IDs, logs from concurrent requests are interleaved and impossible to correlate:

```
10:30:00 info  GET /users
10:30:00 info  GET /orders   ← concurrent request starts
10:30:01 debug DB query      ← which request is this for?
10:30:01 debug DB query      ← and this?
10:30:02 info  200 OK
10:30:02 info  500 ERROR
```

With request IDs, every log line for a request shares the same ID:

```
10:30:00 info  GET /users   [req:a3f2]
10:30:00 info  GET /orders  [req:b7c1]
10:30:01 debug DB query     [req:a3f2]
10:30:01 debug DB query     [req:b7c1]
10:30:02 info  200 OK       [req:a3f2]
10:30:02 error 500 ERROR    [req:b7c1]  ← instantly know which request failed
```

### Implementation

```javascript
// middleware/requestId.js
const { randomUUID } = require("crypto");

module.exports = function requestId(req, res, next) {
  // Use existing ID from upstream (reverse proxy, API gateway) or generate a new one
  req.requestId = req.headers["x-request-id"] || randomUUID();
  res.set("X-Request-ID", req.requestId);
  next();
};
```

```javascript
// index.js — must be first middleware
app.use(requestId);
app.use(express.json());
app.use(
  morgan(":method :url :status [:requestId]", {
    stream: morganStream,
  }),
);
```

### Attaching Request ID to All Logs

Pass `req.requestId` to every log call:

```javascript
// routes/users.js
router.get(
  "/:id",
  asyncHandler(async (req, res, next) => {
    logger.debug("Fetching user", {
      requestId: req.requestId,
      userId: req.params.id,
    });

    const user = await User.findById(req.params.id);

    if (!user) {
      logger.warn("User not found", {
        requestId: req.requestId,
        userId: req.params.id,
      });
      return next(new AppError("User not found", 404, "USER_NOT_FOUND"));
    }

    logger.info("User fetched successfully", {
      requestId: req.requestId,
      userId: user.id,
    });
    res.json({ status: "success", data: user });
  }),
);
```

### Using `AsyncLocalStorage` for Automatic Context

For larger apps, manually passing `req.requestId` to every logger call is tedious. `AsyncLocalStorage` (built into Node.js) solves this:

```javascript
// utils/requestContext.js
const { AsyncLocalStorage } = require("async_hooks");
const storage = new AsyncLocalStorage();

module.exports = {
  // Middleware: start a new context for each request
  middleware(req, res, next) {
    storage.run({ requestId: req.requestId }, next);
  },

  // Get the current request's context from anywhere in the call stack
  getContext() {
    return storage.getStore() || {};
  },
};
```

```javascript
// config/logger.js — automatically include requestId from context
const { getContext } = require("../utils/requestContext");

const logger = winston.createLogger({
  format: combine(
    timestamp(),
    // Add requestId to every log entry automatically
    winston.format((info) => {
      const { requestId } = getContext();
      if (requestId) info.requestId = requestId;
      return info;
    })(),
    json(),
  ),
  transports: [new winston.transports.Console()],
});
```

<hr />

## 16. Error Monitoring Services.

### The Role of Error Monitoring

Logs tell you what happened. Error monitoring services tell you **when it started happening**, **how often**, **which users are affected** and **alert your team in real time**.

### Sentry

Sentry is the most widely used error monitoring service for Node.js apps:

```bash
npm install @sentry/node
```

```javascript
// config/sentry.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN, // your Sentry project DSN
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% of transactions — lower in high-traffic prod
});

module.exports = Sentry;
```

```javascript
// index.js — Sentry must be initialized before Express
const Sentry = require("./config/sentry");
const express = require("express");
const app = express();

// Sentry request handler — FIRST middleware
app.use(Sentry.Handlers.requestHandler());

// Routes
app.use("/api/v1/users", usersRouter);

// Sentry error handler — BEFORE your own error handler
app.use(Sentry.Handlers.errorHandler());

// Your custom error handler — AFTER Sentry
app.use(errorHandler);
```

**What Sentry captures automatically:**

- Stack traces with source maps
- Request URL, method, headers, body
- User context (if you call `Sentry.setUser()`)
- Environment, release version
- Error frequency and first/last occurrence
- Affected users count

### Manual Error Capture

```javascript
const Sentry = require("@sentry/node");

// Capture a specific error manually
try {
  await riskyOperation();
} catch (err) {
  // Only capture non-operational errors (real bugs)
  if (!err.isOperational) {
    Sentry.captureException(err, {
      extra: {
        requestId: req.requestId,
        userId: req.user?.id,
        context: "Payment processing",
      },
    });
  }
  next(err);
}

// Capture a message (non-error)
Sentry.captureMessage("Unusual activity detected", {
  level: "warning",
  extra: { userId: req.user.id, actionsPerMinute: 47 },
});
```

<hr />

## 17. Production vs Development Error Responses.

### Development (Show Everything).

```javascript
// Development response — full detail for debugging
{
  "status":     "fail",
  "statusCode": 404,
  "code":       "USER_NOT_FOUND",
  "message":    "User with id 99 not found",
  "stack":      "AppError: User with id 99 not found\n    at /app/routes/users.js:42:15\n    at ...",
  "details":    null
}

// Development 500 — shows the real error message
{
  "status":     "error",
  "statusCode": 500,
  "code":       "ERROR",
  "message":    "Cannot read properties of undefined (reading 'email')",
  "stack":      "TypeError: Cannot read properties of undefined...\n    at ..."
}
```

### Production (Safe Responses).

```javascript
// Production — operational error (4xx) — safe to expose
{
  "status":     "fail",
  "statusCode": 404,
  "code":       "USER_NOT_FOUND",
  "message":    "User with id 99 not found"
}

// Production — programmer error (5xx) — never expose details
{
  "status":     "error",
  "statusCode": 500,
  "code":       "INTERNAL_SERVER_ERROR",
  "message":    "Something went wrong. Please try again later."
}
// The real error is in the logs and Sentry — never in the response
```

### The Decision Tree

```
Error received by errorHandler
    │
    ├── Is NODE_ENV === 'development'?
    │       └── YES → Return full details: message, code, stack
    │
    └── NODE_ENV === 'production'
            │
            ├── Is err.isOperational === true? (AppError)
            │       └── YES → Return: message, code, statusCode (safe)
            │
            └── Is err.isOperational === false? (Bug, unexpected error)
                    └── YES → Log full error internally
                              Return generic: "Something went wrong"
                              Alert Sentry
```

<hr />

## 18. Complete Error Handling Architecture.

### Full Project Structure

```
my-api/
├── config/
│   ├── logger.js         ← Winston configuration
│   └── sentry.js         ← Sentry initialization (optional)
├── middleware/
│   ├── requestId.js      ← UUID per request
│   ├── requestLogger.js  ← custom colored logger
│   ├── notFound.js       ← 404 handler
│   └── errorHandler.js   ← centralized error handler
├── utils/
│   ├── AppError.js       ← custom error class
│   └── asyncHandler.js   ← async route wrapper
├── routes/
│   └── users.js
├── app.js                ← Express setup (middleware + routes)
├── index.js              ← server startup + process handlers
└── .env
```

### `app.js` — Clean Separation of Express Config

```javascript
// app.js
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const { logger, morganStream } = require("./config/logger");
const requestId = require("./middleware/requestId");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const usersRouter = require("./routes/users");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ── Request setup ─────────────────────────────────────────────────────────────
app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan("combined", { stream: morganStream }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/users", usersRouter);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// ── Error handling (always last) ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
```

### `index.js` (Server + Process Handlers).

```javascript
// index.js
const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, env: process.env.NODE_ENV });
});

// ── Graceful shutdown helpers ─────────────────────────────────────────────────
function shutdown(signal, exitCode) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(exitCode);
  });
  // Force shutdown after 30s if server hasn't closed
  setTimeout(() => {
    logger.error("Could not close server in time — forcing shutdown");
    process.exit(1);
  }, 30000);
}

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  shutdown("unhandledRejection", 1);
});

process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));
```

### `middleware/errorHandler.js` (The Final Version).

```javascript
// middleware/errorHandler.js
const AppError = require("../utils/AppError");
const logger = require("../config/logger");

// Transform known non-AppError types into operational AppErrors
function normalizeError(err) {
  // Express body-parser JSON syntax error
  if (err.type === "entity.parse.failed")
    return new AppError("Invalid JSON in request body", 400, "INVALID_JSON");

  // JWT errors (Week-11)
  if (err.name === "JsonWebTokenError")
    return new AppError("Invalid authentication token", 401, "INVALID_TOKEN");
  if (err.name === "TokenExpiredError")
    return new AppError(
      "Authentication token has expired",
      401,
      "TOKEN_EXPIRED",
    );

  // MongoDB errors
  if (err.name === "CastError")
    return new AppError(
      `Invalid value for field ${err.path}`,
      400,
      "INVALID_FIELD_VALUE",
    );
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return new AppError(`${field} already exists`, 409, "DUPLICATE_VALUE");
  }

  return err; // return as-is if not a known type
}

module.exports = function errorHandler(err, req, res, next) {
  const error = normalizeError(err);
  const statusCode = error.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  // Log 5xx errors with full context
  if (statusCode >= 500) {
    logger.error("Request failed with 5xx", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
  } else if (statusCode >= 400) {
    // Log 4xx at warn level (client error, not a server problem)
    logger.warn("Request failed with 4xx", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code: error.code,
      message: error.message,
    });
  }

  // Build response
  const isOperational = error.isOperational === true;

  if (isDev) {
    return res.status(statusCode).json({
      status: error.status || "error",
      statusCode,
      code: error.code || "ERROR",
      message: error.message,
      ...(error.details && { details: error.details }),
      stack: error.stack,
    });
  }

  // Production
  if (isOperational) {
    return res.status(statusCode).json({
      status: error.status,
      statusCode,
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }

  // Non-operational (bug) — generic response
  return res.status(500).json({
    status: "error",
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong. Please try again later.",
  });
};
```

<hr />

## Assignment.

1. Error Handling Pipeline (Tasks API).

   **What you practice:**

   `AppError` class with `statusCode`, `code`, `isOperational`; `asyncHandler` wrapper; `requestId` middleware; centralized `errorHandler` that normalizes known errors (JSON parse, JWT); `notFound` middleware; field-level validation with `details[]`; `409 Conflict` for duplicates; deliberately triggering programmer errors vs operational errors to observe the different responses; and process-level handlers for `uncaughtException` and `unhandledRejection`.

   **Requirements:**
   - Full CRUD on `/tasks` (in-memory store)
   - `AppError(message, statusCode, code)` — `isOperational = true`, correct `status` (fail/error)
   - `asyncHandler` wrapper — no `try/catch` in any route handler
   - `requestId` middleware — UUID on every request, `X-Request-ID` response header
   - `notFound` middleware — 404 for unknown routes
   - `errorHandler` — normalizes `entity.parse.failed` (JSON syntax) and JWT errors; dev shows stack, prod hides internals for non-operational errors
   - Field-level validation (title min 3 chars, status must be `todo|in-progress|done`)
   - `GET /tasks/crash/programmer` — triggers a TypeError (non-operational)
   - `GET /tasks/crash/operational` — triggers an AppError (operational)
   - Process handlers: `uncaughtException`, `unhandledRejection`, `SIGTERM`

   [Solution](./Assignment/code1/)

   **Postman Test Cases — A1**

   ```
   # Normal usage
   GET  http://localhost:3001/tasks
   GET  http://localhost:3001/tasks?status=todo
   GET  http://localhost:3001/tasks?priority=high
   GET  http://localhost:3001/tasks/2
   GET  http://localhost:3001/tasks/99           → 404 TASK_NOT_FOUND
   GET  http://localhost:3001/tasks/abc          → 400 INVALID_ID

   # Validation errors
   POST http://localhost:3001/tasks  Body: {}                                 → 400 VALIDATION_ERROR (details[])
   POST http://localhost:3001/tasks  Body: { "title": "Hi", "status": "done"} → 400 (title too short)
   POST http://localhost:3001/tasks  Body: { "title": "Learn", "status": "invalid" } → 400 (bad status)

   # Create + duplicate
   POST http://localhost:3001/tasks  Body: { "title": "New Task", "status": "todo" }  → 201
   POST http://localhost:3001/tasks  Body: { "title": "New Task", "status": "todo" }  → 409 DUPLICATE_TASK

   # Partial update
   PATCH http://localhost:3001/tasks/1  Body: { "status": "in-progress" }
   PATCH http://localhost:3001/tasks/1  Body: { "priority": "invalid" }  → 400 VALIDATION_ERROR

   # Delete
   DELETE http://localhost:3001/tasks/4   → 204

   # Error behaviour (set NODE_ENV=production to see difference)
   GET http://localhost:3001/tasks/crash/programmer   → 500 (stack hidden in prod)
   GET http://localhost:3001/tasks/crash/operational  → 503 (message always visible)

   # 404 from notFound middleware
   GET http://localhost:3001/nonexistent              → 404 ROUTE_NOT_FOUND

   # Malformed JSON → normalised to 400 INVALID_JSON
   POST http://localhost:3001/tasks
   Header: Content-Type: application/json
   Body (raw text): "{ bad json }"
   ```

2. Orders API with Winston Logging.

   **What you practice:**

   Winston logger setup (dev colorised format vs prod JSON), Morgan routed through Winston so all logs go to one place, log levels used correctly (`debug`/`info`/`warn`/`error`) at each event, `requestId` in every log call, structured log events (`order.created`, `order.cancelled`), logging context on errors (`method`, `url`, `statusCode`, `userId`), and file transports in production.

   **Requirements:**
   - `config/logger.js` — Winston with dev (colorised printf) and prod (JSON) formats, file transports in prod, `morganStream` export
   - Morgan writes through `morganStream` to Winston
   - `requestId` included in every logger call
   - `logger.debug` for diagnostic detail, `logger.info` for business events, `logger.warn` for suspicious/handled failures, `logger.error` for 5xx
   - Full CRUD on `/orders` plus `POST /orders/:id/cancel` action
   - All middleware from A1: `AppError`, `asyncHandler`, `notFound`, `errorHandler`
   - Process handlers using `logger.error` instead of `console.error`

   [Solution](./Assignment/code2/)

   **Postman Test Cases - A2**

   ```
   # Watch the terminal — observe log level and structure for each call
   GET  http://localhost:3002/orders                          → debug + info log
   GET  http://localhost:3002/orders?status=pending           → debug + info log
   GET  http://localhost:3002/orders/1                        → debug log
   GET  http://localhost:3002/orders/99                       → warn log (not found)
   GET  http://localhost:3002/orders/abc                      → warn log (invalid ID)
   POST http://localhost:3002/orders  Body: {}                → warn log (validation)
   POST http://localhost:3002/orders  Body: { "userId":1, "product":"Mouse", "quantity":2 } → info log
   POST http://localhost:3002/orders/4/cancel                 → info log
   POST http://localhost:3002/orders/1/cancel                 → warn (delivered)
   DELETE http://localhost:3002/orders/3                      → info log
   GET  http://localhost:3002/orders/crash/error              → error log + 500
   ```

3. Users API - Full Production Architecture.

   **What you practice:**

   Complete production-grade error handling and logging architecture split across `app.js` and `index.js`; PII masking (`maskEmail` — never log full email addresses); sensitive field sanitization (`password`, `internalNotes` stripped from every response); `normalizeError` that handles JSON parse, JWT, CastError, duplicate key (MongoDB preview), and Mongoose validation errors; structured log events using dot-notation names (`user.created`, `user.deleted`); `gracefulShutdown` helper with 30-second forced-exit timeout; all process signals (`SIGTERM`, `SIGINT`, `uncaughtException`, `unhandledRejection`).

   **Requirements:**
   - `app.js` — Express setup only (middleware, routes, error handling)
   - `index.js` — server startup + all process handlers + `gracefulShutdown(signal, exitCode)`
   - `config/logger.js` — Winston with dev/prod formats, file transports, `morganStream`
   - `maskEmail(email)` — `alice@example.com → a***@example.com` — used before every log
   - `sanitizeUser(user)` — strips `password` and `internalNotes` before every response
   - Full CRUD on `/users` with field-level validation (name, email, password)
   - `normalizeError` normalises: JSON parse → `INVALID_JSON`, JWT → `INVALID_TOKEN`, `TokenExpiredError` → `TOKEN_EXPIRED`, `CastError` → `INVALID_FIELD_VALUE`, duplicate key (code 11000) → `DUPLICATE_VALUE`
   - `GET /users/crash/programmer` — TypeError (non-operational)
   - `GET /users/crash/operational` — AppError (operational)
   - `GET /health` — server uptime, env, requestId

   [Solution](./Assignment/code3/)

   **Postman Test Cases.**

   ```
   # Health check
   GET http://localhost:3003/health

   # Users — normal usage
   GET  http://localhost:3003/users                    → check: no password, no internalNotes
   GET  http://localhost:3003/users?role=admin
   GET  http://localhost:3003/users/1
   GET  http://localhost:3003/users/99                 → 404 USER_NOT_FOUND (warn log)
   GET  http://localhost:3003/users/abc                → 400 INVALID_ID    (warn log)

   # Validation
   POST http://localhost:3003/users  Body: {}           → 400 VALIDATION_ERROR (details[])
   POST http://localhost:3003/users  Body: { "name":"Al","email":"bad","password":"short" }

   # Duplicate email
   POST http://localhost:3003/users  Body: { "name":"Alice2","email":"alice@example.com","password":"validpass123" } → 409

   # Create successfully — check log: maskedEmail logged, password NOT logged
   POST http://localhost:3003/users  Body: { "name":"Dave","email":"dave@example.com","password":"securepass1" }

   # PATCH — check email conflict
   PATCH http://localhost:3003/users/2  Body: { "email":"alice@example.com" }  → 409 EMAIL_CONFLICT

   # Delete
   DELETE http://localhost:3003/users/3  → 204 + user.deleted log

   # Error behaviour
   GET http://localhost:3003/users/crash/programmer   → 500, error log, stack in dev only
   GET http://localhost:3003/users/crash/operational  → 503, warn log, message always visible

   # Test error normalizer — send malformed JSON
   POST http://localhost:3003/users
   Header: Content-Type: application/json
   Body (raw string): "{ bad json }"           → 400 INVALID_JSON
   ```
