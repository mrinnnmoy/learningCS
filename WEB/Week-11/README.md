## List of things learned.

## 1. Authentication vs Authorization.

### Definitions.

**Authentication** answers: _"Who are you?"_

It is the process of verifying the identity of a user, checking that they are who they claim to be.

**Authorization** answers: _"What are you allowed to do?"_

It is the process of verifying that an authenticated user has permission to perform a given action or access a given resource.

```
Authentication — happens FIRST
    User sends email + password
    Server verifies credentials
    Server issues a token (proof of identity)

Authorization — happens AFTER authentication
    User sends token with a request
    Server decodes token → knows WHO the user is
    Server checks role/permissions → knows WHAT they can do
```

### Why They Are Seperate Concerns

```javascript
// Authentication middleware — "Who are you?"
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // identity confirmed
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Authorization middleware — "What can you do?"
function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// Route uses both — first authenticate, then authorize
router.delete("/users/:id", authenticate, authorizeAdmin, deleteUser);
```

### Common HTTP Status Codes.

```
401 Unauthorized  → Not authenticated (no token, invalid token, expired token)
                    "I don't know who you are. Please log in."

403 Forbidden     → Authenticated but not authorized (wrong role, insufficient permissions)
                    "I know who you are. You can't do this."
```

<hr />

## 2. Cookies vs Tokens

### Session-Based Authentication (Cookies)

The server stores session data. The client holds only a session ID in a cookie.

```
1. User logs in → server creates a session in DB/Redis
2. Server sends Set-Cookie: sessionId=abc123
3. Browser automatically sends Cookie: sessionId=abc123 on every request
4. Server looks up sessionId in DB to find user
5. On logout → server deletes session from DB
```

```
Pros:
  ✅ Revocable instantly (delete session from DB)
  ✅ No sensitive data on client
  ✅ Automatic by browser (no manual header setting)

Cons:
  ❌ Server must store session state (DB/Redis overhead)
  ❌ Harder to scale horizontally (sessions need to be shared across servers)
  ❌ CSRF vulnerable (cookies sent automatically — can be exploited)
  ❌ Not ideal for APIs consumed by mobile apps or third-party clients
```

### Token-Based Authentication (JWT)

The server issues a signed token. The client stores it and sends it manually.

```
1. User logs in → server creates and signs a JWT
2. Server sends JWT in response body
3. Client stores JWT (localStorage or memory)
4. Client sends: Authorization: Bearer <jwt> on every request
5. Server verifies signature — no DB lookup needed
6. On logout → client discards token (server has no state to clean up)
```

```
Pros:
  ✅ Stateless — server needs no DB to verify token
  ✅ Scales horizontally — any server can verify the same token
  ✅ Works across domains (no cookie restrictions)
  ✅ Ideal for APIs, mobile apps, microservices

Cons:
  ❌ Cannot be revoked before expiry (without a blocklist)
  ❌ Token payload visible to anyone who has it (only signature is secure)
  ❌ Larger payload than a session cookie
  ❌ Must implement refresh tokens for long-lived sessions
```

### Comparison Table

| Feature         | Cookies (Sessions)       | Tokens (JWT)          |
| --------------- | ------------------------ | --------------------- |
| Server state    | Stateful (session in DB) | Stateless             |
| Scalability     | Harder                   | Easy                  |
| Revocation      | Instant                  | Requires blocklist    |
| Mobile friendly | Limited                  | Excellent             |
| CSRF risk       | High                     | Low                   |
| XSS risk        | Low (HttpOnly cookie)    | Higher (localStorage) |
| Best for        | Traditional web apps     | APIs, SPAs, mobile    |

### Cookie Security Attributes

If you do use cookies, always set these attributes:

```javascript
res.cookie("sessionId", token, {
  httpOnly: true, // JavaScript cannot access — prevents XSS theft
  secure: true, // Only sent over HTTPS — never plain HTTP
  sameSite: "strict", // Prevents CSRF — cookie not sent cross-site
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: "/",
});
```

| Attribute            | Purpose                                                     |
| -------------------- | ----------------------------------------------------------- |
| `httpOnly`           | Prevents `document.cookie` access — protects against XSS    |
| `secure`             | Only sent over HTTPS connections                            |
| `sameSite: strict`   | Cookie not sent with cross-site requests — prevents CSRF    |
| `sameSite: lax`      | Cookie sent with top-level navigation — balanced protection |
| `maxAge` / `expires` | Lifetime of the cookie                                      |

<hr />

## 3. Password Hashing with bcrypt

### Why Plain-Text Storage is Catastrophic

```javascript
// ❌ NEVER store plain text passwords
{ email: 'alice@x.com', password: 'mypassword123' }

// ❌ NEVER store encrypted passwords (encryption is reversible)
{ email: 'alice@x.com', password: encrypt('mypassword123') }

// ✅ Store a one-way hash
{ email: 'alice@x.com', passwordHash: '$2b$12$...' }
```

If your database is breached, plain-text and encrypted passwords are immediately compromised. A hash is a one-way function — you cannot reverse it to get the original password.

### What bcrypt Does

bcrypt is a password hashing function designed to be **slow by design**.

It includes:

- A **salt** : random data added to each password before hashing, so two users with the same password get different hashes
- A **cost factor (rounds)** : controls how many iterations the algorithm runs, making it computationally expensive to brute-force

```bash
npm install bcrypt
```

### Hashing a Password

```javascript
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 12; // higher = slower = more secure (10-12 is typical)

async function hashPassword(plainTextPassword) {
  // bcrypt.hash() automatically generates a salt and hashes
  const hash = await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
  return hash;
}

// Example
const hash = await hashPassword("mypassword123");
console.log(hash);
// '$2b$12$GwbqEv....' — a 60-character string
// The hash itself contains: algorithm, cost factor, salt, and hashed output
```

### Verifying a Password

```javascript
async function verifyPassword(plainTextPassword, storedHash) {
  // bcrypt.compare() extracts the salt from the hash and re-hashes
  // Returns true if they match, false otherwise
  const isMatch = await bcrypt.compare(plainTextPassword, storedHash);
  return isMatch;
}

// Example
const isMatch = await verifyPassword("mypassword123", storedHash);
// true  → passwords match
// false → wrong password
```

### Salt Rounds — Performance vs Security

```javascript
// Cost factor benchmarks (approximate, varies by hardware)
// rounds=10 → ~65ms per hash
// rounds=12 → ~250ms per hash  ← good default
// rounds=14 → ~1000ms per hash
// rounds=16 → ~4000ms per hash

// For registration/login, 250ms is acceptable.
// For an attacker trying millions of combinations, it's prohibitively slow.
```

### Timing-Safe Comparison

```javascript
// ❌ Timing attack vulnerable
if (req.body.password === user.password) { ... }

// ✅ bcrypt.compare uses constant-time comparison — no timing attack possible
const isMatch = await bcrypt.compare(req.body.password, user.passwordHash);
```

Never compare passwords with `===`. bcrypt's `compare` function uses a constant-time algorithm so an attacker cannot determine a password by measuring response time.

<hr />

## 4. JSON Web Tokens (JWT)

### Structure

A JWT is three Base64URL-encoded JSON objects separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJzdWIiOiI0MiIsIm5hbWUiOiJBbGljZSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDA3MjAwfQ
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

└─────── Header ──────┘ └──────────────────────── Payload ────────────────────────┘ └── Signature ──┘
```

**Header**, algorithm and token type:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**, claims (data about the user):

```json
{
  "sub": "42", // subject (user ID)
  "name": "Alice",
  "email": "alice@x.com",
  "role": "admin",
  "iat": 1700000000, // issued at (Unix timestamp)
  "exp": 1700007200 // expires at (Unix timestamp)
}
```

**Signature**, created by the server using the secret key:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  SECRET_KEY
)
```

> **Important:** The payload is only Base64-encoded — NOT encrypted. Anyone who has the token can decode and read it. The signature only proves it hasn't been tampered with. **Never put passwords, credit card numbers, or other secrets in the payload.**

### Standard Claims (Registered Claims)

| Claim | Full Name  | Purpose                                            |
| ----- | ---------- | -------------------------------------------------- |
| `sub` | Subject    | The user this token represents (user ID)           |
| `iat` | Issued At  | When the token was created                         |
| `exp` | Expiration | When the token expires (client must get a new one) |
| `nbf` | Not Before | Token not valid before this time                   |
| `iss` | Issuer     | Who issued the token (e.g. `"myapp.com"`)          |
| `aud` | Audience   | Who the token is intended for                      |
| `jti` | JWT ID     | Unique ID for this token (used for revocation)     |

### Installing and Using `jsonwebtoken`

```bash
npm install jsonwebtoken
```

### Signing a Token

```javascript
const jwt = require("jsonwebtoken");

function generateToken(user) {
  const payload = {
    sub: user.id, // subject — who this token is about
    name: user.name,
    email: user.email,
    role: user.role,
    // iat is set automatically by jsonwebtoken
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m", // access tokens should be short-lived
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

// expiresIn formats:
// '15m'  → 15 minutes
// '1h'   → 1 hour
// '7d'   → 7 days
// 3600   → 3600 seconds
```

### Verifying a Token

```javascript
function verifyToken(token) {
  try {
    // verify() throws if:
    //   - signature is invalid (token was tampered)
    //   - token has expired
    //   - token is not yet valid (nbf)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return { valid: false, reason: "expired" };
    }
    if (err.name === "JsonWebTokenError") {
      return { valid: false, reason: "invalid" };
    }
    return { valid: false, reason: "unknown" };
  }
}
```

### Decoding Without Verification

```javascript
// Decode without verifying signature — use only when you KNOW the token is valid
// or for debugging purposes — NEVER for authentication decisions
const decoded = jwt.decode(token);
console.log(decoded);
// { sub: '42', name: 'Alice', role: 'admin', iat: ..., exp: ... }
```

### Access Token vs Refresh Token Lifetimes

```
Access Token:   15 minutes — 1 hour
  Short-lived. Used for every API request.
  If stolen, attacker has limited time.

Refresh Token:  7 days — 30 days
  Long-lived. Stored securely. Used ONLY to get a new access token.
  If stolen, it can be revoked in the DB.
```

<hr />

## 5. Implementing Registration & Login

### Registration Flow

```
Client sends: POST /auth/register
  { name, email, password }

Server:
  1. Validate inputs (Zod / manual)
  2. Check email not already registered
  3. Hash password with bcrypt
  4. Save user to DB (with hashed password, never plain text)
  5. Generate JWT access token
  6. Return: { user: { id, name, email, role }, token }
```

```javascript
// routes/auth.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const SALT_ROUNDS = 12;

// In-memory "database" for this week — replaced by MongoDB in Week-13
let users = [];
let nextId = 1;

router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // 1. Validate
    if (!name || !email || !password) {
      return next(
        new AppError(
          "name, email, and password are required",
          400,
          "VALIDATION_ERROR",
        ),
      );
    }
    if (password.length < 8) {
      return next(
        new AppError(
          "password must be at least 8 characters",
          400,
          "WEAK_PASSWORD",
        ),
      );
    }

    // 2. Check duplicate
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      return next(
        new AppError("Email already registered", 409, "DUPLICATE_EMAIL"),
      );
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Save user
    const user = {
      id: nextId++,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash, // NEVER store the plain-text password
      role: "user",
      createdAt: new Date().toISOString(),
    };
    users.push(user);

    // 5. Generate token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
    );

    // 6. Respond — never include passwordHash in response
    res.status(201).json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);
```

### Login Flow

```
Client sends: POST /auth/login
  { email, password }

Server:
  1. Find user by email
  2. If not found → return 401 (do NOT say "email not found" — prevents enumeration)
  3. Compare submitted password with stored hash using bcrypt.compare
  4. If wrong → return 401 (same generic message for both cases)
  5. Generate new JWT access token
  6. Return: { user: {...}, token }
```

```javascript
router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError(
          "email and password are required",
          400,
          "VALIDATION_ERROR",
        ),
      );
    }

    // 1. Find user
    const user = users.find((u) => u.email === email.toLowerCase().trim());

    // 2 + 3. Use a generic message whether email not found OR password wrong
    // This prevents user enumeration attacks
    // Also: always run bcrypt.compare even if user not found (prevents timing attacks)
    const dummyHash =
      "$2b$12$dummyhashtopreventtimingattackswhenuserdoesnotexist0000";
    const hashToCompare = user ? user.passwordHash : dummyHash;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      return next(
        new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS"),
      );
      // ^^^ Generic message — don't say "email not found" or "wrong password"
    }

    // 4. Generate token
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
    );

    res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);
```

> **User enumeration:** If you return "email not found" vs "wrong password" as separate messages, an attacker can scan your database for registered emails. Always use the same generic message for both cases.

### Get Current User (Protected Route)

```javascript
// GET /auth/me — requires valid JWT
router.get("/me", authenticate, (req, res) => {
  // req.user was set by the authenticate middleware
  const user = users.find((u) => u.id === req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    status: "success",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
```

<hr />

## 6. Auth Middleware (Protecting Routes)

### The `authenticate` Middleware

```javascript
// middleware/authenticate.js
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

module.exports = function authenticate(req, res, next) {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new AppError(
        "Access denied. No token provided. Use: Authorization: Bearer <token>",
        401,
        "NO_TOKEN",
      ),
    );
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>" → "<token>"

  // 2. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded payload to req.user so downstream handlers can use it
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Token has expired. Please log in again.",
          401,
          "TOKEN_EXPIRED",
        ),
      );
    }
    return next(
      new AppError("Invalid token. Please log in again.", 401, "INVALID_TOKEN"),
    );
  }
};
```

### Optional Authentication

For routes where auth is optional (e.g. public content that shows extra data if logged in):

```javascript
// middleware/optionalAuth.js
const jwt = require("jsonwebtoken");

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = null; // no token — continue as guest
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null; // invalid/expired token — treat as guest, don't error
  }

  next();
};
```

### Protecting Routes

```javascript
const authenticate = require("../middleware/authenticate");

// ── Public routes — no auth required ──────────────────────────────────────────
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/products", getProducts); // public catalog

// ── Protected routes — must be authenticated ──────────────────────────────────
router.get("/auth/me", authenticate, getMe);
router.get("/orders", authenticate, getMyOrders);
router.post("/orders", authenticate, createOrder);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.delete("/users/:id", authenticate, authorizeRole("admin"), deleteUser);
router.get(
  "/admin/stats",
  authenticate,
  authorizeRole("admin", "superadmin"),
  getStats,
);
```

### Protecting an Entire Router

```javascript
// routes/profile.js — every route in this file requires authentication
const router = express.Router();
const authenticate = require("../middleware/authenticate");

// Apply authenticate to ALL routes in this router
router.use(authenticate);

router.get("/", getProfile);
router.put("/", updateProfile);
router.delete("/avatar", deleteAvatar);

module.exports = router;
```

<hr />

## 7. Role-Based Access Control (RBAC)

### The `authorizeRole` Middleware Factory

```javascript
// middleware/authorizeRole.js
const AppError = require("../utils/AppError");

// Returns a middleware that allows only users with one of the specified roles
module.exports = function authorizeRole(...allowedRoles) {
  return function (req, res, next) {
    // req.user must be set by authenticate middleware first
    if (!req.user) {
      return next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.user.role}`,
          403,
          "FORBIDDEN",
        ),
      );
    }

    next();
  };
};
```

### Using `authorizeRole`

```javascript
const authenticate = require("../middleware/authenticate");
const authorizeRole = require("../middleware/authorizeRole");

// Only admins can delete users
router.delete("/users/:id", authenticate, authorizeRole("admin"), deleteUser);

// Admins and editors can publish posts
router.post(
  "/posts/:id/publish",
  authenticate,
  authorizeRole("admin", "editor"),
  publishPost,
);

// Any authenticated user can view their own profile
router.get("/profile", authenticate, getProfile);
```

### Resource Ownership Check

Sometimes users should only be able to modify their own resources:

```javascript
// Users can only update their own profile
router.patch(
  "/users/:id",
  authenticate,
  asyncHandler(async (req, res, next) => {
    const targetId = Number(req.params.id);

    // Allow admins to update any user, regular users only their own
    if (req.user.role !== "admin" && req.user.sub !== targetId) {
      return next(
        new AppError("You can only update your own profile", 403, "FORBIDDEN"),
      );
    }

    // ... proceed with update
  }),
);
```

### RBAC Role Hierarchy Example

```javascript
const ROLES = {
  user: ["read:own"],
  editor: ["read:own", "read:all", "write:own"],
  admin: ["read:own", "read:all", "write:own", "write:all", "delete:own"],
  superadmin: [
    "read:own",
    "read:all",
    "write:own",
    "write:all",
    "delete:own",
    "delete:all",
  ],
};

function hasPermission(role, permission) {
  return (ROLES[role] || []).includes(permission);
}

// Middleware using permission system
function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.user.role, permission)) {
      return next(
        new AppError(`Permission denied: ${permission}`, 403, "FORBIDDEN"),
      );
    }
    next();
  };
}

// Usage
router.delete(
  "/posts/:id",
  authenticate,
  requirePermission("delete:all"),
  deletePost,
);
```

<hr />

## 8. Refresh Tokens

### The Problem with Short-Lived Access Tokens

Access tokens expire in 15 minutes for security. Without refresh tokens, users would have to log in again every 15 minutes, a terrible UX.

### Refresh Token Flow

```
1. On login → server issues TWO tokens:
     accessToken  (expires in 15 min)
     refreshToken (expires in 7 days, stored in DB)

2. Client stores both tokens (usually refreshToken in httpOnly cookie)

3. Client uses accessToken for API requests:
     GET /profile
     Authorization: Bearer <accessToken>

4. AccessToken expires → client calls:
     POST /auth/refresh
     { refreshToken: "..." }  OR  cookie is sent automatically

5. Server:
     a. Finds refreshToken in DB
     b. Checks it's not expired or revoked
     c. Issues a new accessToken
     d. Returns new accessToken to client

6. On logout → server deletes refreshToken from DB
     Even if accessToken is still valid, it expires shortly
     The refreshToken can no longer be used to get new access tokens
```

### Implementation

```javascript
// In-memory refresh token store (use DB in production)
const refreshTokenStore = new Map(); // Map<refreshToken, userId>

// Login — issue both tokens
router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    // ... verify credentials ...

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET, // different secret for refresh tokens
      { expiresIn: "7d" },
    );

    // Store refresh token
    refreshTokenStore.set(refreshToken, user.id);

    res.json({
      status: "success",
      accessToken,
      refreshToken, // or set as httpOnly cookie
      expiresIn: 15 * 60, // 900 seconds
      user: { id: user.id, name: user.name, role: user.role },
    });
  }),
);

// Refresh — use refreshToken to get new accessToken
router.post(
  "/refresh",
  asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(
        new AppError("Refresh token required", 401, "NO_REFRESH_TOKEN"),
      );
    }

    // Check it exists in our store
    if (!refreshTokenStore.has(refreshToken)) {
      return next(
        new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN"),
      );
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = users.find((u) => u.id === decoded.sub);

      if (!user) {
        return next(new AppError("User not found", 401, "USER_NOT_FOUND"));
      }

      // Issue new access token
      const newAccessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      res.json({
        status: "success",
        accessToken: newAccessToken,
        expiresIn: 900,
      });
    } catch (err) {
      // Refresh token expired — user must log in again
      refreshTokenStore.delete(refreshToken);
      return next(
        new AppError(
          "Refresh token expired. Please log in again.",
          401,
          "REFRESH_TOKEN_EXPIRED",
        ),
      );
    }
  }),
);

// Logout — invalidate refresh token
router.post("/logout", authenticate, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokenStore.delete(refreshToken);

  res.json({ status: "success", message: "Logged out successfully" });
});
```

<hr />

## 9. Zod Validation.

### Why Zod Over Manual Validation

Manual validation is verbose, error-prone, and doesn't give you TypeScript types. Zod lets you define a schema once and get validation + type inference together.

```bash
npm install zod
```

### Defining Schemas

```javascript
const { z } = require("zod");

// Registration schema
const registerSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .min(2, "name must be at least 2 characters")
    .max(50, "name must be at most 50 characters")
    .trim(),

  email: z
    .string({ required_error: "email is required" })
    .email("must be a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: "password is required" })
    .min(8, "password must be at least 8 characters")
    .regex(/[A-Z]/, "password must contain at least one uppercase letter")
    .regex(/[0-9]/, "password must contain at least one number"),

  role: z.enum(["user", "editor", "admin"]).default("user").optional(),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email("must be a valid email"),
  password: z.string().min(1, "password is required"),
});
```

### Validating in Routes

```javascript
router.post(
  "/register",
  asyncHandler(async (req, res, next) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      // Transform Zod errors into our field-level format
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      const err = new AppError("Validation failed", 400, "VALIDATION_ERROR");
      err.details = details;
      return next(err);
    }

    const { name, email, password, role } = result.data;
    // result.data is now type-safe and validated
    // ...
  }),
);
```

### Reusable Validation Middleware

```javascript
// middleware/validate.js
// Factory that returns a middleware validating req.body against a Zod schema

const AppError = require("../utils/AppError");

module.exports = function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      const err = new AppError("Validation failed", 400, "VALIDATION_ERROR");
      err.details = details;
      return next(err);
    }

    // Replace req.body with the validated + transformed data
    req.body = result.data;
    next();
  };
};
```

```javascript
// Usage — clean and declarative
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../schemas/auth");

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
```

### Zod for Query Params and Path Params

```javascript
const paginationSchema = z.object({
  page: z
    .string()
    .transform(Number)
    .refine((n) => n > 0, "page must be positive")
    .default("1"),
  limit: z
    .string()
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, "1-100")
    .default("10"),
  sort: z.enum(["createdAt", "-createdAt", "name", "-name"]).optional(),
});

// Validate query params
router.get(
  "/users",
  asyncHandler(async (req, res, next) => {
    const result = paginationSchema.safeParse(req.query);
    if (!result.success) {
      // ...handle error
    }
    const { page, limit, sort } = result.data;
    // page and limit are now numbers, not strings
  }),
);
```

<hr />

## 10. Environment Variables & Secrets

### Required Auth Variables

```dotenv
# .env

# JWT
JWT_SECRET=your-super-secret-key-at-least-32-chars-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=a-different-secret-for-refresh-tokens
JWT_REFRESH_EXPIRES_IN=7d

# bcrypt
BCRYPT_ROUNDS=12

# Server
PORT=3000
NODE_ENV=development
```

### Validating Auth Env Vars with Zod

```javascript
// config/env.js
require("dotenv").config();
const { z } = require("zod");

const envSchema = z.object({
  PORT: z.string().transform(Number).default("3000"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error("Invalid environment variables:");
  result.error.issues.forEach((i) =>
    console.error(`  ${i.path}: ${i.message}`),
  );
  process.exit(1);
}

module.exports = result.data;
```

### Secret Management Rules

```
✅ DO
  - Use long, random secrets (32+ characters)
  - Use different secrets for access and refresh tokens
  - Rotate secrets periodically
  - Store secrets in environment variables or a vault (AWS Secrets Manager, HashiCorp Vault)
  - Use different secrets for different environments (dev/staging/prod)

❌ NEVER
  - Hardcode secrets in source code
  - Commit .env files to version control
  - Use short or guessable secrets ("secret", "password", "jwt_secret")
  - Reuse secrets across environments
  - Log JWT secrets or hash outputs
```

<hr />

## 11. Security Best Practices & HTTP Headers

### `helmet` (Security Headers).

```bash
npm install helmet
```

`helmet` sets multiple security-related HTTP headers automatically:

```javascript
const helmet = require("helmet");
app.use(helmet()); // sets all headers with sensible defaults
```

Headers set by helmet:

| Header                            | What It Does                                                |
| --------------------------------- | ----------------------------------------------------------- |
| `Content-Security-Policy`         | Restricts sources for scripts, styles, images               |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing                                 |
| `X-Frame-Options: DENY`           | Prevents your site being embedded in iframes (clickjacking) |
| `Strict-Transport-Security`       | Forces HTTPS for subsequent requests                        |
| `X-XSS-Protection`                | Enables browser XSS filter (legacy, CSP is better)          |
| `Referrer-Policy`                 | Controls referrer header behaviour                          |

### CORS Configuration

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies and auth headers
  }),
);
```

### Rate Limiting (Auth Endpoints)

Auth endpoints need stricter rate limits to prevent brute-force attacks:

```javascript
const rateLimit = require("express-rate-limit");

// Strict limit on login — prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  message: {
    status: "fail",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
```

### Input Sanitization

```javascript
// Trim all string inputs before processing
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [
        k,
        typeof v === "string" ? v.trim() : v,
      ]),
    );
  }
  next();
}

app.use(express.json());
app.use(sanitizeBody); // trim after JSON parsing
```

### Preventing Common Attacks

**SQL/NoSQL Injection:**

```javascript
// ❌ Vulnerable — user input directly in query
db.query(`SELECT * FROM users WHERE email = '${req.body.email}'`);

// ✅ Safe — parameterized query
db.query("SELECT * FROM users WHERE email = $1", [req.body.email]);

// ✅ Safe with Mongoose — mongoose sanitizes by default
User.findOne({ email: req.body.email });
```

**XSS (Cross-Site Scripting):**

```javascript
// Never return raw user input in HTML responses
// For JSON APIs this is less of a concern, but sanitize when rendering HTML

const xss = require("xss-clean"); // or use DOMPurify on the frontend
app.use(xss());
```

**Mass Assignment:**

```javascript
// ❌ Mass assignment — attacker can set role: 'admin' in request body
const user = { ...req.body }; // user could send { role: 'admin' }

// ✅ Explicitly pick only allowed fields
const { name, email, password } = req.body;
const user = { name, email, password };
```

<hr />

## 12. OWASP Top 10 (Awareness)

The OWASP (Open Web Application Security Project) Top 10 is the industry standard list of the most critical web application security risks.

### A01 — Broken Access Control

The most common vulnerability. Users can access data or perform actions they shouldn't.

```javascript
// ❌ Broken — user can access ANY order
router.get("/orders/:id", authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order); // returns any user's order!
});

// ✅ Fixed — enforce ownership
router.get("/orders/:id", authenticate, async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found", 404));

  // Only allow owner or admin
  if (order.userId !== req.user.sub && req.user.role !== "admin") {
    return next(new AppError("Access denied", 403, "FORBIDDEN"));
  }
  res.json(order);
});
```

### A02 — Cryptographic Failures

Storing or transmitting sensitive data without proper encryption.

```javascript
// ❌ Never store plain-text passwords
{
  password: "mypassword";
}

// ❌ Never use MD5 or SHA1 for passwords (fast, no salt)
crypto.createHash("md5").update(password).digest("hex");

// ✅ Always use bcrypt (slow, salted)
await bcrypt.hash(password, 12);
```

### A03 — Injection

Untrusted data sent to an interpreter as part of a command or query.

```javascript
// ❌ SQL injection
`SELECT * FROM users WHERE id = ${req.params.id}`;

// ❌ NoSQL injection
User.findOne({ email: req.body.email }); // if email = { $gt: "" }, matches all!

// ✅ Validate types before using in queries
const id = parseInt(req.params.id, 10);
if (isNaN(id)) return next(new AppError("Invalid ID", 400));
```

### A04 — Insecure Design

Security is not built into the design. Examples:

- No rate limiting on login → brute force possible
- Password reset link never expires
- No account lockout after failed attempts

### A05 — Security Misconfiguration

Default passwords left in place, unnecessary features enabled, error messages exposing stack traces.

```javascript
// ❌ Sending stack traces in production
res.json({ error: err.stack }); // exposes file paths, library versions

// ✅ Generic message in production
res.json({ message: 'Something went wrong' });

// ❌ Default/weak JWT secrets
JWT_SECRET=secret

// ✅ Strong random secret
JWT_SECRET=xK9#mP2$vL8@nQ5&wR3!yT6^uI1*oH4%
```

### A06 — Vulnerable and Outdated Components

```bash
# Check for vulnerabilities in your dependencies
npm audit

# Fix automatically where possible
npm audit fix

# Check for outdated packages
npm outdated
```

### A07 — Identification and Authentication Failures

- Weak passwords allowed
- No brute-force protection on login
- JWT secret is weak or hardcoded
- Sessions not invalidated on logout

### A08 — Software and Data Integrity Failures

Trusting data from untrusted sources without verification. Example: accepting a JWT `alg: none` attack.

```javascript
// ❌ Vulnerable — accepts alg: none (no signature required)
jwt.verify(token, secret, { algorithms: ["HS256", "none"] });

// ✅ Always specify allowed algorithms explicitly
jwt.verify(token, secret, { algorithms: ["HS256"] });
```

### A09 — Security Logging and Monitoring Failures

Not logging authentication events makes incident response impossible.

```javascript
// Log auth events
logger.info("auth.login.success", { userId, ip, userAgent });
logger.warn("auth.login.failed", {
  email: maskEmail(email),
  ip,
  reason: "wrong_password",
});
logger.warn("auth.token.invalid", { ip, reason: err.name });
```

### A10 — Server-Side Request Forgery (SSRF)

Server fetches a URL provided by the user — attacker can make the server call internal services.

```javascript
// ❌ Never fetch user-provided URLs directly
const data = await fetch(req.body.url);

// ✅ Whitelist allowed domains
const ALLOWED_DOMAINS = ["api.example.com", "cdn.example.com"];
const url = new URL(req.body.url);
if (!ALLOWED_DOMAINS.includes(url.hostname)) {
  return next(new AppError("URL not allowed", 400));
}
```

<hr />

## 13. Connecting Frontend to Backend

### Making Authenticated Requests from a Frontend

**Using `fetch`:**

```javascript
// Store the token (in memory is safest, but sessionStorage is common)
let accessToken = null;

// Login
async function login(email, password) {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (res.ok) {
    accessToken = data.token; // store in memory
    return data.user;
  }
  throw new Error(data.message);
}

// Authenticated request
async function getProfile() {
  const res = await fetch("/api/v1/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
}
```

### Using Axios with Interceptors

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

// Request interceptor — attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // or from state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh the token
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await axios.post("/api/v1/auth/refresh", { refreshToken });
        localStorage.setItem("accessToken", res.data.accessToken);

        // Retry the original request with new token
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return axios(error.config);
      } catch {
        // Refresh failed — redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
```

### CORS Configuration for Frontend

```javascript
// Backend — allow your frontend's origin
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Frontend fetch — must include credentials: 'include' for cookies
const res = await fetch("/api/v1/auth/login", {
  method: "POST",
  credentials: "include", // send cookies cross-origin
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

### Token Storage (Where to Keep the Token)

| Storage              | XSS Risk              | CSRF Risk                        | Notes                                                         |
| -------------------- | --------------------- | -------------------------------- | ------------------------------------------------------------- |
| `localStorage`       | High (JS can read it) | Low                              | Persists after tab close — not recommended for sensitive apps |
| `sessionStorage`     | High (JS can read it) | Low                              | Cleared when tab closes                                       |
| Memory (JS variable) | Low                   | Low                              | Lost on page refresh — need refresh token                     |
| `httpOnly` cookie    | None (JS can't read)  | Medium (mitigated by `sameSite`) | Most secure for web apps                                      |

**Recommended approach:**

- Access token → in-memory JS variable (not `localStorage`)
- Refresh token → `httpOnly`, `secure`, `sameSite=strict` cookie

<hr />

## Assignment.

1. Register, Login & Protected Routes.

   **What you practice:**

   `bcrypt` password hashing with salt rounds; JWT signing and verifying with `jsonwebtoken`; centralised token utility (`utils/token.js`); manual field-level validation; `authenticate` middleware that reads Bearer tokens; `authorizeRole` factory middleware; resource ownership enforcement (admin sees all, user sees own); user enumeration prevention (same error for wrong email OR wrong password); timing-attack prevention (always run `bcrypt.compare`); `sanitizeUser` to strip `passwordHash` from every response.

   **Requirements:**
   - `POST /auth/register` — validate, hash password, return JWT
   - `POST /auth/login` — timing-safe, enumeration-safe, return JWT
   - `GET  /auth/me` — protected: return own profile
   - `GET  /users` — admin sees all, others see own only
   - `GET  /users/:id` — admin or own profile only
   - `PATCH /users/:id` — admin or own; non-admin cannot change role
   - `DELETE /users/:id` — admin only
   - `POST /users/:id/promote` — admin only, promote to editor

   [Solution](./Assignment/code1)

   **Postman Test Cases — A1**

   ```
   # Register
   POST http://localhost:3001/auth/register
   Body: { "name": "Alice", "email": "alice@example.com", "password": "password123" }
   → 201 { token, user }   (no passwordHash in user!)

   # Login — correct
   POST http://localhost:3001/auth/login
   Body: { "email": "alice@example.com", "password": "password123" }
   → 200 { token, user }

   # Login — wrong password (same message as wrong email)
   POST http://localhost:3001/auth/login
   Body: { "email": "alice@example.com", "password": "wrongpassword" }
   → 401 INVALID_CREDENTIALS "Invalid email or password"

   # Login — email not registered (same message as wrong password)
   POST http://localhost:3001/auth/login
   Body: { "email": "nobody@x.com", "password": "anything" }
   → 401 INVALID_CREDENTIALS "Invalid email or password"

   # Protected route — use token from register/login
   GET http://localhost:3001/auth/me
   Header: Authorization: Bearer <token>
   → 200 { user }

   # No token
   GET http://localhost:3001/auth/me
   → 401 NO_TOKEN

   # Non-admin tries to list all users
   GET http://localhost:3001/users
   Header: Authorization: Bearer <alice_token>   (alice is 'user' role)
   → 200 { count: 1, data: [alice only] }

   # Register an admin for testing (register then manually check store,
   #   or register with role override not exposed in this assignment)
   # Tip: use PATCH to change role while store is small and you're admin

   # Admin only — delete user
   DELETE http://localhost:3001/users/2
   Header: Authorization: Bearer <non_admin_token>
   → 403 FORBIDDEN

   # Promote to editor
   POST http://localhost:3001/users/2/promote
   Header: Authorization: Bearer <admin_token>
   → 200 { message: "X promoted to editor" }
   ```

2. Refresh Tokens, Zod Validation & Multi-Role RBAC.

   **What you practice:**

   Zod schemas with `.trim()`, `.toLowerCase()` before `.email()` (Zod v4 required order); reusable `validate(schema)` middleware; access + refresh token pair with separate secrets (`JWT_SECRET` vs `JWT_REFRESH_SECRET`); `POST /auth/refresh` to renew an access token; `POST /auth/logout` to revoke the refresh token from the in-memory store; multi-role `authorizeRole('editor', 'admin')`; author ownership check on post mutation; `POST /posts/:id/publish` action route with 409 conflict; rate limiting on auth endpoints.

   **Requirements:**
   - Zod schemas for register (password strength rules), login, and refresh
   - `validate(schema)` middleware — replaces `req.body` with cleaned data
   - Two tokens on login/register: `accessToken` (15 min) + `refreshToken` (7 days)
   - `POST /auth/refresh` — verify refreshToken → issue new accessToken
   - `POST /auth/logout` — remove refreshToken from store
   - Rate limiter on all `/auth/*` routes
   - Full CRUD on `/posts` with RBAC: create/publish = editor+admin, delete = admin only
   - Editors can only publish their own posts

   [Solution](./Assignment/code2/)

   **Postman Test Cases.**

   ```
   # Register as editor (role in body)
   POST http://localhost:3002/auth/register
   Body: { "name": "Alice", "email": "alice@x.com", "password": "Password1", "role": "editor" }
   → 201 { accessToken, refreshToken, expiresIn: 900, user }

   # Register as user (default role)
   POST http://localhost:3002/auth/register
   Body: { "name": "Bob", "email": "bob@x.com", "password": "Password1" }
   → 201 (role defaults to 'user')

   # Zod validation failures
   POST http://localhost:3002/auth/register
   Body: { "name": "A", "email": "bad", "password": "weak" }
   → 400 VALIDATION_ERROR { details: [{ field, message }, ...] }

   # Login and save both tokens
   POST http://localhost:3002/auth/login
   Body: { "email": "alice@x.com", "password": "Password1" }
   → 200 { accessToken, refreshToken }

   # Refresh — use accessToken that would expire (or shorten JWT_EXPIRES_IN to '5s' for testing)
   POST http://localhost:3002/auth/refresh
   Body: { "refreshToken": "<refreshToken from login>" }
   → 200 { accessToken: <new token> }

   # Logout — revoke refreshToken
   POST http://localhost:3002/auth/logout
   Header: Authorization: Bearer <accessToken>
   Body: { "refreshToken": "<refreshToken>" }
   → 200 { message: 'Logged out successfully' }

   # Try refreshToken after logout
   POST http://localhost:3002/auth/refresh
   Body: { "refreshToken": "<same refreshToken>" }
   → 401 INVALID_REFRESH_TOKEN

   # RBAC — user tries to create post (403)
   POST http://localhost:3002/posts
   Header: Authorization: Bearer <bob_access_token>
   Body: { "title": "Test", "content": "Test content here" }
   → 403 FORBIDDEN

   # Editor creates a post (201 — draft)
   POST http://localhost:3002/posts
   Header: Authorization: Bearer <alice_access_token>
   → 201 { published: false }

   # Editor publishes own post
   POST http://localhost:3002/posts/4/publish
   Header: Authorization: Bearer <alice_access_token>
   → 200

   # Editor tries to publish someone else's post (403)
   POST http://localhost:3002/posts/1/publish
   Header: Authorization: Bearer <alice_access_token>
   (post 1 belongs to authorId 1, alice is a different user)
   → 403 FORBIDDEN

   # Admin deletes any post
   DELETE http://localhost:3002/posts/3
   Header: Authorization: Bearer <admin_access_token>
   → 204
   ```

3. Full Production Auth API.

   **What you practice:**

   Everything from A1 and A2 plus: Zod env validation with `process.exit(1)` on failure; `config/env.js` consumed by all modules (no direct `process.env` access in routes); Winston logger with PII masking (`maskEmail`); `POST /auth/change-password` that verifies the current password and revokes ALL refresh tokens for that user (forces re-login on every device); `POST /users/:id/promote` with target role in body; admin self-delete prevention; `app.js` / `index.js` architecture split; `helmet` + `cors` + `morgan` through Winston; graceful shutdown with 30-second timeout.

   **Requirements:**
   - `config/env.js` — Zod validates all env vars at startup, `process.exit(1)` on failure
   - `config/logger.js` — Winston, dev colorised / prod JSON, `morganStream`
   - `POST /auth/change-password` — verify `currentPassword` with bcrypt, hash `newPassword`, revoke all refresh tokens for that user
   - `POST /users/:id/promote` — body `{ role: 'editor' | 'admin' }`, reject invalid targets, 409 if already that role
   - Admin cannot delete their own account (`409 CANNOT_DELETE_SELF`)
   - `maskEmail` used before every auth log (never log full email)
   - `sanitizeUser` applied to every response (strips `passwordHash`)
   - `helmet()`, `cors()` from `ALLOWED_ORIGINS` env var
   - `app.js` (Express config) + `index.js` (server + process handlers)

   [Solution](./Assignment/code3/)

   **Postman test Cases.**

   ```
   # Health check
   GET http://localhost:3003/health

   # Register
   POST http://localhost:3003/auth/register
   Body: { "name": "Alice", "email": "alice@example.com", "password": "Password1", "role": "admin" }
   → 201 { accessToken, refreshToken, user }  (no passwordHash!)

   # Login
   POST http://localhost:3003/auth/login
   Body: { "email": "alice@example.com", "password": "Password1" }

   # Change password (protected)
   POST http://localhost:3003/auth/change-password
   Header: Authorization: Bearer <accessToken>
   Body: { "currentPassword": "Password1", "newPassword": "NewPassword2" }
   → 200 "Password changed. Please log in again."
   # Try old refreshToken after password change → 401 INVALID_REFRESH_TOKEN (revoked!)

   # Wrong current password
   POST http://localhost:3003/auth/change-password
   Header: Authorization: Bearer <accessToken>
   Body: { "currentPassword": "wrongpass", "newPassword": "NewPassword2" }
   → 401 WRONG_PASSWORD

   # Promote user
   POST http://localhost:3003/users/2/promote
   Header: Authorization: Bearer <admin_accessToken>
   Body: { "role": "editor" }
   → 200

   # Promote with invalid role
   POST http://localhost:3003/users/2/promote
   Body: { "role": "superuser" }
   → 400 INVALID_ROLE

   # Admin cannot delete self
   DELETE http://localhost:3003/users/1     (admin deleting own id)
   Header: Authorization: Bearer <admin_accessToken>
   → 409 CANNOT_DELETE_SELF

   # helmet headers — inspect response headers:
   # X-Content-Type-Options: nosniff
   # X-Frame-Options: SAMEORIGIN
   # Strict-Transport-Security: ...

   # Check logs — confirm:
   # ✓ maskedEmail appears (not full email)
   # ✓ passwords NEVER appear in any log line
   # ✓ requestId links all logs for one request
   ```
