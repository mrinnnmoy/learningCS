# List of things learned.

## 1. What is REST API Design?

### REST vs RESTful - The Difference.

**REST** (Representational State Transfer) is an **architectural style**. A set of 6 constraints defined by Roy Fielding in his 2000 dissertation. It is not a protocol or a standard.

**RESTful** is the adjective applied to an API that _follows_ REST constraints.

In practice, most APIs called "REST APIs" are actually **REST-like**. They use HTTP methods and URLs in a resource-oriented way but don't fully implement every constraint (especially HATEOAS).

```
Fully RESTful API:  follows all 6 constraints including HATEOAS
REST-like API:      uses HTTP methods + resource URLs, skips HATEOAS
REST API (common):  people use this term for both of the above
```

> For this week, "REST API design" means building clean, predictable, developer-friendly HTTP APIs — which is what the industry calls REST.

### Why Good API Design Matters.

An API is a **product**. Its consumers are developers. Poor design creates:

- Confusion : Developers have to guess what a route does
- Bugs : Inconsistent behavior leads to wrong client assumptions
- Tech debt : Bad design is hard to change once consumers depend on it
- Support burden : Unclear APIs generate constant questions

Good design creates:

- **Predictability** : If you know one endpoint, you can guess the others
- **Consistency** : Same patterns everywhere, no surprises
- **Discoverability** : The API communicates its own structure
- **Evolvability** : Well-versioned APIs can change without breaking clients

### API-First Design Thinking.

**API-first** means designing the API contract _before_ writing any implementation code.

**Traditional approach (code-first):**

```
Write code → expose what's convenient → document after
```

**API-first approach:**

```
Design the API contract (URLs, methods, request/response shapes)
→ Get feedback from consumers
→ Write implementation
→ Documentation is auto-generated from the contract
```

Tools like **OpenAPI/Swagger** let you write the spec first, generate docs and even mock servers from it and then implement.

### What Makes a Good API vs a Bad API.

| Good API                              | Bad API                                   |
| ------------------------------------- | ----------------------------------------- |
| Consistent naming and structure       | Inconsistent conventions everywhere       |
| Meaningful status codes               | `200 OK` for everything including errors  |
| Returns the created/updated resource  | Returns `"success": true` with no data    |
| Versioned — `/api/v1/`                | No versioning, breaks clients on changes  |
| Descriptive error messages with codes | `"error": "Something went wrong"`         |
| Pagination on list endpoints          | Returns all 50,000 records at once        |
| Predictable URL structure             | `/getUser`, `/fetchAllPosts`, `/doDelete` |
| Documented                            | No docs, "just read the code"             |

<hr />

## 2. Resource Modeling.

### Thinking in Resources, Not Actions.

The most fundamental shift in REST API design is moving from **action-oriented thinking** to **resource-oriented thinking**.

```
// ❌ Action-oriented (RPC style)
POST /createUser
POST /deleteUser
GET  /getUserById
POST /updateUserEmail

// ✅ Resource-oriented (REST style)
POST   /users          → create a user
DELETE /users/:id      → delete a user
GET    /users/:id      → get a user
PATCH  /users/:id      → update a user's email (or any field)
```

The **resource** is the noun (`users`).

The **HTTP method** is the verb (create, delete, get, update).

### Identifying Resources from Business Requirements.

Given a business requirement, extract the resources:

**Requirement:** "Users can write blog posts. Each post can have comments. Users can like posts."

**Resources:**

```
users
posts
comments
likes
```

**Not resources (these are actions or relationships):**

```
writing    → POST /posts
liking     → POST /posts/:id/likes
commenting → POST /posts/:id/comments
```

### Resource Types - Collection vs Singleton

**Collection resource**, represents a group of resources:

```
/users        → all users
/posts        → all posts
/users/42/orders  → all orders belonging to user 42
```

**Singleton resource**, represents a single, unique resource:

```
/users/42         → a specific user
/posts/99         → a specific post
/users/42/profile → the profile (there's only one per user)
```

### Resource Relationships.

**One-to-one:**

```
User ←→ Profile
GET /users/42/profile
PUT /users/42/profile
```

**One-to-many:**

```
User → Orders (a user has many orders)
GET /users/42/orders
GET /users/42/orders/7
POST /users/42/orders
```

**Many-to-many:**

```
Students ←→ Courses (a student enrolls in many courses; a course has many students)

Option 1 — nested resource:
POST /students/5/courses/12    → enroll student 5 in course 12
DELETE /students/5/courses/12  → unenroll

Option 2 — through resource (better for complex relationships):
POST /enrollments  body: { studentId: 5, courseId: 12 }
DELETE /enrollments/:id
GET /enrollments?studentId=5
```

### Mapping Relationships to URL Structure.

```
Parent resource:      /users
Child resource:       /users/:userId/posts
Grandchild:           /users/:userId/posts/:postId/comments

Standalone (when child has its own identity):
/posts/:postId        → access a post directly (no need for userId in URL)
/comments/:commentId  → access a comment directly
```

> **Rule of thumb:** If you can uniquely identify a child resource without the parent, give it its own top-level route too.

<hr />

## 3. URL Design & Naming Conventions.

### Nouns Not Verbs.

The HTTP method already conveys the action. The URL should only describe the resource.

```
// ❌ Verbs in URLs
GET  /getUsers
POST /createPost
PUT  /updateUser/42
GET  /fetchAllOrders
POST /deleteComment/5

// ✅ Nouns only
GET    /users
POST   /posts
PUT    /users/42
GET    /orders
DELETE /comments/5
```

### Plural vs Singular.

Use **plural nouns** consistently for collection resources:

```
// ✅ Consistent plural
GET /users           → collection
GET /users/42        → single item from the collection
GET /posts/99/comments

// ❌ Inconsistent — confusing
GET /user            → collection or single?
GET /users/42
GET /post/99/comment
```

Exception: **singleton sub-resources** that are naturally singular:

```
GET /users/42/profile   ← only one profile per user
GET /users/42/settings  ← only one settings per user
```

### Lowercase and Hyphens.

```
// ✅ Correct
/blog-posts
/product-categories
/shipping-addresses
/api/v1/user-preferences

// ❌ Wrong
/blogPosts          (camelCase — not URL convention)
/BlogPosts          (PascalCase)
/blog_posts         (underscore — gets hidden by underlines in links)
/BLOG-POSTS         (uppercase)
```

### Hierarchical Relationships.

Use nesting to express ownership or containment:

```
// Posts belonging to a user
GET  /users/42/posts
POST /users/42/posts

// A specific post by a specific user
GET    /users/42/posts/7
PUT    /users/42/posts/7
DELETE /users/42/posts/7

// Comments on a post
GET  /posts/7/comments
POST /posts/7/comments
```

### When Not to Nest - The 2-Level Rule.

Nesting deeper than 2 levels becomes hard to read and maintain:

```
// ❌ Too deep — hard to read
GET /users/42/posts/7/comments/3/likes/99

// ✅ Better — flatten where possible
GET /comments/3/likes       (access comment directly)
GET /likes/99               (access like directly)
```

**When to keep nesting:**

- The child resource doesn't make sense without the parent context
- `/users/:id/settings` : settings only exist in context of a user
  **When to flatten:**
- The child has its own identity and can be accessed independently
- `/posts/:id` instead of always requiring `/users/:userId/posts/:postId`

### Resource Actions That Don't Fit CRUD.

Sometimes you need to express an action that isn't a simple create/read/update/delete.

Use a **sub-resource verb** as a last resort:

```
// Activating/deactivating a user
POST /users/42/activate
POST /users/42/deactivate

// Cancelling an order
POST /orders/7/cancel

// Publishing a post (transitions a state)
POST /posts/99/publish

// Sending a password reset email
POST /users/42/password-reset

// Resending a verification email
POST /users/42/verify/resend
```

> These are acceptable because there is no natural HTTP method that maps to "activate" or "publish". Using `POST` on a sub-action resource is a widely accepted pattern.

### Versioning in URLs.

Always version your API from day one:

```
/api/v1/users
/api/v1/posts
/api/v2/users   ← new version with breaking changes
```

Prefix with `/api/` to separate API routes from other routes (web pages, static files):

```
https://myapp.com/           → web frontend
https://myapp.com/api/v1/    → REST API
```

<hr />

## 4. HTTP Methods. (Used Correctly)

### `GET` — Safe and Idempotent

- **Never mutates server state**
- Multiple identical calls always produce the same result
- No request body (by convention, some servers ignore it)
- Responses can be cached

```javascript
// ✅ Correct GET usage
GET /users          → read all users
GET /users/42       → read user 42
GET /users?role=admin → read filtered users

// ❌ Wrong — GET should never change state
GET /users/42/delete      // this deletes a user!
GET /activate?token=abc   // this activates an account!
```

### `POST` — Non-Idempotent Creation

- Creates a new resource
- **Not idempotent** — calling it twice creates two resources
- Returns `201 Created` with the new resource and a `Location` header

```javascript
// Create a new user
POST /users
Body: { "name": "Alice", "email": "alice@example.com" }
Response: 201 Created
Location: /users/43
Body: { "id": 43, "name": "Alice", "email": "alice@example.com" }

// Not idempotent — two POST calls = two users
POST /users  (first call)  → creates user id 43
POST /users  (second call) → creates user id 44
```

### `PUT` vs `PATCH` — When to Use Which

**`PUT`** — **replace** the entire resource. The client sends the complete representation. If a field is omitted, it's removed/nulled.

```javascript
// Current state of user 42:
{ "id": 42, "name": "Alice", "email": "alice@x.com", "role": "admin", "age": 30 }

// PUT — must send ALL fields
PUT /users/42
Body: { "name": "Alice Updated", "email": "alice@new.com", "role": "admin", "age": 30 }
// If you forget "age", it gets wiped out

// PUT is idempotent — calling it 10 times with the same body = same result
```

**`PATCH`** — **partial update**. Only send the fields you want to change. Existing fields not in the body are left untouched.

```javascript
// PATCH — only send what changes
PATCH /users/42
Body: { "email": "alice@new.com" }
// "name", "role", "age" are untouched
Response: { "id": 42, "name": "Alice", "email": "alice@new.com", "role": "admin", "age": 30 }
```

**Decision rule:**

```
Replacing a config, profile, or settings object → PUT
Updating one or two fields of a large object   → PATCH
```

### `DELETE` — Idempotent Behavior

- Deletes the resource
- **Idempotent** : The end state (resource is gone) is the same whether called once or ten times
- First call: `204 No Content` (deleted)
- Subsequent calls: `404 Not Found` OR `204` (either is acceptable — `204` is friendlier for clients)

```javascript
DELETE /users/42  (first call)   → 204 No Content
DELETE /users/42  (second call)  → 404 Not Found  (most common)
                               OR → 204 No Content  (more idempotent-friendly)
```

### Method Overriding.

Some HTTP clients (old browsers, certain proxies) only support `GET` and `POST`. They fake other methods using the `X-HTTP-Method-Override` header:

```
POST /users/42
X-HTTP-Method-Override: DELETE
```

Express can handle this with the `method-override` package:

```javascript
const methodOverride = require("method-override");
app.use(methodOverride("X-HTTP-Method-Override"));
// Now a POST with this header is treated as DELETE
```

> In modern APIs targeting modern clients, you rarely need this. Know it exists.

<hr />

## 5. Request & Response Design.

### Consistent Request Body Structure.

```javascript
// ✅ Flat, clean request bodies
POST /users
{
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}

// ❌ Unnecessarily nested
POST /users
{
  "user": {
    "data": {
      "name": "Alice"
    }
  }
}
```

### Consistent Response Envelope.

Pick one response shape and use it **everywhere**. Two common patterns:

**Pattern 1 (`status` + `data`) :**

```json
// Success (single resource)
{
  "status": "success",
  "data": { "id": 42, "name": "Alice" }
}

// Success (collection)
{
  "status": "success",
  "count": 3,
  "data": [ ... ]
}

// Error
{
  "status": "fail",
  "message": "User not found"
}
```

**Pattern 2 (`success` boolean) :**

```json
// Success
{ "success": true, "result": { "id": 42, "name": "Alice" } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "User not found" } }
```

> Pattern 1 (`status` string) is more expressive because it distinguishes `"fail"` (client error) from `"error"` (server error). This is the **JSend** convention.

### Always Return the Created/Updated Resource.

```javascript
// ❌ Bad — client has no idea what was actually created/saved
POST /users → 201 { "message": "User created successfully" }
PATCH /users/42 → 200 { "success": true }

// ✅ Good — client gets the full, authoritative resource back
POST /users → 201 { "status": "success", "data": { "id": 43, "name": "Alice", "createdAt": "..." } }
PATCH /users/42 → 200 { "status": "success", "data": { "id": 42, "name": "Alice", "email": "new@email.com" } }
```

### Null vs Omit - When to Include Empty Fields.

```javascript
// Option 1 — include null fields (client always gets the same shape)
{
  "id": 42,
  "name": "Alice",
  "bio": null,        // field exists but has no value
  "website": null
}

// Option 2 — omit empty fields (smaller payload)
{
  "id": 42,
  "name": "Alice"
  // bio and website are absent
}
```

**Recommendation:** Include `null` fields for required/expected fields. Omit truly optional fields that most records won't have. Be consistent — don't sometimes include a field and sometimes omit it.

### Returning Metadata for Collections.

```json
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "total": 243,
    "count": 10,
    "page": 3,
    "totalPages": 25,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### Avoiding Deeply Nested Response Structures.

```javascript
// ❌ Over-nested — painful for clients to parse
{
  "data": {
    "user": {
      "details": {
        "personal": {
          "name": "Alice"
        }
      }
    }
  }
}

// ✅ Flat — easy to destructure
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin"
}
```

<hr />

## 6. API Versioning.

### Why Versioning Exists

APIs are **contracts** between a server and its consumers. Once consumers depend on your API, you cannot change it without potentially breaking them.

**Breaking changes** that require a new version:

- Renaming or removing a field
- Changing a field's data type
- Changing a URL structure
- Removing an endpoint
- Changing required/optional field rules
- Changing status codes
  **Non-breaking changes** (safe to add without a new version):
- Adding new optional fields to a response
- Adding a new endpoint
- Adding new optional query parameters

### Versioning Strategies

**1. URL Versioning (most common, recommended):**

```
GET /api/v1/users
GET /api/v2/users
```

Pros: visible, easy to test in browser, simple routing
Cons: URLs aren't "pure" (REST purists argue version isn't a resource)

**2. Header Versioning:**

```
GET /api/users
Accept: application/vnd.myapi.v2+json
```

Pros: clean URLs
Cons: harder to test, less visible, harder to cache

**3. Query Parameter Versioning:**

```
GET /api/users?version=2
GET /api/users?v=2
```

Pros: easy to add
Cons: query params are for filtering, not versioning; messy

**Recommendation:** Use **URL versioning** (`/api/v1/`). It's the most widely adopted, easiest to test, and most explicit.

### When to Increment a Version

```
v1 → v2  (breaking change)    Rename "fullName" → "name"
v1 → v2  (breaking change)    Remove the "phone" field
v1 → v1  (non-breaking)       Add new optional "bio" field
v1 → v1  (non-breaking)       Add new GET /users/:id/activity endpoint
v1 → v2  (breaking change)    Change /user-posts → /posts
```

### Deprecation Strategy

When you release v2, don't immediately kill v1:

1. **Announce deprecation** with a timeline (e.g. "v1 deprecated, sunset in 6 months")

2. **Add deprecation headers** to v1 responses:

   ```
   Deprecation: true
   Sunset: Sat, 01 Jun 2025 00:00:00 GMT
   Link: <https://api.example.com/v2/users>; rel="successor-version"
   ```

3. **Provide a migration guide** : document what changed

4. **Monitor v1 usage** : reach out to active consumers before shutdown

5. **Sunset** : take down v1 after the announced date

<hr />

## 7. Filtering, Sorting, Searching & Pagination.

### Filtering

Use query parameters to filter collections:

```
GET /products?category=electronics
GET /users?role=admin&status=active
GET /orders?status=pending&userId=42
GET /products?minPrice=10&maxPrice=100
GET /events?startDate=2024-01-01&endDate=2024-12-31
```

Implementation in Express:

```javascript
router.get("/", async (req, res) => {
  const { category, minPrice, maxPrice, status } = req.query;

  let results = await Product.find(); // or your in-memory array

  if (category) results = results.filter((p) => p.category === category);
  if (minPrice) results = results.filter((p) => p.price >= Number(minPrice));
  if (maxPrice) results = results.filter((p) => p.price <= Number(maxPrice));
  if (status) results = results.filter((p) => p.status === status);

  res.json({ status: "success", count: results.length, data: results });
});
```

### Sorting

```
GET /products?sort=price           → ascending by price
GET /products?sort=-price          → descending (- prefix means desc)
GET /products?sort=category,-price → sort by category asc, then price desc
GET /products?sortBy=price&order=desc  → alternative explicit format
```

Implementation:

```javascript
const { sort } = req.query;

if (sort) {
  const fields = sort.split(",");
  results.sort((a, b) => {
    for (const field of fields) {
      const desc = field.startsWith("-");
      const key = desc ? field.slice(1) : field;
      if (a[key] < b[key]) return desc ? 1 : -1;
      if (a[key] > b[key]) return desc ? -1 : 1;
    }
    return 0;
  });
}
```

### Searching

```
GET /users?q=alice           → search across multiple fields
GET /products?search=laptop  → search product names/descriptions
GET /posts?q=javascript+tips → URL-encoded space
```

Implementation:

```javascript
const { q } = req.query;

if (q) {
  const term = q.toLowerCase();
  results = results.filter(
    (u) =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term),
  );
}
```

### Field Selection (Sparse Fieldsets)

Let clients request only the fields they need, reduces payload size:

```
GET /users?fields=id,name,email
GET /products?fields=id,name,price
```

Implementation:

```javascript
const { fields } = req.query;

if (fields) {
  const allowed = fields.split(",");
  results = results.map((item) => {
    return allowed.reduce((obj, key) => {
      if (item[key] !== undefined) obj[key] = item[key];
      return obj;
    }, {});
  });
}
```

### Pagination (Offset-Based).

The most common and simplest pagination strategy:

```
GET /users?page=1&limit=10     → first 10 users
GET /users?page=2&limit=10     → users 11-20
GET /users?page=3&limit=10     → users 21-30

// Alternative: offset + limit
GET /users?offset=20&limit=10  → skip 20, take 10
```

Implementation:

```javascript
const page = Math.max(1, parseInt(req.query.page) || 1);
const limit = Math.min(100, parseInt(req.query.limit) || 10); // cap at 100
const offset = (page - 1) * limit;

const total = results.length;
const paginated = results.slice(offset, offset + limit);
const totalPages = Math.ceil(total / limit);

res.json({
  status: "success",
  data: paginated,
  meta: {
    total,
    count: paginated.length,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  },
});
```

### Pagination (Cursor-Based).

More scalable for large datasets. Instead of a page number, use a cursor (usually the ID or timestamp of the last item seen):

```
// First page
GET /posts?limit=10
Response:
{
  "data": [ ...10 posts... ],
  "meta": {
    "nextCursor": "eyJpZCI6MTB9",   ← base64 encoded { "id": 10 }
    "hasNextPage": true
  }
}

// Next page — pass cursor from previous response
GET /posts?limit=10&cursor=eyJpZCI6MTB9
```

Implementation concept:

```javascript
const { limit = 10, cursor } = req.query;

let results = [...allPosts];

if (cursor) {
  const decoded = JSON.parse(Buffer.from(cursor, "base64").toString());
  const startIdx = results.findIndex((p) => p.id === decoded.id) + 1;
  results = results.slice(startIdx);
}

const page = results.slice(0, limit);
const lastItem = page[page.length - 1];
const nextCursor = lastItem
  ? Buffer.from(JSON.stringify({ id: lastItem.id })).toString("base64")
  : null;

res.json({
  status: "success",
  data: page,
  meta: {
    hasNextPage: results.length > limit,
    nextCursor,
  },
});
```

### Offset vs Cursor. (Pros & Cons)

|                              | Offset-Based                   | Cursor-Based                           |
| ---------------------------- | ------------------------------ | -------------------------------------- |
| **Simplicity**               | ✅ Simple to implement         | ❌ More complex                        |
| **Page jumping**             | ✅ Can jump to page 5          | ❌ Must page through sequentially      |
| **Stable results**           | ❌ Items shift if data changes | ✅ Stable — based on position          |
| **Performance (large data)** | ❌ Slow — DB must count offset | ✅ Fast — uses indexed ID/timestamp    |
| **Best for**                 | Admin panels, small datasets   | Infinite scroll, large datasets, feeds |

<hr />

## 8. Error Response Design.

### Consistent Error Shape

Every error response across your entire API must have the **same shape**. Clients shouldn't have to handle different error formats for different endpoints.

**Minimal:**

```json
{
  "status": "fail",
  "message": "User not found"
}
```

**Standard (recommended):**

```json
{
  "status": "fail",
  "statusCode": 404,
  "message": "User not found",
  "code": "USER_NOT_FOUND"
}
```

**Detailed (for validation errors):**

```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Machine-Readable Error Codes

`message` is for humans. `code` is for client code to handle programmatically:

```javascript
// Client code can branch on the error code — not the message string
if (error.code === "DUPLICATE_EMAIL") {
  showMessage("This email is already registered. Try logging in instead.");
} else if (error.code === "VALIDATION_ERROR") {
  error.details.forEach((d) => highlightField(d.field, d.message));
}
```

Error code naming conventions:

```
USER_NOT_FOUND
DUPLICATE_EMAIL
INVALID_TOKEN
TOKEN_EXPIRED
INSUFFICIENT_PERMISSIONS
VALIDATION_ERROR
RATE_LIMIT_EXCEEDED
RESOURCE_CONFLICT
INTERNAL_SERVER_ERROR
```

### Field-Level Validation Errors

When a request body fails validation, tell the client **exactly which fields failed and why**:

```javascript
// Request
POST /users
{ "email": "not-an-email", "password": "123" }

// Response — 400
{
  "status": "fail",
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "name",     "message": "name is required" },
    { "field": "email",    "message": "must be a valid email address" },
    { "field": "password", "message": "must be at least 8 characters" }
  ]
}
```

Implementation using a simple validator:

```javascript
function validateUser(body) {
  const errors = [];

  if (!body.name) errors.push({ field: "name", message: "name is required" });

  if (!body.email)
    errors.push({ field: "email", message: "email is required" });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    errors.push({ field: "email", message: "must be a valid email address" });

  if (!body.password)
    errors.push({ field: "password", message: "password is required" });
  else if (body.password.length < 8)
    errors.push({
      field: "password",
      message: "must be at least 8 characters",
    });

  return errors;
}

// In route handler:
const errors = validateUser(req.body);
if (errors.length > 0) {
  return res.status(400).json({
    status: "fail",
    statusCode: 400,
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    details: errors,
  });
}
```

### RFC 7807 — Problem Details Standard

RFC 7807 is an IETF standard for HTTP error responses. You don't have to use it, but it's good to know:

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid fields",
  "instance": "/api/v1/users",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

Headers with RFC 7807:

```
Content-Type: application/problem+json
```

### Never Leak Internals

```javascript
// ❌ NEVER expose these in production
{
  "error": "MongoServerError: E11000 duplicate key error collection: mydb.users index: email_1",
  "stack": "Error: ...\n  at /app/routes/users.js:42:15",
  "query": "SELECT * FROM users WHERE id = '1; DROP TABLE users;'",
  "file": "/home/ubuntu/app/src/db/connection.js"
}

// ✅ Safe — generic message in production
{
  "status": "error",
  "statusCode": 500,
  "message": "Something went wrong. Please try again later.",
  "code": "INTERNAL_SERVER_ERROR"
}
```

<hr />

## 9. Status Codes. (Used Semantically)

### Using Status Codes as Communication

Status codes are part of the API contract. They tell clients what happened without needing to parse the body.

```javascript
// ❌ Using 200 for everything — client must parse body to know if it failed
GET /users/99
→ 200 OK
{ "success": false, "error": "User not found" }

// ✅ Status code communicates the outcome
GET /users/99
→ 404 Not Found
{ "status": "fail", "message": "User not found" }
```

### The Most Misused Status Codes

**`400` vs `422`:**

```
400 Bad Request     → malformed request (invalid JSON, missing Content-Type)
422 Unprocessable Entity → valid JSON, but business logic validation failed
                           (email already taken, quantity exceeds stock)

In practice, many APIs use 400 for both. Either is acceptable — just be consistent.
```

**`401` vs `403`:**

```
401 Unauthorized → "Who are you? Please authenticate."
                   No valid token/session present.

403 Forbidden    → "I know who you are. You don't have permission."
                   Valid token, but wrong role/scope.
```

```javascript
// 401 — no token
if (!req.headers.authorization) {
  return res.status(401).json({ message: "Authentication required" });
}

// 403 — has token, wrong role
if (req.user.role !== "admin") {
  return res.status(403).json({ message: "Admin access required" });
}
```

### `202 Accepted` (For Async Operations).

When an operation is accepted but not yet completed:

```javascript
// Triggering a long-running job
POST /reports/generate
→ 202 Accepted
{
  "status": "accepted",
  "jobId": "job_abc123",
  "statusUrl": "/jobs/job_abc123",
  "message": "Report generation started. Check statusUrl for progress."
}

// Client polls for completion
GET /jobs/job_abc123
→ 200 { "status": "processing", "progress": 45 }

GET /jobs/job_abc123
→ 200 { "status": "complete", "resultUrl": "/reports/xyz" }
```

### `207 Multi-Status` (Batch Operations).

When processing multiple items and some succeed while others fail:

```javascript
POST /users/batch
Body: [
  { "name": "Alice", "email": "alice@x.com" },
  { "name": "Bob",   "email": "invalid" },        // invalid email
  { "name": "Carol", "email": "alice@x.com" },   // duplicate
]

→ 207 Multi-Status
{
  "results": [
    { "index": 0, "status": 201, "data": { "id": 1, "name": "Alice" } },
    { "index": 1, "status": 400, "error": "Invalid email" },
    { "index": 2, "status": 409, "error": "Email already exists" }
  ]
}
```

### `410 Gone` vs `404 Not Found`

```
404 Not Found   → Resource doesn't exist (and may never have)
                  Or: resource existed but we can't say if it was deleted

410 Gone        → Resource existed but has been permanently deleted
                  Client should remove any references to it
```

```javascript
// For soft-delete or audit-tracked resources
const user = await User.findById(id);
if (!user) {
  // Check the deleted_users archive
  const wasDeleted = await DeletedUser.findById(id);
  if (wasDeleted) {
    return res
      .status(410)
      .json({ message: "This user account has been permanently deleted" });
  }
  return res.status(404).json({ message: "User not found" });
}
```

### `503` with `Retry-After`

When the server is temporarily unavailable, tell clients when to retry:

```javascript
res
  .status(503)
  .set("Retry-After", "120") // seconds until server is likely available
  .json({
    status: "error",
    message: "Service temporarily unavailable. Maintenance in progress.",
    retryAfter: 120,
  });
```

<hr />

## 10. HATEOAS (Hypermedia)

### What HATEOAS Means

HATEOAS (Hypermedia as the Engine of Application State) is REST Constraint #4 — the most commonly skipped one. The idea: responses should contain **links to related actions and resources**, so the client can navigate the API without hardcoding URLs.

```json
// A HATEOAS-compliant response for a user
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "_links": {
    "self": { "href": "/users/42", "method": "GET" },
    "update": { "href": "/users/42", "method": "PATCH" },
    "delete": { "href": "/users/42", "method": "DELETE" },
    "posts": { "href": "/users/42/posts", "method": "GET" },
    "orders": { "href": "/users/42/orders", "method": "GET" }
  }
}
```

The client doesn't need to know the URL structure, it just follows links.

### Why Most Real-World APIs Skip It

1. **Complexity** : Generating links for every response adds significant overhead
2. **Client reality** : Modern clients (React apps, mobile apps) hardcode API URLs anyway
3. **Contract duplication** : The link structure IS the contract, but so is the OpenAPI spec
4. **Tooling** : Most clients don't consume `_links` programmatically

The only well-known public APIs that implement full HATEOAS are GitHub's API and PayPal's API.

### Practical Middle Ground

Include related resource URLs where they add real value:

```json
{
  "id": 42,
  "name": "Alice",
  "email": "alice@example.com",
  "role": "admin",

  // Practical hypermedia — just enough to be useful
  "links": {
    "self": "/api/v1/users/42",
    "posts": "/api/v1/users/42/posts",
    "avatar": "/api/v1/users/42/avatar"
  }
}
```

<hr />

## 11. API Documentation Standards.

### Why Documentation is Part of API Design

An undocumented API is an unusable API. Documentation is not an afterthought, it is part of the deliverable.

Good docs include:

- All endpoints with full URL and method
- Request parameters (path, query, body) with types and whether required/optional
- Response schema with example values
- All possible status codes and what triggers them
- Authentication requirements
- Code examples

### OpenAPI / Swagger Specification

**OpenAPI** (formerly Swagger) is the industry standard for describing REST APIs. It's a YAML or JSON file that describes every endpoint, parameter, request body and response.

**Basic OpenAPI 3.0 structure:**

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
  description: A sample API

servers:
  - url: http://localhost:3000/api/v1

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - in: query
          name: role
          schema:
            type: string
          description: Filter by role
      responses:
        "200":
          description: List of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: success
                  data:
                    type: array
                    items:
                      $ref: "#/components/schemas/User"

    post:
      summary: Create a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/CreateUserInput"
      responses:
        "201":
          description: User created
        "400":
          description: Validation error

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 42
        name:
          type: string
          example: Alice
        email:
          type: string
          format: email
          example: alice@example.com

    CreateUserInput:
      type: object
      required: [name, email]
      properties:
        name:
          type: string
        email:
          type: string
          format: email
```

### `swagger-jsdoc` + `swagger-ui-express` in Node.js

Instead of a separate YAML file, write the spec as JSDoc comments in your route files:

```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
// config/swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "My API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000/api/v1" }],
  },
  apis: ["./routes/*.js"], // scan these files for JSDoc comments
};

module.exports = swaggerJsdoc(options);
```

```javascript
// routes/users.js
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // ...
  }),
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    // ...
  }),
);
```

```javascript
// index.js — mount Swagger UI
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Now visit http://localhost:3000/api/docs for interactive docs
```

<hr />

## 12. Idempotency in Practice.

### Idempotency Keys

For non-idempotent operations (especially `POST`), clients can send an **idempotency key**, a unique ID generated by the client.

If the same request is sent twice (e.g. due to a network retry), the server detects the duplicate key and returns the same response instead of creating a duplicate resource.

This pattern is critical in **payment APIs** (Stripe, PayPal) and **order systems** where double-processing is catastrophic.

```
POST /orders
Idempotency-Key: a4d3b2c1-1234-5678-abcd-ef0123456789
Body: { "productId": 5, "quantity": 2 }
```

### Implementing Idempotency Key Checks

```javascript
// Simple in-memory idempotency store (use Redis in production)
const idempotencyStore = new Map();

function idempotencyMiddleware(req, res, next) {
  if (req.method !== "POST") return next(); // only applies to POST

  const key = req.headers["idempotency-key"];
  if (!key) return next(); // key is optional

  if (idempotencyStore.has(key)) {
    // Already processed — return the stored response
    const cached = idempotencyStore.get(key);
    return res.status(cached.statusCode).json(cached.body);
  }

  // Intercept the response to store it
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    idempotencyStore.set(key, { statusCode: res.statusCode, body });
    // Optionally: expire after 24 hours
    setTimeout(() => idempotencyStore.delete(key), 24 * 60 * 60 * 1000);
    return originalJson(body);
  };

  next();
}
```

### Safe Retry Patterns

```javascript
// Client-side: generate a stable key per logical operation
const { randomUUID } = require("crypto");

async function createOrder(orderData) {
  const idempotencyKey = randomUUID(); // generate ONCE per attempt

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey, // SAME key on every retry
        },
        body: JSON.stringify(orderData),
      });
      return await response.json();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff
    }
  }
}
```

<hr />

## 13. API Rate Limiting. (Design Perspective)

### What Rate Limiting Is

Rate limiting restricts how many requests a client can make in a given time window. It protects your API from:

- **Abuse** : Malicious clients hammering the API
- **Accidental overload** : Buggy clients in infinite retry loops
- **Resource exhaustion** : One client using all capacity, starving others

### Rate Limit Response Headers

Always include these headers so clients can self-regulate:

```
X-RateLimit-Limit:     100       ← max requests per window
X-RateLimit-Remaining: 47        ← requests left in current window
X-RateLimit-Reset:     1620000000 ← Unix timestamp when window resets
```

### `429 Too Many Requests` with `Retry-After`

```javascript
// When limit is exceeded
res
  .status(429)
  .set("Retry-After", "60") // seconds until they can retry
  .json({
    status: "fail",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests. Please wait 60 seconds before retrying.",
    retryAfter: 60,
  });
```

### Using `express-rate-limit`

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

// Global limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true, // send X-RateLimit-* headers
  legacyHeaders: false,
  message: {
    status: "fail",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests, please try again in 15 minutes.",
  },
});
app.use("/api/", globalLimiter);

// Stricter limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // only 10 login attempts per hour
  message: {
    status: "fail",
    code: "AUTH_RATE_LIMIT",
    message: "Too many login attempts. Try again in 1 hour.",
  },
});
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
```

### Rate Limit Strategies

| Strategy         | How It Works                   | Best For                      |
| ---------------- | ------------------------------ | ----------------------------- |
| **Per IP**       | Limit by client IP address     | Public APIs, anonymous access |
| **Per API key**  | Limit by API key in header     | Developer APIs, paid tiers    |
| **Per user**     | Limit by authenticated user ID | Authenticated APIs            |
| **Per endpoint** | Different limits per route     | Protect expensive operations  |

<hr />

## 14. API Security Design Principles.

### Authentication vs Authorization in API Design

```
Authentication → Who are you?    → Verified via token/session
Authorization  → What can you do? → Verified via roles/permissions
```

From a design perspective:

- **Authentication** is handled by auth middleware (Week-11)
- **Authorization** is enforced at the route/resource level

```javascript
// Route-level authorization
router.delete("/users/:id", authenticate, authorizeAdmin, async (req, res) => {
  // Only admins can delete users
});

router.get("/users/:id/profile", authenticate, async (req, res) => {
  // Users can only see their own profile
  if (req.params.id !== String(req.user.id)) {
    return res.status(403).json({ message: "Access denied" });
  }
});
```

### API Keys vs Bearer Tokens

|                  | API Keys                           | Bearer Tokens (JWT)                            |
| ---------------- | ---------------------------------- | ---------------------------------------------- |
| **Format**       | Static string in header            | Signed, time-limited JWT                       |
| **Sent via**     | `X-API-Key: abc123` or query param | `Authorization: Bearer <token>`                |
| **Lifetime**     | Long-lived (until revoked)         | Short-lived (minutes to hours)                 |
| **Use case**     | Server-to-server, developer APIs   | User authentication, web/mobile apps           |
| **Revocability** | Easy — delete from DB              | Hard — must wait for expiry or use a blocklist |

### Principle of Least Privilege, Don't Over-Expose Data

Only return what the caller needs. Strip out sensitive or internal fields:

```javascript
// ❌ Over-exposes — sends everything
router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // includes password hash, internal flags, etc.
});

// ✅ Selective — only return what's needed
function sanitizeUser(user) {
  const { password, __v, internalNotes, deletedAt, ...safe } = user;
  return safe;
}

router.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json({ status: "success", data: sanitizeUser(user) });
});
```

### Sensitive Field Filtering

Fields that should **never** appear in API responses:

```javascript
const SENSITIVE_FIELDS = [
  "password",
  "passwordHash",
  "__v",
  "salt",
  "resetToken",
  "verificationToken",
  "internalNotes",
];

function stripSensitiveFields(obj) {
  if (Array.isArray(obj)) return obj.map(stripSensitiveFields);
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => !SENSITIVE_FIELDS.includes(key))
        .map(([key, val]) => [key, stripSensitiveFields(val)]),
    );
  }
  return obj;
}
```

### Input Sanitization as a Design Concern

Before your data reaches any storage layer, sanitize it:

```javascript
// Trim whitespace from string inputs
function sanitizeInput(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === "string" ? v.trim() : v,
    ]),
  );
}

// In middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeInput(req.body);
  }
  next();
});
```

### HTTPS-Only as a Baseline

Always enforce HTTPS in production. Redirect HTTP to HTTPS:

```javascript
// Redirect HTTP → HTTPS in Express (when behind a proxy like Nginx/Heroku)
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https"
  ) {
    return res.redirect(301, `https://${req.header("host")}${req.url}`);
  }
  next();
});
```

Add the `Strict-Transport-Security` header (done automatically by `helmet`):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

This tells browsers to **only** use HTTPS for your domain for the next year.

<hr />

## Assignment.

1. Products API with Filtering, Sorting, Searching, Pagination & Sanitization.

   **What you practice:** URL naming conventions, query-based filtering, sorting with `-` prefix for descending, full-text search, sparse fieldsets (`?fields=`), offset-based pagination with a reusable helper, sensitive field sanitization, field-level validation errors with `code`, non-CRUD action route (`/restock`), and `/stats` analytics endpoint.

   **Requirements:**
   - API versioned under `/api/v1`
   - Full CRUD on `/api/v1/products`
   - `GET /products` supports: `?category=`, `?minPrice=`, `?maxPrice=`, `?q=`, `?sort=` (with `-` for desc), `?fields=`, `?page=`, `?limit=`
   - `GET /products/stats` — total value, avg price, by-category breakdown, low-stock list
   - `POST /products/:id/restock` — non-CRUD action route (adds stock quantity)
   - Reusable `paginate(array, query)` utility
   - `sanitize()` utility — strips `internalNotes` from responses (even though it's in the data store)
   - `validateBody(rules)` middleware with field-level `details` array in error response
   - `AppError(message, statusCode, code)` — machine-readable error `code`
   - Consistent response envelope: `{ status, data, meta? }`

   [Solution](./Assignment/code1/)

   **Postman Test Cases:**

   ```
   GET  http://localhost:3001/api/v1/products
   GET  http://localhost:3001/api/v1/products?category=Electronics
   GET  http://localhost:3001/api/v1/products?minPrice=50&maxPrice=300&sort=-price
   GET  http://localhost:3001/api/v1/products?q=note
   GET  http://localhost:3001/api/v1/products?fields=id,name,price&limit=3
   GET  http://localhost:3001/api/v1/products?page=2&limit=3
   GET  http://localhost:3001/api/v1/products/stats
   GET  http://localhost:3001/api/v1/products/1
   GET  http://localhost:3001/api/v1/products/99           → 404 PRODUCT_NOT_FOUND
   POST http://localhost:3001/api/v1/products              Body: {}  → 400 VALIDATION_ERROR with details[]
   POST http://localhost:3001/api/v1/products              Body: { "name":"Monitor","category":"Electronics","price":399 }
   POST http://localhost:3001/api/v1/products              Body: { "name":"Laptop","category":"x","price":1 } → 409 DUPLICATE_PRODUCT
   POST http://localhost:3001/api/v1/products/1/restock    Body: { "quantity": 10 }
   POST http://localhost:3001/api/v1/products/1/restock    Body: { "quantity": -5 }  → 400 INVALID_QUANTITY
   PATCH http://localhost:3001/api/v1/products/2           Body: { "price": 199.99 }
   DELETE http://localhost:3001/api/v1/products/8          → 204
   ```

   **Verify sanitization:** `GET /api/v1/products/1` — `internalNotes` field must NOT appear in response even though it exists in the data store.

2. Orders API with Cursor Pagination, Idempotency Keys, Rate Limiting & 410 Gone.

   **What you practice:** Cursor-based pagination (encode/decode base64 cursors), idempotency key middleware (prevents duplicate order creation), rate limiting with `express-rate-limit` (separate limits for reads vs writes), `410 Gone` vs `404 Not Found` for deleted resources, and the cancel non-CRUD action.

   **Requirements:**
   - Full CRUD on `/api/v1/orders`
   - `GET /orders` uses **cursor-based pagination** — `?limit=` and `?cursor=`
   - `POST /orders` supports `Idempotency-Key` header — same key = same response
   - Global rate limiter: 100 req / 15 min
   - Write rate limiter on `POST`/`DELETE`: 20 req / 15 min
   - `DELETE /orders/:id` → `204` on first delete, `410 Gone` on subsequent calls (track deleted IDs)
   - `POST /orders/:id/cancel` — non-CRUD action with business logic (can't cancel delivered orders)
   - `429` responses include `code: 'RATE_LIMIT_EXCEEDED'` and `message`

   [Solution](./Assignment/code2/)

   **Postman Test Cases:**

   ```
   # Cursor pagination
   GET  http://localhost:3002/api/v1/orders?limit=10
   # → copy meta.nextCursor from response, then:
   GET  http://localhost:3002/api/v1/orders?limit=10&cursor=<nextCursor>

   # Filters
   GET  http://localhost:3002/api/v1/orders?status=pending
   GET  http://localhost:3002/api/v1/orders?userId=1

   # Idempotency — send these two requests with the SAME Idempotency-Key header
   POST http://localhost:3002/api/v1/orders  Header: Idempotency-Key: my-key-001
   Body: { "userId": 1, "product": "Laptop", "quantity": 1 }
   # First call → 201, creates order id 26
   # Second call (same key) → 201, returns SAME order id 26 (no duplicate!)

   # Cancel
   POST http://localhost:3002/api/v1/orders/1/cancel
   # Try cancelling a delivered order (id 4 has status 'delivered') → 409 CANNOT_CANCEL_DELIVERED

   # 410 Gone
   DELETE http://localhost:3002/api/v1/orders/5  → 204
   DELETE http://localhost:3002/api/v1/orders/5  → 410 ORDER_GONE
   GET    http://localhost:3002/api/v1/orders/5  → 410 ORDER_GONE

   # Rate limit headers — check response headers
   X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
   ```

3. Blog API with API Key Auth, Swagger Docs, Full Design Principles.

   **What you practice:** API key authentication (read-only vs write keys), `requireWrite` authorization guard, full OpenAPI/Swagger documentation with `swagger-jsdoc` + `swagger-ui-express`, field-level validation with `details[]`, `/posts/:id/publish` action route with 409 conflict, view counter on GET, `sanitize()` on every response, separate rate limiters for reads vs writes, and draft vs published filtering.

   **Requirements:**
   - All `/api/v1/*` routes protected by `X-API-Key` header
   - Two API key tiers: read-only (`key-read-only-abc123`) and write (`key-write-xyz789`)
   - `POST`, `PATCH`, `DELETE`, and action routes require write key — read-only key gets `403`
   - Swagger UI at `/api/docs` (no auth required)
   - `GET /posts` — filter by `?author=`, `?tag=`, `?published=all`, search with `?q=`, sort (`?sort=-views`), sparse fieldsets, offset pagination
   - `GET /posts/stats` — view totals, top post, by-author breakdown
   - `GET /posts/:id` — auto-increments view count on each call
   - `POST /posts` — creates in draft state (`published: false`), field-level validation
   - `PATCH /posts/:id` — partial update, validation only on provided fields
   - `POST /posts/:id/publish` — publishes a draft; 409 if already published
   - `DELETE /posts/:id` → 204

   [Solution](./Assignment/code3/)

   **Postman Test Cases:**

   ```
   # In Postman: Add header X-API-Key: key-read-only-abc123 for reads
   #             Add header X-API-Key: key-write-xyz789 for writes

   # No key → 401 MISSING_API_KEY
   GET  http://localhost:3003/api/v1/posts    (no header)

   # Bad key → 403 INVALID_API_KEY
   GET  http://localhost:3003/api/v1/posts    X-API-Key: bad-key

   # Read-only key trying to write → 403 READ_ONLY_KEY
   POST http://localhost:3003/api/v1/posts    X-API-Key: key-read-only-abc123

   # List published posts
   GET  http://localhost:3003/api/v1/posts                              X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?published=all               X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?author=Alice                X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?tag=node                    X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?q=express                   X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?sort=-views                 X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?fields=id,title,author      X-API-Key: key-read-only-abc123
   GET  http://localhost:3003/api/v1/posts?page=1&limit=2              X-API-Key: key-read-only-abc123

   # Stats
   GET  http://localhost:3003/api/v1/posts/stats                       X-API-Key: key-read-only-abc123

   # Get one (view counter increments each call)
   GET  http://localhost:3003/api/v1/posts/1    X-API-Key: key-read-only-abc123   (call twice — views++)

   # Create (draft) — field validation
   POST http://localhost:3003/api/v1/posts      X-API-Key: key-write-xyz789
   Body: {}                                     → 400 VALIDATION_ERROR with details[]
   Body: { "title": "Hi", "content": "x", "author": "Z" }  → 400 (too short)
   Body: { "title": "Valid Title", "content": "Long enough content here", "author": "Alice", "tags": ["node"] }
   → 201, published: false

   # Publish
   POST http://localhost:3003/api/v1/posts/6/publish   X-API-Key: key-write-xyz789  → 200
   POST http://localhost:3003/api/v1/posts/6/publish   X-API-Key: key-write-xyz789  → 409 ALREADY_PUBLISHED

   # Swagger UI — open in browser (no auth needed)
   http://localhost:3003/api/docs
   ```
