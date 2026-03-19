# Vulnerabilities Found.

## Vulnerability 1 — IDOR on GET /api/notes/:id

**OWASP Category:** A01 — Broken Access Control

**Vulnerable lines in the starter code:**

```js
app.get("/api/notes/:id", authMiddleware, (req, res) => {
  const note = notes.find((n) => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ message: "Not found" });
  res.json(note); // ← returned with no ownership check
});
```

**What an attacker can do:**
Any authenticated user can read any other user's note by changing the numeric ID
in the URL. No check is performed to verify the note belongs to the requesting user.

**Proof of exploit:**

```bash
# Register Carol (owns no pre-seeded notes)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@example.com","password":"password123"}'

# Login as Carol and capture the token
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@example.com","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Read Alice's private note as Carol — should be 403, returns 200
curl http://localhost:3000/api/notes/1 \
  -H "Authorization: Bearer $TOKEN"
# BEFORE fix → 200 { id:1, userId:1, title:"Alice secret plan", body:"Launch on Monday" }
# AFTER  fix → 403 { message: 'Forbidden' }
```

**Fix applied in `src/routes/notes.js`:**

```js
if (note.userId !== req.user.userId) {
  return res.status(403).json({ message: "Forbidden" });
}
```

---

## Vulnerability 2 — Privilege Escalation via Mass Assignment on POST /api/register

**OWASP Category:** A01 — Broken Access Control (via mass assignment)

**Vulnerable lines in the starter code:**

```js
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;   // ← reads role from client
  const hashed = await bcrypt.hash(password, 10);
  const user   = { id: ..., email, password: hashed, role }; // ← uses it directly
  users.push(user);
});
```

**What an attacker can do:**
By including `"role": "admin"` in the registration body, an attacker registers
themselves as an admin and can immediately access all admin-only routes.

**Proof of exploit:**

```bash
# Register with role: admin in the body
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"evil@example.com","password":"password123","role":"admin"}'

# Login as the evil user
EVIL_TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"evil@example.com","password":"password123"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Access the admin users list — should be 403, returns 200
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $EVIL_TOKEN"
# BEFORE fix → 200 full user list
# AFTER  fix → 403 { message: 'Forbidden' }
```

**Fix applied in `src/routes/auth.js`:**

```js
// Only destructure email and password — role is never read from req.body
const { email, password } = req.body;
...
role: 'user', // always set by the server
```

---

## What each file does

| File                             | Purpose                                                      |
| -------------------------------- | ------------------------------------------------------------ |
| `.env`                           | Environment variables — never committed to Git               |
| `.gitignore`                     | Keeps `.env` and `node_modules` out of version control       |
| `package.json`                   | Project metadata and dependency list                         |
| `index.js`                       | Entry point — mounts all routes and starts the server        |
| `VULNERABILITIES.md`             | Audit report with both bug findings, proofs, and OWASP refs  |
| `config/env.js`                  | Env vars + JWT startup guard                                 |
| `config/store.js`                | Shared in-memory users and notes store                       |
| `src/middleware/auth.js`         | `auth` middleware + `requireRole` factory                    |
| `src/middleware/errorHandler.js` | Env-aware global error handler                               |
| `src/routes/auth.js`             | Register (mass assignment fix) + login                       |
| `src/routes/notes.js`            | Notes routes with IDOR fix + mass assignment fix on creation |
| `src/routes/admin.js`            | Admin-only user listing route                                |
