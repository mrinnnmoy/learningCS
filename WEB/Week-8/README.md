# List of things learned.

## 1. HTTP Fundamentals.

### What is HTTP?

**HTTP** (HyperText Transfer Protocol) is the foundation of data communication on the web.

It is an **application-layer protocol** that defines how messages are formatted and transmitted between a **client** (browser, mobile app, API consumer) and a **server**.

Every time you open a webpage, submit a form, or call an API. HTTP is at work.

```
Client                          Server
  |                               |
  |  --- HTTP Request ----------> |
  |                               |  (processes request)
  |  <-- HTTP Response ---------- |
  |                               |
```

### HTTP vs HTTPS.

| Feature     | HTTP                              | HTTPS                  |
| ----------- | --------------------------------- | ---------------------- |
| Full name   | HyperText Transfer Protocol       | HTTP Secure            |
| Port        | 80                                | 443                    |
| Encryption  | None (plaintext)                  | TLS/SSL encrypted      |
| Data safety | Interceptable (Man-in-the-middle) | Encrypted in transit   |
| Use today   | Rare (legacy)                     | Standard for all sites |

HTTPS wraps HTTP inside a **TLS (Transport Layer Security)** tunnel.

The HTTP protocol itself doesn't change. TLS just encrypts the transport.

### The Request-Response Cycle. (Step-by-Step)

1. **User types :** `https://api.example.com/users` in browser or app makes an API call
2. **DNS resolution :** domain name is resolved to an IP address
3. **TCP connection :** established (3-way handshake: SYN → SYN-ACK → ACK)
4. **TLS handshake :** (for HTTPS) — certificates verified, encryption negotiated
5. **Client sends HTTP Request :** — method, headers, optional body
6. **Server receives request :** — routes it to the correct handler
7. **Server processes :** — queries DB, runs logic, builds response
8. **Server sends HTTP Response :** — status code, headers, body
9. **Client receives response :** — parses it, renders or processes data
10. **Connection kept alive :** (HTTP/1.1+ keep-alive) or closed

### HTTP Versions.

| Version  | Year | Key Feature                                                                             |
| -------- | ---- | --------------------------------------------------------------------------------------- |
| HTTP/1.0 | 1996 | New connection per request                                                              |
| HTTP/1.1 | 1997 | Persistent connections, pipelining                                                      |
| HTTP/2   | 2015 | Multiplexing (multiple requests on one connection), header compression, binary protocol |
| HTTP/3   | 2022 | Built on QUIC (UDP-based), faster connection setup, better on lossy networks            |

> You mostly write HTTP/1.1-style code. HTTP/2 and HTTP/3 are handled transparently by the server (nginx, CDN, etc.) without changing your Express code.

### Stateless Nature of HTTP.

HTTP is **stateless**. Each request is completely independent. The server has no memory of previous requests.

```
Request 1: GET /login    → Server has no idea who you are
Request 2: GET /profile  → Server still has no idea who you are (!)
```

This is why we need **sessions**, **cookies**, and **tokens (JWT)** — they artificially add state on top of a stateless protocol. (Will be covered in Week-11)

<hr />

## 2. HTTP Request Structure.

Every HTTP request has three parts:

- **Request Line**,
- **Headers** &
- **Body** (optional).

Here's an example of an HTTP request.

```
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
User-Agent: Mozilla/5.0

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Request Line.

```
POST /api/users HTTP/1.1
^^^^  ^^^^^^^^^^  ^^^^^^^
|     |           HTTP version
|     URL path
HTTP method
```

### Request Headers.

Headers are **key-value metadata** about the request.

| Header           | Purpose                            | Example             |
| ---------------- | ---------------------------------- | ------------------- |
| `Host`           | Target server hostname             | `api.example.com`   |
| `Content-Type`   | Format of the request body         | `application/json`  |
| `Accept`         | What formats the client can handle | `application/json`  |
| `Authorization`  | Authentication credentials         | `Bearer <token>`    |
| `User-Agent`     | Client identification              | `Mozilla/5.0 ...`   |
| `Cookie`         | Stored cookie data                 | `session=abc123`    |
| `Content-Length` | Size of the request body in bytes  | `47`                |
| `Origin`         | Where the request originates from  | `https://myapp.com` |

### Request Body.

Only present in `POST`, `PUT`, `PATCH` requests (not in `GET` or `DELETE`).

**Some Common body formats:**

```
// JSON (most common in APIs)
Content-Type: application/json
{ "name": "Alice", "age": 25 }

// HTML form submission
Content-Type: application/x-www-form-urlencoded
name=Alice&age=25

// File upload
Content-Type: multipart/form-data; boundary=----boundary
------boundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
... binary file data ...
```

### URL Anatomy.

```
https://api.example.com:3000/users/42/posts?sort=date&limit=10#section1
^^^^^   ^^^^^^^^^^^^^^^  ^^^^  ^^^^^^^^  ^^  ^^^^^^^^^^^^^^^^^  ^^^^^^^^
|       |                |     |         |   |                   Fragment
|       |                |     |         |   Query string
|       |                |     |         Path parameter (42)
|       |                |     Path
|       |                Port (optional, default 80/443)
|       Host/Domain
Protocol (Scheme)
```

| Part         | Example               | Notes                              |
| ------------ | --------------------- | ---------------------------------- |
| Protocol     | `https://`            | `http` or `https`                  |
| Host         | `api.example.com`     | Domain or IP                       |
| Port         | `:3000`               | Optional; defaults to 80/443       |
| Path         | `/users/42/posts`     | Resource location                  |
| Query string | `?sort=date&limit=10` | Optional key-value pairs           |
| Fragment     | `#section1`           | Browser-only; never sent to server |

<hr />

## 3. HTTP Response Structure.

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 82
Cache-Control: no-cache
Date: Mon, 01 Jan 2024 10:00:00 GMT

{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Status Line.

```
HTTP/1.1 200 OK
^^^^^^^  ^^^  ^^
|        |    Reason phrase (human-readable)
|        Status code (machine-readable)
HTTP version
```

### Response Headers.

| Header                        | Purpose                           | Example                    |
| ----------------------------- | --------------------------------- | -------------------------- |
| `Content-Type`                | Format of response body           | `application/json`         |
| `Content-Length`              | Size of body in bytes             | `82`                       |
| `Set-Cookie`                  | Instruct client to store a cookie | `session=abc; HttpOnly`    |
| `Cache-Control`               | Caching instructions              | `max-age=3600`             |
| `Location`                    | Redirect target URL               | `https://example.com/new`  |
| `ETag`                        | Resource version identifier       | `"abc123"`                 |
| `WWW-Authenticate`            | Auth method required              | `Bearer realm="api"`       |
| `Access-Control-Allow-Origin` | CORS allowed origins              | `*` or `https://myapp.com` |

### Compression.

Servers can compress response bodies to reduce transfer size.

```
// Client signals it can accept compressed responses:
Accept-Encoding: gzip, deflate, br

// Server compresses and signals it:
Content-Encoding: gzip
```

- `gzip` is most common;
- `br` (Brotli) is newer and more efficient.

The `compression` Express middleware handles this automatically.

<hr />

## 4. HTTP Methods.

### The Main Methods.

```
GET    /users          → get all users
GET    /users/42       → get user with id 42
POST   /users          → create a new user
PUT    /users/42       → replace user 42 entirely
PATCH  /users/42       → update specific fields of user 42
DELETE /users/42       → delete user 42
```

### Method Properties.

| Method    | Has Body | Idempotent | Safe | Use Case                         |
| --------- | -------- | ---------- | ---- | -------------------------------- |
| `GET`     | No       | Yes        | Yes  | Read/retrieve data               |
| `POST`    | Yes      | No         | No   | Create a resource                |
| `PUT`     | Yes      | Yes        | No   | Replace a resource entirely      |
| `PATCH`   | Yes      | No\*       | No   | Partial update                   |
| `DELETE`  | No       | Yes        | No   | Delete a resource                |
| `HEAD`    | No       | Yes        | Yes  | Like GET but no body             |
| `OPTIONS` | No       | Yes        | Yes  | CORS preflight, capability check |

### Idempotency & Safety. (Why they matter)

**Safe** = calling it never changes server state (read-only).

- `GET`, `HEAD`, `OPTIONS` are safe.
  **Idempotent** = calling it 1 time or 100 times produces the same result.
- `GET /users/42` → same result every time ✅
- `DELETE /users/42` → first call deletes, subsequent calls get 404 — but the end state is the same ✅
- `POST /users` → creates a new user each call → 100 calls = 100 users ❌

```javascript
// PUT replaces the entire resource — idempotent
PUT /users/42
{ "name": "Alice", "email": "alice@new.com", "age": 30 }

// PATCH only updates specified fields — partial
PATCH /users/42
{ "email": "alice@new.com" }
```

### `HEAD` and `OPTIONS`

```
HEAD /large-file.zip
→ Returns headers only (no body)
→ Use to check file size (Content-Length) before downloading

OPTIONS /api/users
→ Returns allowed methods: Allow: GET, POST, OPTIONS
→ Browsers send this automatically before CORS (cross-origin requests)
```

<hr />

## 5. HTTP Status Codes.

Status codes are **3-digit numbers** grouped by their first digit.

### 1xx - Informational.

| Code  | Name                | Meaning                                                |
| ----- | ------------------- | ------------------------------------------------------ |
| `100` | Continue            | Server received request headers, client should proceed |
| `101` | Switching Protocols | Upgrading to WebSocket                                 |

### 2xx - Success.

| Code  | Name       | When to Use                            |
| ----- | ---------- | -------------------------------------- |
| `200` | OK         | General success (GET, PUT, PATCH)      |
| `201` | Created    | Resource successfully created (POST)   |
| `204` | No Content | Success but no body to return (DELETE) |

```javascript
// 200 — GET request
res.status(200).json({ id: 1, name: "Alice" });

// 201 — POST (resource created)
res.status(201).json({ id: 99, name: "New User" });

// 204 — DELETE (nothing to return)
res.status(204).send();
```

### 3xx - Redirection.

| Code  | Name              | When to Use                                  |
| ----- | ----------------- | -------------------------------------------- |
| `301` | Moved Permanently | URL has permanently changed (SEO-important)  |
| `302` | Found             | Temporary redirect                           |
| `304` | Not Modified      | Cached version is still valid (no body sent) |

### 4xx - Client Errors.

| Code  | Name                 | When to Use                                     |
| ----- | -------------------- | ----------------------------------------------- |
| `400` | Bad Request          | Malformed request, validation failed            |
| `401` | Unauthorized         | Not authenticated (no valid token/session)      |
| `403` | Forbidden            | Authenticated but not authorized (wrong role)   |
| `404` | Not Found            | Resource doesn't exist                          |
| `409` | Conflict             | State conflict (e.g. email already registered)  |
| `422` | Unprocessable Entity | Request syntax is valid but semantics are wrong |
| `429` | Too Many Requests    | Rate limit exceeded                             |

> **401 vs 403:** `401` = "I don't know who you are, please log in." `403` = "I know who you are, but you can't do this."

### 5xx - Server Errors.

| Code  | Name                  | When to Use                                 |
| ----- | --------------------- | ------------------------------------------- |
| `500` | Internal Server Error | Unhandled exception, generic server failure |
| `502` | Bad Gateway           | Upstream server returned invalid response   |
| `503` | Service Unavailable   | Server is down or overloaded                |

### Choosing the Right Status Code.

```javascript
// Validation failed
if (!req.body.email) {
  return res.status(400).json({ message: "Email is required" });
}

// Resource not found
const user = await User.findById(id);
if (!user) {
  return res.status(404).json({ message: "User not found" });
}

// Conflict — duplicate resource
const existing = await User.findOne({ email });
if (existing) {
  return res.status(409).json({ message: "Email already registered" });
}

// Success — resource created
res.status(201).json({ message: "User created", user });
```

<hr />

## 6. HTTP Headers Deep Dive.

### Request Headers You'll Use Most.

**`Authorization`** — sends credentials to the server

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...   (JWT token)
Authorization: Basic dXNlcjpwYXNz              (Base64 user:pass)
```

**`Content-Type`** — tells the server what format you're sending

```
Content-Type: application/json
Content-Type: application/x-www-form-urlencoded
Content-Type: multipart/form-data; boundary=----abc
```

**`Accept`** — tells the server what format you want back

```
Accept: application/json
Accept: text/html
Accept: */*  (anything is fine)
```

**`Origin`** — set automatically by the browser for cross-origin requests

```
Origin: https://myapp.com
```

### Response Headers You'll Set in Express.

**`Content-Type`** — `res.json()` sets this to `application/json` automatically

**`Location`** — used with 201 or 3xx redirects

```javascript
res.status(201).location(`/users/${newUser.id}`).json(newUser);
```

**`Cache-Control`** — controls how long clients cache the response

```javascript
res.set("Cache-Control", "public, max-age=3600"); // cache for 1 hour
res.set("Cache-Control", "no-store"); // never cache
```

**`Set-Cookie`** — instructs the browser to store a cookie

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

### Custom Headers.

By convention, custom headers use the `X-` prefix (though this is technically deprecated, it's still widely used):

```javascript
// Adding a unique request ID for tracing
res.set("X-Request-ID", "uuid-abc-123");
res.set("X-RateLimit-Remaining", "47");
res.set("X-RateLimit-Reset", "1620000000");
```

### `Content-Type` Values.

| Value                               | Use Case               |
| ----------------------------------- | ---------------------- |
| `application/json`                  | JSON APIs              |
| `text/html`                         | HTML pages             |
| `text/plain`                        | Plain text             |
| `multipart/form-data`               | File uploads           |
| `application/x-www-form-urlencoded` | HTML form submissions  |
| `application/octet-stream`          | Binary / file download |

<hr />

## 7. Query Params, Path Params & Request Body.

### Query Parameters.

Appended to the URL after `?`. Used for **filtering, sorting, searching, pagination**.

```
GET /users?role=admin&status=active&page=2&limit=10
```

```javascript
// In Express
app.get("/users", (req, res) => {
  const { role, status, page = 1, limit = 10 } = req.query;
  // All values are strings — convert as needed
  console.log(req.query);
  // { role: 'admin', status: 'active', page: '2', limit: '10' }
});
```

### Path Parameters.

Part of the URL path itself. Used to **identify a specific resource**.

```
GET /users/42
GET /users/42/posts/7
```

```javascript
app.get("/users/:userId/posts/:postId", (req, res) => {
  const { userId, postId } = req.params;
  // userId = '42', postId = '7' (always strings)
  const id = Number(userId); // convert as needed
});
```

### Request Body.

Used in `POST`, `PUT`, `PATCH` to **send data to create or update a resource**.

```javascript
// Client sends:
// POST /users
// Content-Type: application/json
// { "name": "Alice", "email": "alice@example.com" }

app.post("/users", (req, res) => {
  const { name, email } = req.body; // requires express.json() middleware
});
```

### Decision Rule - Which one to use?

| Scenario                             | Use                                                            |
| ------------------------------------ | -------------------------------------------------------------- |
| Identify a specific resource         | Path param (`/users/:id`)                                      |
| Optional filters, search, pagination | Query param (`?sort=name&page=2`)                              |
| Create or update resource data       | Request body                                                   |
| Sensitive data (passwords, tokens)   | Request body (never query params — they appear in server logs) |

```javascript
// ✅ Correct pattern
GET  /products?category=shoes&sort=price   // filter + sort
GET  /products/99                          // specific product
POST /products   body: { name, price }     // create product
PUT  /products/99  body: { name, price }   // replace product 99
```

<hr />

## 8. REST Architecture.

### What is REST?

**REST** (Representational State Transfer) is an **architectural style**. A set of constraints for designing networked APIs. It was defined by Roy Fielding in his 2000 doctoral dissertation.

An API that follows REST constraints is called a **RESTful API**.

### The 6 REST Constraints.

1. **Client-Server :** client and server are separate; they communicate only through the interface
2. **Stateless :** each request from client must contain all info needed; server stores no client state between requests
3. **Cacheable :** responses must define themselves as cacheable or non-cacheable
4. **Uniform Interface :** consistent, standardized interface (resources, methods, representations)
5. **Layered System :** client can't tell if it's connected directly to the server or through intermediaries (load balancer, cache, gateway)
6. **Code on Demand :** _(optional)_ server can send executable code to the client (e.g. JavaScript)

### Resource-Based Thinking.

REST treats everything as a **resource**, identified by a URL. Methods (verbs) act on those resources.

```
Resource: users
URL:      /users
Actions:  GET (list), POST (create)

Resource: a specific user
URL:      /users/42
Actions:  GET (read), PUT (replace), PATCH (update), DELETE (remove)
```

### URL Naming Conventions.

```
// ✅ CORRECT — nouns, plural, lowercase, hyphens for spaces
GET    /users
GET    /users/42
POST   /users
PUT    /users/42
DELETE /users/42
GET    /blog-posts
GET    /blog-posts/99/comments

// ❌ WRONG — verbs in URLs, inconsistent naming
GET /getUsers
POST /createUser
GET /user_list
DELETE /deleteUser?id=42
GET /BlogPosts
```

### Nested Resources.

```
GET     /users/42/posts        → all posts by user 42
GET     /users/42/posts/7      → post 7 by user 42
POST    /users/42/posts        → create a post for user 42
DELETE  /users/42/posts/7      → delete post 7 by user 42
```

> **Nesting depth:** Avoid going deeper than 2 levels (`/resource/:id/subresource`). Deeper nesting becomes hard to read and maintain.

### REST vs RPC vs GraphQL.

| Feature        | REST                | RPC (gRPC)                 | GraphQL                      |
| -------------- | ------------------- | -------------------------- | ---------------------------- |
| Structure      | Resource-based URLs | Function calls             | Single endpoint, queries     |
| Flexibility    | Medium              | Low                        | High                         |
| Over-fetching  | Common              | Common                     | Avoided                      |
| Learning curve | Low                 | Medium                     | High                         |
| Best for       | Standard CRUD APIs  | Microservices, low-latency | Complex, flexible data needs |

<hr />

## 9. Express.js Basics.

### What is Express.js?

Express is a **minimal, unopinionated web framework** for Node.js. It wraps Node's built-in `http` module with a cleaner API for routing and middleware.

**Raw Node.js `http` module (verbose):**

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ users: [] }));
  }
});

server.listen(3000);
```

**Same thing with Express (clean):**

```javascript
const express = require("express");
const app = express();

app.get("/users", (req, res) => res.json({ users: [] }));
app.listen(3000);
```

### Installation & Minimal Setup.

```bash
mkdir my-api && cd my-api
npm init -y
npm install express
npm install dotenv     # env vars
npm install --save-dev nodemon  # auto-restart on changes
```

```javascript
// index.js
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // parse form data

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

```json
// package.json scripts
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### Route Methods.

```javascript
app.get('/users', (req, res) => { ... });
app.post('/users', (req, res) => { ... });
app.put('/users/:id', (req, res) => { ... });
app.patch('/users/:id', (req, res) => { ... });
app.delete('/users/:id', (req, res) => { ... });
app.all('/users', (req, res) => { ... }); // matches ALL methods
```

### The `req` Object.

```javascript
app.post("/users/:id/posts", (req, res) => {
  // Path parameters
  console.log(req.params); // { id: '42' }
  console.log(req.params.id); // '42'

  // Query string
  console.log(req.query); // { sort: 'date', limit: '10' }
  console.log(req.query.sort); // 'date'

  // Request body (requires express.json() middleware)
  console.log(req.body); // { title: 'Hello', content: '...' }

  // Headers
  console.log(req.headers); // all headers object
  console.log(req.headers["authorization"]); // 'Bearer ...'
  console.log(req.get("Authorization")); // Express shorthand

  // Method and URL
  console.log(req.method); // 'POST'
  console.log(req.url); // '/users/42/posts?sort=date'
  console.log(req.path); // '/users/42/posts'

  // IP address
  console.log(req.ip); // '::1' (localhost)
});
```

### The `res` Object.

```javascript
app.get("/demo", (req, res) => {
  // Send JSON response
  res.json({ name: "Alice" });

  // Send text
  res.send("Hello World");

  // Set status code then send
  res.status(201).json({ id: 1, name: "Alice" });

  // Redirect
  res.redirect("/new-location");
  res.redirect(301, "/permanent-new-location");

  // Set a response header
  res.set("X-Custom-Header", "value");
  res.set({ "X-A": "1", "X-B": "2" }); // set multiple

  // Send a file
  res.sendFile("/path/to/file.html");

  // End with no body (for 204)
  res.status(204).end();
});
```

### Express Router.

`express.Router()` creates a **mini-application** for organizing routes modularly.

```javascript
// routes/users.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Get all users" });
});

router.get("/:id", (req, res) => {
  res.json({ message: `Get user ${req.params.id}` });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "User created", body: req.body });
});

router.put("/:id", (req, res) => {
  res.json({ message: `Replace user ${req.params.id}` });
});

router.delete("/:id", (req, res) => {
  res.status(204).end();
});

module.exports = router;
```

```javascript
// index.js
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

// Now:
// GET  /users       → router's GET /
// GET  /users/42    → router's GET /:id
// POST /users       → router's POST /
```

### Chaining Routes.

```javascript
// routes/products.js
router
  .route("/products")
  .get((req, res) => res.json({ message: "all products" }))
  .post((req, res) => res.status(201).json({ message: "created" }));

router
  .route("/products/:id")
  .get((req, res) => res.json({ id: req.params.id }))
  .put((req, res) => res.json({ message: "replaced" }))
  .patch((req, res) => res.json({ message: "updated" }))
  .delete((req, res) => res.status(204).end());
```

### Recommended Project Structure.

```
my-api/
├── config/
│   └── env.js            ← validated env vars (Week-7)
├── routes/
│   ├── index.js          ← mounts all routers
│   ├── users.js
│   └── products.js
├── middleware/
│   ├── logger.js
│   ├── errorHandler.js
│   └── notFound.js
├── controllers/          ← route handler logic (optional, for larger apps)
│   └── userController.js
├── index.js              ← entry point
├── .env
└── package.json
```

<hr />

## 10. Middleware. (Basics to Advanced)

### What is Middleware?

Middleware is a function that sits **in the request-response pipeline** that has access to `req`, `res` and `next`.

It can:

- Execute any code
- Modify `req` or `res`
- End the request-response cycle
- Call the next middleware in the stack

```javascript
function myMiddleware(req, res, next) {
  // do something
  next(); // pass to the next middleware
}
```

### The Middleware Pipeline.

```
Request → [middleware 1] → [middleware 2] → [route handler] → Response
              ↓ next()         ↓ next()
```

**Order matters!**

Middleware executes in the order it is registered with `app.use()`.

```javascript
app.use(express.json()); // 1st — runs for every request
app.use(requestLogger); // 2nd — runs for every request
app.use("/users", authGuard); // 3rd — runs only for /users routes
app.get("/users", handler); // 4th — final handler
```

### Built-in Middleware.

```javascript
// Parse JSON request bodies — required to use req.body for JSON
app.use(express.json());

// Parse URL-encoded bodies (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files from a folder
app.use(express.static("public"));
// Now GET /image.png serves public/image.png
```

### Third-party Middleware.

```bash
npm install morgan helmet compression cors
```

```javascript
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");

app.use(morgan("dev")); // HTTP request logger
app.use(helmet()); // sets security-related HTTP headers
app.use(compression()); // gzip compress responses
app.use(cors()); // enable CORS
```

### Application-Level vs Router-Level Middleware.

```javascript
// Application-level — runs for ALL routes
app.use(express.json());
app.use(morgan("dev"));

// Router-level — runs only for routes on that router
const router = express.Router();
router.use(authMiddleware); // only applies to this router's routes
router.get("/profile", handler);
```

### Writing Custome Middleware.

**Request Logger:**

```javascript
// middleware/logger.js
function requestLogger(req, res, next) {
  const start = Date.now();
  console.log(`→ ${req.method} ${req.path}`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`,
    );
  });

  next(); // must call next() or the request hangs forever
}

module.exports = requestLogger;
```

**Request ID Injector:**

```javascript
// middleware/requestId.js
const { randomUUID } = require("crypto");

function requestId(req, res, next) {
  req.id = randomUUID(); // attach to req object
  res.set("X-Request-ID", req.id); // add to response headers
  next();
}

module.exports = requestId;
```

**Basic Auth Guard:**

```javascript
// middleware/authGuard.js
function authGuard(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized — no token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Simple check (full JWT verification in Week-11)
  if (!token) {
    return res.status(401).json({ message: "Unauthorized — invalid token" });
  }

  req.token = token; // attach to req for downstream handlers
  next();
}

module.exports = authGuard;
```

### Error-Handling Middleware.

Express identifies error-handling middleware by its **4 arguments**: `(err, req, res, next)`.

```javascript
// middleware/errorHandler.js

// IMPORTANT: must be the LAST app.use() call
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Never send stack traces in production
  const response = {
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
```

### `next()` vs `next(err)`

```javascript
// next() — pass to the NEXT middleware in the chain
function logger(req, res, next) {
  console.log("logging...");
  next(); // continues to the next middleware
}

// next(err) — SKIP to the error handler middleware
async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new Error("User not found")); // jumps to error handler
    }
    res.json(user);
  } catch (err) {
    next(err); // passes unexpected errors to error handler
  }
}
```

### Complete Middleware Setup in `index.js`

```javascript
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");

const usersRouter = require("./routes/users");
const requestId = require("./middleware/requestId");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();
const PORT = process.env.PORT || 3000;

// Security & utilities
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestId);

// Routes
app.use("/users", usersRouter);

// 404 handler — after all routes
app.use(notFound);

// Error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
```

<hr />

## 11. CORS.

### The Same-Origin Policy.

Browsers enforce a **Same-Origin Policy (SOP)** — JavaScript on `https://myapp.com` cannot make requests to `https://api.otherdomain.com` by default.

Two URLs have the **same origin** only if all three match:

- **Protocol** (`https` vs `http`)
- **Domain** (`myapp.com` vs `api.myapp.com`)
- **Port** (`:3000` vs `:4000`)

```
https://myapp.com/page          ← origin: https://myapp.com
https://myapp.com/api/users     ← same origin ✅
http://myapp.com/api            ← different (http vs https) ❌
https://api.myapp.com/users     ← different subdomain ❌
https://myapp.com:3000/users    ← different port ❌
```

### Why CORS Exists.

CORS is the **browser's mechanism** to selectively relax SOP. The server declares which origins are allowed and the browser enforces it.

> CORS is **only a browser restriction**. Tools like Postman, curl and server-to-server requests are not subject to CORS.

### Simple vs Preflight Requests.

**Simple requests** — sent directly:

- Methods: `GET`, `POST`, `HEAD`
- No custom headers
- `Content-Type` is `text/plain`, `multipart/form-data`, or `application/x-www-form-urlencoded`

**Preflight requests** — browser sends `OPTIONS` first to check if the cross-origin request is allowed:

- Any method other than `GET`/`POST`/`HEAD`
- Custom headers (like `Authorization`)
- `Content-Type: application/json`

```
Browser                          Server
  |                                |
  | OPTIONS /api/users             |   ← preflight check
  | Origin: https://myapp.com      |
  | Access-Control-Request-Method: POST
  |                                |
  |    Access-Control-Allow-Origin: https://myapp.com
  |    Access-Control-Allow-Methods: GET, POST, PUT
  |    Access-Control-Allow-Headers: Content-Type, Authorization
  |                                |
  | POST /api/users  (actual req)  |   ← only if preflight was ok
  |                                |
```

### CORS Headers.

| Header                             | Direction | Meaning                                  |
| ---------------------------------- | --------- | ---------------------------------------- |
| `Origin`                           | Request   | Where the request came from              |
| `Access-Control-Allow-Origin`      | Response  | Who is allowed to access                 |
| `Access-Control-Allow-Methods`     | Response  | Which HTTP methods are allowed           |
| `Access-Control-Allow-Headers`     | Response  | Which request headers are allowed        |
| `Access-Control-Allow-Credentials` | Response  | Whether cookies/auth headers are allowed |
| `Access-Control-Max-Age`           | Response  | How long to cache preflight result       |

### Using the `cors` Package in Express.

```bash
npm install cors
```

**Allow all origins (development only!):**

```javascript
const cors = require("cors");
app.use(cors()); // Access-Control-Allow-Origin: *
```

**Allow specific origin:**

```javascript
app.use(
  cors({
    origin: "https://myapp.com",
  }),
);
```

**Allow multiple origins:**

```javascript
const allowedOrigins = ["https://myapp.com", "https://admin.myapp.com"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies and auth headers
    maxAge: 86400, // cache preflight for 24 hours
  }),
);
```

### Credentials & CORS.

If your frontend sends **cookies or Authorization headers**, you need:

```javascript
// Server
app.use(cors({ credentials: true, origin: "https://myapp.com" }));
// ⚠️ origin CANNOT be '*' when credentials: true

// Client (fetch)
fetch("https://api.myapp.com/users", {
  credentials: "include", // send cookies
});
```

### Common CORS Mistakes.

```javascript
// ❌ Forgetting to handle OPTIONS preflight
app.use(cors());
app.post("/users", handler); // POST works but OPTIONS preflight fails

// ✅ Fix — cors() handles OPTIONS automatically when used as app-level middleware
app.use(cors());

// ❌ Using '*' with credentials
app.use(cors({ origin: "*", credentials: true })); // browsers reject this

// ✅ Fix — use specific origin with credentials
app.use(cors({ origin: "https://myapp.com", credentials: true }));
```

<hr />

## 12. Postman.

### What is Postman?

Postman is a GUI tool for **testing and exploring APIs** without writing code. It lets you craft HTTP requests, inspect responses and organize test suites.

> **Download:** https://www.postman.com/downloads/

### Creating and Sending Requests.

1. Open Postman → New Request
2. Select method (`GET`, `POST`, etc.)
3. Enter URL: `http://localhost:3000/users`
4. Add headers (e.g. `Content-Type: application/json`)
5. For POST/PUT — go to **Body** → select **raw** → select **JSON**
6. Click **Send**

### Setting Headers.

In the **Headers** tab:

```
Key                   Value
Content-Type          application/json
Authorization         Bearer your-jwt-token-here
Accept                application/json
```

### Setting Request Body (JSON)

1. Select **Body** tab
2. Choose **raw**
3. Select **JSON** from the dropdown
4. Enter JSON:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

### Environment Variables in Postman.

Create an environment (e.g. "Development"):

| Variable  | Value                   |
| --------- | ----------------------- |
| `baseUrl` | `http://localhost:3000` |
| `token`   | `eyJhbGci...`           |

Then use in requests as `{{baseUrl}}/users` and `Bearer {{token}}`.

### Collections.

Group related requests into a **Collection** (e.g. "Users API"):

- `GET {{baseUrl}}/users`
- `POST {{baseUrl}}/users`
- `GET {{baseUrl}}/users/1`
- `PUT {{baseUrl}}/users/1`
- `DELETE {{baseUrl}}/users/1`

### Basic Tests in Postman.

In the **Tests** tab of a request:

```javascript
// Check status code
pm.test("Status is 201", () => {
  pm.response.to.have.status(201);
});

// Check response body
pm.test("Has user id", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property("id");
});

// Save a value for other requests
pm.test("Save token", () => {
  const json = pm.response.json();
  pm.environment.set("token", json.token);
});
```

<hr />

## 13. Logging.

### Why Logging Matters

- **Debugging :** understand what happened when something breaks
- **Monitoring :** track request patterns, error rates
- **Auditing :** who did what and when
- **Performance :** identify slow endpoints

### `console.log` vs Proper Logging

```javascript
// ❌ Bad — no structure, no levels, no timestamps
console.log("User created");
console.log(error);

// ✅ Good — structured, leveled, timestamped
logger.info({ event: "user.created", userId: 42 });
logger.error({ event: "db.error", error: err.message, stack: err.stack });
```

### `morgan` — HTTP Request Logger

`morgan` logs every incoming HTTP request automatically.

```bash
npm install morgan
```

```javascript
const morgan = require("morgan");

// Built-in formats:
app.use(morgan("dev")); // :method :url :status :response-time ms
app.use(morgan("combined")); // Apache combined log format (good for production)
app.use(morgan("tiny")); // minimal output

// dev output example:
// POST /users 201 12.345 ms - 48
```

**Custom morgan format:**

```javascript
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);
```

### Log Levels

| Level   | When to Use                                                   |
| ------- | ------------------------------------------------------------- |
| `error` | Unhandled errors, crashes, critical failures                  |
| `warn`  | Degraded state, deprecated usage, suspicious activity         |
| `info`  | Normal operations (server start, user login, request handled) |
| `http`  | HTTP request/response logging                                 |
| `debug` | Detailed info for debugging (disabled in production)          |

### `winston` — Production Logger

```bash
npm install winston
```

```javascript
// config/logger.js
const winston = require("winston");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // minimum level to log
  format: winston.format.combine(
    winston.format.timestamp(), // add timestamp
    winston.format.errors({ stack: true }), // include stack traces
    winston.format.json(), // output as JSON
  ),
  transports: [
    // Write errors to error.log file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to combined.log
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// In development — also print colorized output to console
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
```

**Using the logger:**

```javascript
const logger = require("./config/logger");

logger.info("Server started", { port: 3000, env: "development" });
logger.warn("Rate limit approaching", { userId: 42, requests: 95 });
logger.error("Database connection failed", { error: err.message });
logger.debug("Query executed", {
  query: "SELECT * FROM users",
  duration: "12ms",
});
```

### Structured Logging — Why It Matters in Production

```javascript
// ❌ Unstructured — hard to query in log systems
logger.info("User 42 logged in from 192.168.1.1 at 10:30 AM");

// ✅ Structured JSON — easy to filter, search, alert on
logger.info({
  event: "user.login",
  userId: 42,
  ip: "192.168.1.1",
  userAgent: req.get("User-Agent"),
  timestamp: new Date().toISOString(),
});
```

Structured logs can be parsed by log aggregation tools (Datadog, Logtail, Grafana Loki) for dashboards and alerts.

### Logging Request ID for Tracing

```javascript
// middleware/requestId.js
const { randomUUID } = require("crypto");

function requestIdMiddleware(req, res, next) {
  req.requestId = randomUUID();
  res.set("X-Request-ID", req.requestId);
  next();
}

// In any route or middleware — include requestId in all logs
logger.info({
  event: "user.created",
  requestId: req.requestId, // tie all logs for this request together
  userId: newUser.id,
});
```

<hr />

## 14. Error Handling.

### Types of Erros.

**Operational errors** — expected, runtime errors you anticipate:

- User not found
- Validation failed
- Database connection lost
- File not found

**Programmer errors** — bugs in the code you didn't expect:

- `TypeError: Cannot read property of undefined`
- `ReferenceError: x is not defined`
- Passing wrong type to a function

> Operational errors should be handled gracefully. Programmer errors should crash the process so they get noticed and fixed.

### Synchronous Error Handling.

```javascript
// Throw in a sync route — Express catches it automatically
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new Error("Invalid user ID"); // Express catches this and calls error handler
  }
  // ...
});
```

### Asynchronous Error Handling.

For `async` functions, Express does NOT catch thrown errors automatically (prior to Express 5).

```javascript
// ❌ Express won't catch async errors without next(err) in Express 4
app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id); // if this throws, it crashes!
});

// ✅ Always wrap async route handlers with try/catch + next(err)
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err); // pass to error handler middleware
  }
});
```

**Helper to avoid repetition — `asyncHandler` wrapper:**

```javascript
// utils/asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;

// Usage — no try/catch needed!
const asyncHandler = require("./utils/asyncHandler");

app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  }),
);
```

### Custom `AppError` Class.

Create a custom error class that carries an HTTP status code:

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
    this.isOperational = true; // mark as operational (expected) error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

```javascript
// Usage in route handlers
const AppError = require("./utils/AppError");

app.get(
  "/users/:id",
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError("User not found", 404)); // clean, specific
    }
    res.json(user);
  }),
);
```

### Centralised Error Handler Middleware.

```javascript
// middleware/errorHandler.js
const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log the error
  if (err.statusCode >= 500) {
    console.error(`[ERROR] ${err.statusCode} — ${err.message}`);
    console.error(err.stack);
  }

  // Send response
  res.status(err.statusCode).json({
    status: err.status || "error",
    statusCode: err.statusCode,
    message: err.message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
```

### Handling 404 — Catching Undefined Routes

```javascript
// middleware/notFound.js
const AppError = require("../utils/AppError");

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

module.exports = notFound;
```

```javascript
// index.js — order is critical
app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.use(notFound); // 404 — after ALL routes
app.use(errorHandler); // error handler — absolutely last
```

### Consistent Error Response Shape

Always return errors in a predictable shape so frontend clients can handle them uniformly:

```json
{
  "status": "fail",
  "statusCode": 404,
  "message": "User not found"
}
```

```json
{
  "status": "error",
  "statusCode": 500,
  "message": "Internal Server Error"
}
```

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Email is required"
}
```

### Never Expose Stack Traces in Production

```javascript
// ❌ Leaks internal details to attackers
res.status(500).json({
  message: "Something broke",
  stack: err.stack, // never in production
  internalCode: "DB_CONN_FAIL", // never expose internals
});

// ✅ Safe — generic message in production, details in development
res.status(500).json({
  status: "error",
  message:
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message,
  ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
});
```

<hr />

## Assignment.

1. Build a complete REST API for a Books collection using Express.js, all 5 HTTP methods, correct status codes and query filtering.

   **Requirements:**
   - Full CRUD — `GET`, `POST`, `PUT`, `PATCH`, `DELETE` on `/books`
   - In-memory array as the data store (no database)
   - `GET /books` supports optional query filters: `?genre=` and `?author=`
   - `POST` and `PUT` require `title` and `author` — return `400` if missing
   - Return `404` for requests on a non-existent book ID
   - `POST` returns `201` with a `Location` header
   - `DELETE` returns `204` (no body)
   - `notFound` and `errorHandler` middleware
   - Consistent response shape: `{ status, count?, data }`

   **Postman Test Cases:**

   ```
   GET    http://localhost:3001/books
   GET    http://localhost:3001/books?genre=Tech
   GET    http://localhost:3001/books?author=Herbert
   GET    http://localhost:3001/books/2
   GET    http://localhost:3001/books/99           → 404
   POST   http://localhost:3001/books              Body: { "title": "YDKJS", "author": "Kyle Simpson", "genre": "Tech" }
   POST   http://localhost:3001/books              Body: { "title": "" }   → 400
   PUT    http://localhost:3001/books/1            Body: { "title": "New Title", "author": "Same Author" }
   PATCH  http://localhost:3001/books/1            Body: { "genre": "Engineering" }
   DELETE http://localhost:3001/books/3            → 204
   GET    http://localhost:3001/missing-route      → 404
   ```

   **Expected Responses:**
   - `GET /books?genre=Tech` → 200:

     ```
     {
     "status": "success",
     "count": 2,
     "data": [
         { "id": 1, "title": "The Pragmatic Programmer", "author": "Andrew Hunt", "genre": "Tech", "year": 1999 },
         { "id": 2, "title": "Clean Code", "author": "Robert Martin", "genre": "Tech", "year": 2008 }
     ]
     }
     ```

   - `POST /books` without title → 400:

     ```
     { "status": "fail", "statusCode": 400, "message": "title and author are required fields" }
     ```

   - `GET /books/99` → 404:

     ```
     { "status": "fail", "statusCode": 404, "message": "Book with id 99 not found" }
     ```

   [Solution](./Assignment/code1/)

2. Build a Users API that demonstrates the full middleware pipeline — `requestId`, custom logger, `validateBody`, `asyncHandler`, `AppError` and centralized error handling.

   **Requirements:**
   - `requestId` middleware — inject `X-Request-ID` header on every response
   - Custom colored `requestLogger` middleware — log `METHOD PATH → STATUS (Xms) [requestId]`
   - `validateBody(fields)` factory middleware — reusable field validation
   - `AppError` class with `statusCode`, `status`, `isOperational`
   - `asyncHandler` wrapper — no try/catch in route handlers
   - Full CRUD on `/users` with `GET`, `POST`, `PATCH`, `DELETE`
   - `GET /users` supports `?role=` filter
   - `POST` returns `409` if email already exists
   - A `GET /users/crash/now` route that deliberately throws — proves the error handler works
   - Include `requestId` in all error responses

   **Postman Test Cases:**

   ```
   GET    http://localhost:3002/users
   GET    http://localhost:3002/users?role=admin
   GET    http://localhost:3002/users/1
   GET    http://localhost:3002/users/99            → 404 with requestId
   POST   http://localhost:3002/users               Body: { "name": "Carol", "email": "carol@x.com" }
   POST   http://localhost:3002/users               Body: { "name": "Alice", "email": "alice@example.com" } → 409
   POST   http://localhost:3002/users               Body: { "name": "X" }  → 400 missing email
   PATCH  http://localhost:3002/users/1             Body: { "role": "superadmin" }
   DELETE http://localhost:3002/users/2             → 204
   GET    http://localhost:3002/users/crash/now     → 500 (check requestId in response)
   ```

   [Solution](./Assignment/code2/)

3. Build a production-grade Products API combining everything from Week-8: validated config, `helmet`, custom CORS whitelist, all middleware, full CRUD, query filtering, a `/products/stats` analytics endpoint, and proper error handling with request tracing.

   **Requirements:**
   - Config via `config/env.js` — `PORT`, `NODE_ENV`, `ALLOWED_ORIGINS`, `LOG_LEVEL`
   - `helmet()` for security headers
   - Custom CORS — whitelist from env var, reject unknown origins with a descriptive error
   - `requestId` on every request
   - `morgan` for HTTP logging
   - Full CRUD on `/products`
   - `GET /products` supports `?category=`, `?minPrice=`, `?maxPrice=`, `?sort=price|name`
   - `GET /products/stats` — returns total inventory value, avg price, categories list, low-stock items
   - `POST` validates required fields, rejects duplicate names with `409`
   - `PATCH` only updates fields that are actually sent
   - `AppError`, `asyncHandler`, centralized `errorHandler` with requestId in responses
   - `notFound` middleware for undefined routes

   **Postman Test Cases:**

   ```
   GET    http://localhost:3003/products
   GET    http://localhost:3003/products?category=Electronics
   GET    http://localhost:3003/products?maxPrice=100&sort=price
   GET    http://localhost:3003/products/stats
   GET    http://localhost:3003/products/1
   GET    http://localhost:3003/products/99             → 404 + requestId + timestamp
   GET    http://localhost:3003/products/abc            → 400 'must be a number'
   POST   http://localhost:3003/products                Body: { "name": "Monitor", "category": "Electronics", "price": 399, "stock": 10 }
   POST   http://localhost:3003/products                Body: { "name": "Laptop" } → 400 missing fields
   POST   http://localhost:3003/products                Body: { "name": "Laptop", "category": "X", "price": 10 } → 409 already exists
   PUT    http://localhost:3003/products/1              Body: { "name": "Gaming Laptop", "category": "Electronics", "price": 1299.99, "stock": 5 }
   PATCH  http://localhost:3003/products/2              Body: { "price": 199.99 }
   DELETE http://localhost:3003/products/3              → 204
   GET    http://localhost:3003/non-existent-route      → 404 'Route not found'
   ```

   **Expected Responses:**
   - `GET /products/stats`

     ```
     {
     "status": "success",
     "data": {
         "totalProducts": 4,
         "totalInventoryValue": 20557.45,
         "averagePrice": 333.74,
         "categories": ["Electronics", "Furniture", "Stationery"],
         "lowStockItems": [
         { "id": 2, "name": "Desk Chair", "stock": 8 }
         ]
     }
     }
     ```

   - `GET /products/99` → 404

     ```
     {
     "status": "fail",
     "statusCode": 404,
     "message": "Product with id 99 not found",
     "requestId": "a3f2b1c4-...",
     "timestamp": "2024-01-15T10:30:00.000Z"
     }
     ```

   [Solution](./Assignment/code3/)
