# How to Build.

```
Step 1 — Initialise
  mkdir code2 && cd code2
  npm init -y
  npm install express ioredis jsonwebtoken bcrypt dotenv crypto
  npm install --save-dev nodemon

Step 2 — Create .env
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=a_very_long_random_secret_at_least_32_chars
  PORT=3000

Step 3 — Create lib/redis.js (same singleton pattern as Assignment 1)

Step 4 — Create data/users.js
  In-memory array. findByEmail(email), findById(id), createUser(email, passwordHash).

Step 5 — Create middleware/rateLimit.js
  createRateLimiter({ windowSeconds, maxRequests, keyPrefix }).
  INCR the key. On first request (count === 1), set EXPIRE.
  Set X-RateLimit-* headers on every request.
  Return 429 if count > maxRequests.

Step 6 — Create middleware/authenticate.js
  Read Authorization: Bearer token header.
  jwt.verify with { algorithms: ['HS256'] }.
  Set req.user = decoded. Return 401 on failure.

Step 7 — Create routes/auth.js
  POST /register: bcrypt.hash, createUser, return { message, email }.
  POST /login:
    Find user, bcrypt.compare.
    jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' }).
    crypto.randomBytes(40).toString('hex') for refresh token.
    redis.set(`refresh:${refreshToken}`, userId, 'EX', 604800).
    redis.sadd(`refresh:tokens:user:${userId}`, refreshToken) — track all tokens.
    redis.expire(`refresh:tokens:user:${userId}`, 604800).
    Return { accessToken, refreshToken }.
  POST /refresh:
    redis.get(`refresh:${oldToken}`) → get userId.
    redis.del(`refresh:${oldToken}`), redis.srem the token from the user set.
    Issue new pair, return.
  POST /logout:
    redis.del(`refresh:${token}`), redis.srem from user set.
  POST /logout-all:
    redis.smembers(`refresh:tokens:user:${userId}`).
    redis.del all refresh tokens, then del the set itself.
  GET /me: authenticate middleware, return user from store.

Step 8 — Create server.js and apply rate limiter to /api/auth.
```