# Security Audit Report for Assignment 3.

## Summary

6 vulnerabilities found spanning 5 OWASP categories.

| #   | Endpoint / Line                        | OWASP Category                     | Impact                                          |
| --- | -------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| 1   | `jwt.sign(...)` — no expiry            | A07 — Auth Failures                | Stolen token is valid forever                   |
| 2   | `auth` middleware — no try/catch       | A05 — Security Misconfiguration    | Invalid token crashes the server (500 / exit)   |
| 3   | `POST /api/orders` — no qty validation | A04 — Insecure Design              | Negative quantity → negative total (free money) |
| 4   | `GET /api/orders/:id` — no ownership   | A01 — Broken Access Control (IDOR) | Any user can read any other user's order        |
| 5   | `POST /api/preview` — no URL check     | A10 — SSRF                         | Server fetches internal cloud metadata endpoint |
| 6   | `GET /api/admin/orders` — no auth      | A01 — Broken Access Control        | Anyone (unauthenticated) can list all orders    |

---

## Vulnerability 1 — JWT With No Expiry (A07)

**Vulnerable code:**

```js
const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
// No third argument — token has no expiry
```

**Impact:** A token stolen from a browser, a log file, or an intercepted request
is valid indefinitely. There is no time window after which the attacker loses access.

**Proof:**

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@shop.com","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Decode the payload and look for an 'exp' field
echo $TOKEN | cut -d. -f2 | \
  node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
    const p = JSON.parse(Buffer.from(d.trim(),'base64url').toString());
    console.log(p);
  })"
# VULNERABLE: { userId:1, role:'user', iat:... }  — no 'exp' field
# FIXED:      { userId:1, role:'user', iat:..., exp:... }
```

**Fix in `src/routes/auth.js`:**

```js
jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: "15m" });
```

---

## Vulnerability 2 — Auth Middleware Crash (A05)

**Vulnerable code:**

```js
function auth(req, res, next) {
  const token = req.headers["x-token"];
  if (!token) return res.status(401).json({ message: "No token" });
  req.user = jwt.verify(token, SECRET); // throws if invalid — no try/catch
  next();
}
```

**Impact:** Any invalid or expired token throws `JsonWebTokenError`. Without try/catch
this propagates as an unhandled exception — either crashing the Node.js process or
returning a 500 with a full stack trace revealing internal file paths.

**Proof:**

```bash
curl http://localhost:3000/api/orders/1 \
  -H "x-token: thisisnotavalidjwt"
# VULNERABLE: 500 Internal Server Error (or process crash)
# FIXED:      401 { message: 'Invalid or expired token' }
```

**Fix in `src/middleware/auth.js`:**

```js
try {
  req.user = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  next();
} catch (err) {
  return res.status(401).json({ message: "Invalid or expired token" });
}
```

---

## Vulnerability 3 — Negative Quantity (A04)

**Vulnerable code:**

```js
const { productId, quantity } = req.body;
const total = product.price * quantity; // no validation on quantity
```

**Impact:** Attacker sends `quantity: -5`. Total = `999 × -5 = -4995`.
Depending on how checkout logic handles a negative total, this can apply a credit,
grant free products, or corrupt billing records.

**Proof:**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-token: <alice_token>" \
  -d '{"productId": 1, "quantity": -5}'
# VULNERABLE: 201 { total: -4995 }
# FIXED:      400 { message: 'quantity must be a positive integer' }
```

**Fix in `src/routes/orders.js`:**

```js
if (!Number.isInteger(quantity) || quantity <= 0) {
  return res
    .status(400)
    .json({ message: "quantity must be a positive integer" });
}
```

---

## Vulnerability 4 — IDOR on GET /api/orders/:id (A01)

**Vulnerable code:**

```js
app.get("/api/orders/:id", auth, (req, res) => {
  const order = orders.find((o) => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ message: "Not found" });
  res.json(order); // no ownership check
});
```

**Impact:** Any authenticated user can read any order by changing the numeric ID
in the URL. Order records may include personal details and delivery addresses.

**Proof:**

```bash
# Place an order as Alice (becomes order id 1)
curl -X POST http://localhost:3000/api/orders \
  -H "x-token: <alice_token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":1}'

# Register Bob and read Alice's order
curl http://localhost:3000/api/orders/1 \
  -H "x-token: <bob_token>"
# VULNERABLE: 200 with Alice's order data
# FIXED:      403 { message: 'Forbidden' }
```

**Fix in `src/routes/orders.js`:**

```js
if (order.userId !== req.user.userId && req.user.role !== "admin") {
  return res.status(403).json({ message: "Forbidden" });
}
```

---

## Vulnerability 5 — SSRF on POST /api/preview (A10)

**Vulnerable code:**

```js
app.post("/api/preview", auth, async (req, res) => {
  const { url } = req.body;
  const response = await axios.get(url); // fetches any URL — no validation
  res.json({ title: response.data.slice(0, 200) });
});
```

**Impact:** Attacker points the URL at `http://169.254.169.254/latest/meta-data/iam/security-credentials/my-role`.
The server fetches this from inside the cloud network and returns IAM credentials —
the keys authorising access to the entire AWS infrastructure.

**Proof:**

```bash
curl -X POST http://localhost:3000/api/preview \
  -H "Content-Type: application/json" \
  -H "x-token: <alice_token>" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'
# VULNERABLE (on AWS): 200 with IAM credentials
# FIXED:               400 { error: 'URL not allowed' }
```

**Fix in `src/routes/preview.js` + `src/utils/ssrf.js`:**

```js
if (!(await isSafeUrl(url))) {
  return res.status(400).json({ error: "URL not allowed" });
}
// isSafeUrl: https-only + DNS resolution + private IP blocklist + maxRedirects: 0
```

---

## Vulnerability 6 — Unauthenticated Admin Endpoint (A01)

**Vulnerable code:**

```js
app.get("/api/admin/orders", (req, res) => {
  // no middleware at all
  res.json(orders);
});
```

**Impact:** Anyone — including completely unauthenticated requests — can retrieve
all orders from the system with no credentials whatsoever.

**Proof:**

```bash
curl http://localhost:3000/api/admin/orders
# No token, no headers
# VULNERABLE: 200 with all orders
# FIXED:      401 { message: 'No token' }
```

**Fix in `src/routes/orders.js`:**

```js
router.get("/admin/orders", auth, requireRole("admin"), (req, res) => {
  res.json(store.orders);
});
```

---

## What each file does

| File                             | Purpose                                                        |
| -------------------------------- | -------------------------------------------------------------- |
| `.env`                           | Environment variables — never committed to Git                 |
| `.gitignore`                     | Keeps secrets and `node_modules` out of version control        |
| `package.json`                   | Project metadata and dependency list                           |
| `index.js`                       | Entry point — mounts all middleware, routes, starts the server |
| `VULNERABILITIES.md`             | Full audit report: 6 findings with OWASP categories and proofs |
| `config/env.js`                  | Env var loading + startup guard that exits on bad config       |
| `config/store.js`                | Shared in-memory users, products, and orders                   |
| `src/middleware/auth.js`         | `auth` (try/catch fix) + `requireRole` factory                 |
| `src/middleware/errorHandler.js` | Env-aware global error handler                                 |
| `src/routes/auth.js`             | Login with JWT expiry fix + register                           |
| `src/routes/orders.js`           | Qty validation + IDOR fix + admin auth guard                   |
| `src/routes/products.js`         | Product listing + search with reflected input sanitization     |
| `src/routes/preview.js`          | SSRF-protected URL preview                                     |
| `src/utils/ssrf.js`              | DNS-resolving URL validator blocking all private IP ranges     |
| `src/utils/escapeHtml.js`        | HTML entity encoder for user-supplied strings in responses     |
