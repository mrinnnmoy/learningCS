# List of thing learned.

## 1. What is Redis?

**Redis** stands for **Remote Dictionary Server**.

It is an open-source, in-memory data store that works as a database, cache, message broker and queue. Often all at once in the same application.

The defining characteristic of Redis is that it stores everything in RAM.

Reading from RAM is roughly 100,000× faster than reading from a spinning disk and around 1,000× faster than reading from an SSD.

This makes Redis the go-to solution for any data that needs to be accessed extremely quickly and repeatedly.

```
Typical response times:

  PostgreSQL query (indexed)   →  1–10ms
  MongoDB query (indexed)      →  1–5ms
  Redis GET                    →  0.1–0.3ms   ← 10–50x faster

At 10,000 requests/second hitting the same product page,
hitting PostgreSQL every time is expensive and slow.
Redis serves the cached result in under a millisecond.
```

### Redis vs a Traditional Database.

Redis is not a replacement for PostgreSQL or MongoDB.

They solve different problems and are almost always used together.

```
PostgreSQL / MongoDB                       Redis
─────────────────────────────────────────  ──────────────────────────────────────────
Persistent (data survives restarts)        In-memory (data lost on restart by default)
Complex queries, joins, aggregations       Simple key-value lookups
Relational / document structure            Flat keys with typed values
Gigabytes to terabytes of data             Gigabytes of hot data (limited by RAM)
Source of truth                            Cache / speed layer / ephemeral storage
Seconds to minutes for complex queries     Sub-millisecond for any operation
```

### What Redis is Used For in Production.

```
Caching            → Store the result of expensive DB queries. Serve from memory next time.
Sessions           → Store JWT refresh tokens, user session data with automatic expiry.
Rate limiting      → Count requests per IP per minute using atomic increments.
OTP / verification → Store one-time passwords with a TTL that auto-expires them.
Leaderboards       → Sorted sets make ranked lists trivial and fast.
Pub/Sub messaging  → Real-time event broadcasting between services.
Job queues         → Background task processing (used by Bull/BullMQ).
Distributed locks  → Prevent race conditions across multiple server instances.
```

---

## 2. Installation and Setup.

### Installing Redis.

**macOS:**

```bash
brew install redis
brew services start redis

# Verify
redis-cli ping
# PONG
```

**Ubuntu / Debian:**

```bash
sudo apt update
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
# PONG
```

**Windows:** Redis is not natively supported on Windows. Use one of:

- WSL2 (Windows Subsystem for Linux) and install as Ubuntu above.
- Docker: `docker run -d -p 6379:6379 --name redis redis:alpine`
  **Docker (any OS — recommended for development):**

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine

# Connect to it
docker exec -it redis redis-cli
```

### Redis CLI Basics.

The `redis-cli` is an interactive shell for running commands directly against your Redis instance.

Everything you can do from Node.js, you can test here first.

```bash
redis-cli          # connect to localhost:6379
redis-cli -h host -p 6379 -a password   # connect to a remote instance

# Once inside redis-cli:
PING               # → PONG (connection test)
INFO server        # server info: version, OS, uptime
INFO memory        # memory usage stats
DBSIZE             # number of keys in the current database
FLUSHDB            # delete all keys in the current database (careful!)
FLUSHALL           # delete ALL keys across ALL databases (very careful!)
```

### Connecting from Node.js with `ioredis`.

`ioredis` is the most feature-complete Redis client for Node.js.

It supports all Redis commands, automatic reconnection, pipelining, Lua scripts and Sentinel/Cluster.

```bash
npm install ioredis dotenv
```

```javascript
// lib/redis.js
const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  console.error("FATAL: REDIS_URL is not set in .env");
  process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL, {
  // Automatically retry on connection failure
  retryStrategy(times) {
    if (times > 5) {
      console.error("Redis: too many reconnect attempts. Giving up.");
      return null; // stop retrying
    }
    return Math.min(times * 200, 2000); // wait 200ms, 400ms, 600ms... up to 2s
  },
  // Disconnect after 5s of inactivity (keeps the pool clean)
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));
redis.on("reconnecting", () => console.log("Redis reconnecting..."));

module.exports = redis;
```

```
# .env
REDIS_URL=redis://localhost:6379
# With password: redis://:yourpassword@localhost:6379
# Cloud (Upstash, Redis Cloud): rediss://username:password@host:6380
```

---

## 3. Data Structures.

Redis is not just a key-value store. It supports multiple data structures, each optimised for specific use cases.

Understanding which structure to reach for is the core Redis skill.

### String.

The simplest type. A key maps to a single value — a string, number or binary blob.

Strings in Redis can hold up to 512MB.

```bash
# SET and GET
SET username "alice"
GET username            # → "alice"

# SET with expiry (EX = seconds, PX = milliseconds)
SET session:abc123 "user:1" EX 3600    # expires in 1 hour
TTL session:abc123                      # → 3598 (seconds remaining)
PTTL session:abc123                     # → milliseconds remaining

# SET only if key does not exist (NX = Not eXists)
# Returns OK if set, nil if key already existed
SET lock:resource1 "locked" NX EX 30   # atomic lock acquisition

# SET and return old value at the same time
GETSET counter "0"

# Atomic increment / decrement
SET views:post:42 0
INCR views:post:42         # → 1  (atomic, thread-safe)
INCR views:post:42         # → 2
INCRBY views:post:42 10    # → 12
DECR views:post:42         # → 11
DECRFLOAT views:post:42 0.5  # → 10.5

# Check existence and delete
EXISTS username            # → 1 (exists) or 0 (does not exist)
DEL username               # → 1 (number deleted)
UNLINK username            # async delete — non-blocking for large keys
```

```javascript
// In Node.js with ioredis
const redis = require("./lib/redis");

await redis.set("username", "alice");
const val = await redis.get("username"); // 'alice'

// SET with expiry
await redis.set("otp:alice@example.com", "482910", "EX", 600); // 10 minutes
const otp = await redis.get("otp:alice@example.com");

// Atomic increment
await redis.set("views:post:1", 0);
const views = await redis.incr("views:post:1"); // 1

// Check TTL
const ttl = await redis.ttl("otp:alice@example.com"); // seconds remaining, -1 = no expiry, -2 = doesn't exist

// Delete
await redis.del("username");
```

### Hash.

A hash maps a key to a collection of field-value pairs, like a JavaScript object stored under a single Redis key.

More memory-efficient than storing each field as a separate string key.

```bash
# Set multiple fields at once
HSET user:1 name "Alice" email "alice@example.com" role "user" loginCount 0

# Get one field
HGET user:1 name         # → "Alice"

# Get multiple fields
HMGET user:1 name email  # → ["Alice", "alice@example.com"]

# Get all fields and values
HGETALL user:1
# → { name: "Alice", email: "alice@example.com", role: "user", loginCount: "0" }

# Increment a hash field numerically
HINCRBY user:1 loginCount 1   # → 1
HINCRBY user:1 loginCount 1   # → 2

# Check field existence
HEXISTS user:1 email      # → 1
HEXISTS user:1 phone      # → 0

# Delete a field
HDEL user:1 role

# Get all field names / all values
HKEYS user:1    # → ["name", "email", "loginCount"]
HVALS user:1    # → ["Alice", "alice@example.com", "2"]
HLEN user:1     # → 3 (number of fields)
```

```javascript
// ioredis — hset accepts an object
await redis.hset("user:1", {
  name: "Alice",
  email: "alice@example.com",
  role: "user",
  loginCount: 0,
});

const name = await redis.hget("user:1", "name");
const user = await redis.hgetall("user:1");
// { name: 'Alice', email: 'alice@example.com', role: 'user', loginCount: '0' }
// Note: all values come back as strings — parse numbers yourself

const count = await redis.hincrby("user:1", "loginCount", 1);
```

### List.

An ordered sequence of strings, implemented as a doubly-linked list.

Supports efficient push/pop from both ends. Used for queues, activity feeds and recent items.

```bash
# LPUSH = push to the LEFT (head). RPUSH = push to the RIGHT (tail).
RPUSH notifications:user:1 "msg1" "msg2" "msg3"
LPUSH notifications:user:1 "urgent"

# Get a range (0 = first, -1 = last)
LRANGE notifications:user:1 0 -1    # get all items
LRANGE notifications:user:1 0 4     # get first 5 items

# Pop from either end (LPOP = left, RPOP = right)
LPOP notifications:user:1           # removes and returns "urgent"
RPOP notifications:user:1           # removes and returns "msg3"

# Blocking pop — waits until an item is available (useful for job queues)
BLPOP queue:jobs 0                  # block forever until item arrives
BLPOP queue:jobs 10                 # block for up to 10 seconds

# Length
LLEN notifications:user:1

# Trim to a fixed size (keep only the most recent 100 items)
LTRIM notifications:user:1 0 99
```

```javascript
// Queue pattern: producer pushes, consumer pops
// Producer
await redis.rpush(
  "queue:emails",
  JSON.stringify({ to: "alice@example.com", subject: "Welcome" }),
);

// Consumer
const [, job] = await redis.blpop("queue:emails", 0); // blocks until item available
const parsed = JSON.parse(job);

// Recent activity feed (keep latest 20)
await redis.lpush(`feed:user:${userId}`, JSON.stringify(activity));
await redis.ltrim(`feed:user:${userId}`, 0, 19); // keep only 20
const feed = await redis.lrange(`feed:user:${userId}`, 0, -1);
```

### Set.

An unordered collection of unique strings.

Redis enforces uniqueness automatically by adding a duplicate is a no-op.

```bash
# Add members
SADD tags:post:1 "nodejs" "redis" "backend"
SADD tags:post:1 "nodejs"    # → 0 (already exists, not added)

# Check membership
SISMEMBER tags:post:1 "redis"    # → 1
SISMEMBER tags:post:1 "python"   # → 0

# Get all members
SMEMBERS tags:post:1    # → ["nodejs", "redis", "backend"]

# Count
SCARD tags:post:1       # → 3

# Remove
SREM tags:post:1 "backend"

# Set operations — very useful for social features
SADD followers:alice "bob" "carol" "dave"
SADD followers:bob   "alice" "carol" "eve"

SINTER followers:alice followers:bob    # mutual followers: ["carol"]
SUNION followers:alice followers:bob    # all followers: ["bob","carol","dave","alice","eve"]
SDIFF  followers:alice followers:bob    # alice's followers that bob doesn't have: ["dave"]
```

```javascript
// Track unique visitors per day
const today = new Date().toISOString().split("T")[0]; // '2024-01-15'
await redis.sadd(`visitors:${today}`, userId);
const uniqueCount = await redis.scard(`visitors:${today}`);

// Who follows both alice and bob?
const mutual = await redis.sinter("followers:alice", "followers:bob");

// Is this user online?
await redis.sadd("online:users", userId);
const isOnline = await redis.sismember("online:users", userId); // 1 or 0
```

### Sorted Set.

Like a Set, but every member has an associated floating-point **score**.

Members are always sorted by score, ascending.

This makes sorted sets perfect for leaderboards, priority queues and any ranked data.

```bash
# ZADD key score member
ZADD leaderboard 9850 "alice"
ZADD leaderboard 8720 "bob"
ZADD leaderboard 9200 "carol"
ZADD leaderboard 7500 "dave"

# Get members sorted by score (ascending) — rank 0 = lowest score
ZRANGE leaderboard 0 -1                 # all members, low to high
ZRANGE leaderboard 0 -1 WITHSCORES     # with their scores

# Get members sorted highest first (REV = reverse)
ZRANGE leaderboard 0 2 REV WITHSCORES  # top 3, high to low

# Get rank of a member (0-indexed from lowest)
ZRANK  leaderboard "alice"    # → 3 (highest = last rank ascending)
ZREVRANK leaderboard "alice"  # → 0 (highest = rank 0 descending)

# Get score of a member
ZSCORE leaderboard "alice"    # → "9850"

# Add to a score
ZINCRBY leaderboard 150 "alice"   # alice now has 10000

# Remove members
ZREM leaderboard "dave"

# Count members in a score range
ZCOUNT leaderboard 8000 10000    # members with score between 8000 and 10000

# Remove members outside a rank range (keep top 100)
ZREMRANGEBYRANK leaderboard 0 -101    # removes all but the top 100
```

```javascript
// Leaderboard
await redis.zadd("leaderboard:weekly", 9850, "alice");
await redis.zadd("leaderboard:weekly", 8720, "bob");
await redis.zincrby("leaderboard:weekly", 100, "alice"); // alice scores more

// Get top 10 with scores
const top10 = await redis.zrange(
  "leaderboard:weekly",
  0,
  9,
  "REV",
  "WITHSCORES",
);
// ['alice', '9950', 'carol', '9200', 'bob', '8720']
// Parse into objects:
const leaderboard = [];
for (let i = 0; i < top10.length; i += 2) {
  leaderboard.push({ name: top10[i], score: parseFloat(top10[i + 1]) });
}

// Rate limiting with sorted set — store timestamps of requests
const now = Date.now();
const windowMs = 60 * 1000; // 1 minute window
const key = `ratelimit:${ip}`;

await redis.zadd(key, now, now.toString()); // add current request
await redis.zremrangebyscore(key, 0, now - windowMs); // remove old requests
const count = await redis.zcard(key);
await redis.expire(key, 60);

if (count > 100) throw new Error("Rate limit exceeded");
```

---

## 4. Key Expiry and TTL.

One of Redis's most powerful features is the ability to automatically expire keys after a set duration.

This makes Redis ideal for sessions, caches, OTPs and any temporary data.

```bash
# Set expiry on an existing key
EXPIRE  key 3600       # expire in 3600 seconds (1 hour)
PEXPIRE key 60000      # expire in 60000 milliseconds (1 minute)
EXPIREAT key 1735689600   # expire at a specific Unix timestamp

# Set key AND expiry in one command
SET otp:alice "482910" EX 600      # 10 minutes
SET session:xyz "data" PX 900000   # 15 minutes in milliseconds

# Check remaining TTL
TTL key      # seconds remaining. -1 = no expiry. -2 = key does not exist.
PTTL key     # milliseconds remaining

# Remove expiry (make key permanent)
PERSIST key

# Refresh expiry (reset the countdown)
EXPIRE key 3600   # call again to reset back to 1 hour from now
```

```javascript
// OTP pattern
const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // SET with EX — if the key already exists (user requested again), it is overwritten
  await redis.set(`otp:${email}`, otp, "EX", 600); // 10 minutes
  return otp;
};

const verifyOTP = async (email, submittedOtp) => {
  const stored = await redis.get(`otp:${email}`);
  if (!stored) throw new Error("OTP expired or not found");
  if (stored !== submittedOtp) throw new Error("Invalid OTP");
  await redis.del(`otp:${email}`); // single use — delete after verification
  return true;
};

// Session with sliding expiry
// Sliding expiry resets the TTL every time the session is accessed
// so active users never get logged out
const getSession = async (sessionId) => {
  const data = await redis.get(`session:${sessionId}`);
  if (!data) return null;
  await redis.expire(`session:${sessionId}`, 1800); // reset to 30 min on every access
  return JSON.parse(data);
};
```

### Key Naming Conventions.

Redis keys are just strings. Conventions matter a lot because you can have millions of keys.

```
user:1                     single user by id
user:1:profile             nested namespace
session:abc123             session token
otp:alice@example.com      OTP for a user
cache:posts:page:1         cached page of posts
leaderboard:weekly         named leaderboard
ratelimit:192.168.1.1      rate limit by IP
lock:resource:payment-1    distributed lock

Rules:
  Use colons (:) as namespace separators — this is the universal Redis convention.
  Be specific enough that keys from different features don't collide.
  Keep key names reasonably short — each key name uses memory.
  Never use spaces in key names.
```

---

## 5. Caching Patterns.

Caching is the most common use of Redis.

**The idea is simple**: the first time you fetch expensive data (a DB query, an API call, a computation), store the result in Redis.

The next time someone asks for the same thing, return it from Redis without touching the database.

### Cache-Aside (Lazy Loading).

The most common pattern. The application manages the cache manually.

```
Request comes in
      │
      ▼
Check Redis cache ──── HIT ──── Return cached data (fast)
      │
     MISS
      │
      ▼
Query the database
      │
      ▼
Store result in Redis with TTL
      │
      ▼
Return data to client
```

```javascript
const redis = require("./lib/redis");
const pool = require("./lib/db");

// Cache key should uniquely identify the data
// Include all parameters that affect the result
const getCachedProducts = async ({ category, page, limit }) => {
  const cacheKey = `cache:products:${category || "all"}:page:${page}:limit:${limit}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return { ...JSON.parse(cached), source: "cache" };
  }

  // 2. Cache miss — query the database
  const result = await pool.query(
    `SELECT * FROM products
     WHERE ($1::TEXT IS NULL OR category = $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [category || null, limit, (page - 1) * limit],
  );

  const data = { products: result.rows, total: result.rowCount };

  // 3. Store in cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(data), "EX", 300);

  return { ...data, source: "database" };
};
```

### Cache Invalidation.

When underlying data changes, the cached version becomes stale.

You must invalidate (delete) the cache.

```javascript
// When a product is updated, delete all product cache keys
const updateProduct = async (id, updates) => {
  await pool.query("UPDATE products SET ... WHERE id = $1", [id]);

  // Delete specific cache entries that might contain this product
  // Simple approach: use a pattern to delete related keys
  const keys = await redis.keys("cache:products:*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// Better approach: use a shorter TTL and accept brief staleness
// instead of complex invalidation logic
// Cache for 60 seconds — if a product updates, it shows within 1 minute
await redis.set(cacheKey, JSON.stringify(data), "EX", 60);
```

### Write-Through Cache.

Write to Redis and the database simultaneously. The cache is always up to date.

```javascript
const createProduct = async (productData) => {
  // Write to DB
  const result = await pool.query(
    "INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING *",
    [productData.name, productData.price, productData.category],
  );
  const product = result.rows[0];

  // Immediately cache the new product
  await redis.set(
    `cache:product:${product.id}`,
    JSON.stringify(product),
    "EX",
    3600,
  );

  // Invalidate list caches (they no longer reflect the new product)
  const listKeys = await redis.keys("cache:products:*");
  if (listKeys.length > 0) await redis.del(...listKeys);

  return product;
};
```

### Cache Stampede Prevention.

When a popular cached item expires and many requests arrive simultaneously, they all miss the cache and hit the database at the same time.

This is a cache stampede (also called thundering herd).

```javascript
// Solution: use a Redis lock during cache regeneration
const getWithStampedeProtection = async (cacheKey, fetchFn, ttl = 300) => {
  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Try to acquire a lock (NX = only set if not exists)
  const lockKey = `lock:${cacheKey}`;
  const acquired = await redis.set(lockKey, "1", "NX", "EX", 10);

  if (acquired) {
    // 3. This instance fetches the data and populates the cache
    try {
      const data = await fetchFn();
      await redis.set(cacheKey, JSON.stringify(data), "EX", ttl);
      return data;
    } finally {
      await redis.del(lockKey);
    }
  } else {
    // 4. Another instance is fetching — wait briefly and retry from cache
    await new Promise((resolve) => setTimeout(resolve, 100));
    const retried = await redis.get(cacheKey);
    return retried ? JSON.parse(retried) : fetchFn(); // last resort: direct DB
  }
};
```

---

## 6. Rate Limiting with Redis.

Rate limiting protects your API from abuse like brute force attacks, credential stuffing, web scraping and denial-of-service.

Redis is ideal for rate limiting because its atomic increment operations are thread-safe across multiple server instances.

### Fixed Window Rate Limiter.

```javascript
// middleware/rateLimit.js
const redis = require("../lib/redis");

// Creates a rate limiting middleware with configurable window and max requests
const createRateLimiter = ({
  windowSeconds,
  maxRequests,
  keyPrefix = "ratelimit",
}) => {
  return async (req, res, next) => {
    // Use IP as the identifier — in production, also consider user ID
    const identifier = req.ip;
    const key = `${keyPrefix}:${identifier}`;

    // INCR is atomic — safe across multiple server instances
    const count = await redis.incr(key);

    if (count === 1) {
      // First request in this window — set expiry
      // (If we set expiry unconditionally, we'd reset it on every request)
      await redis.expire(key, windowSeconds);
    }

    // Set headers so clients know their limit status
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - count));
    res.setHeader(
      "X-RateLimit-Reset",
      Date.now() + (await redis.ttl(key)) * 1000,
    );

    if (count > maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please slow down.",
        retryAfter: await redis.ttl(key),
      });
    }

    next();
  };
};

module.exports = { createRateLimiter };
```

```javascript
// Usage in Express
const { createRateLimiter } = require("./middleware/rateLimit");

// Strict limit on auth routes
const authLimiter = createRateLimiter({
  windowSeconds: 15 * 60, // 15 minutes
  maxRequests: 10,
  keyPrefix: "ratelimit:auth",
});

// General API limit
const apiLimiter = createRateLimiter({
  windowSeconds: 60, // 1 minute
  maxRequests: 100,
  keyPrefix: "ratelimit:api",
});

app.post("/api/auth/login", authLimiter, loginHandler);
app.post("/api/auth/register", authLimiter, registerHandler);
app.use("/api", apiLimiter);
```

### Sliding Window Rate Limiter (More Accurate).

Fixed window has an edge case: a user can make `maxRequests` at the end of window 1 and `maxRequests` at the start of window 2, effectively 2× the limit in a short period.

Sliding window prevents this.

```javascript
const slidingWindowLimiter = async (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxReqs = 100;
  const key = `ratelimit:sliding:${ip}`;

  // Remove all timestamps older than the window
  await redis.zremrangebyscore(key, 0, now - windowMs);

  // Count remaining requests in window
  const count = await redis.zcard(key);

  if (count >= maxReqs) {
    return res.status(429).json({ message: "Rate limit exceeded" });
  }

  // Record this request with the current timestamp as both score and member
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, 60);

  next();
};
```

---

## 7. Session Management.

Redis is the standard storage backend for user sessions in Node.js applications.

Sessions need to be fast (every authenticated request reads the session), shared across multiple server instances (a load balancer may route requests to different servers) and automatically expirable.

### Storing JWT Refresh Tokens in Redis.

```javascript
// auth/tokens.js
const redis = require("../lib/redis");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_TTL = 15 * 60; // 15 minutes
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });

  // Refresh token is a random string — not a JWT
  // Stored in Redis with userId as the value
  const refreshToken = crypto.randomBytes(40).toString("hex");
  await redis.set(
    `refresh:${refreshToken}`,
    userId.toString(),
    "EX",
    REFRESH_TTL,
  );

  return { accessToken, refreshToken };
};

const rotateRefreshToken = async (oldRefreshToken) => {
  // Verify the old token exists in Redis
  const userId = await redis.get(`refresh:${oldRefreshToken}`);
  if (!userId) throw new Error("Invalid or expired refresh token");

  // Delete old token — it can never be used again (rotation)
  await redis.del(`refresh:${oldRefreshToken}`);

  // Issue new token pair
  return generateTokens(parseInt(userId));
};

const revokeRefreshToken = async (refreshToken) => {
  await redis.del(`refresh:${refreshToken}`);
};

// Revoke ALL sessions for a user (logout everywhere)
// Requires a different key structure to find all tokens for a user
// Pattern approach: scan for all keys (avoid in production with many keys)
const revokeAllSessions = async (userId) => {
  // Better approach: keep a set of refresh tokens per user
  const tokenSetKey = `refresh:tokens:user:${userId}`;
  const tokens = await redis.smembers(tokenSetKey);

  if (tokens.length > 0) {
    await redis.del(...tokens.map((t) => `refresh:${t}`));
    await redis.del(tokenSetKey);
  }
};

module.exports = { generateTokens, rotateRefreshToken, revokeRefreshToken };
```

### express-session with Redis Store.

For traditional session-based apps (not JWT), `connect-redis` stores session data in Redis instead of memory.

```bash
npm install express-session connect-redis
```

```javascript
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const redis = require("./lib/redis");

app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true, // not accessible via document.cookie
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
  }),
);

// Session data is stored as a hash in Redis: sess:sessionId
// Reading: req.session.userId
// Writing: req.session.userId = user.id
// Destroying: req.session.destroy()
```

---

## 8. Pub/Sub Messaging.

Redis Pub/Sub allows messages to be published to a channel and all subscribers to that channel receive the message instantly.

This is useful for real-time events, notifications and communication between microservices.

```
Publisher            Redis             Subscribers
    │                  │                  │  │  │
    │  PUBLISH         │                  │  │  │
    │  "chat:room1"    │                  │  │  │
    │  "Hello!"        │                  │  │  │
    │─────────────────▶│                  │  │  │
    │                  │  Message to all  │  │  │
    │                  │  subscribers ───▶│  │  │
    │                  │              ───────▶│  │
    │                  │              ──────────▶│
```

```javascript
// pub.js — publisher (can be any part of your app)
const Redis = require("ioredis");
const pub = new Redis(process.env.REDIS_URL);
// Note: you need SEPARATE Redis instances for pub and sub
// A subscribed connection can only receive messages, not send other commands

const publishMessage = async (channel, message) => {
  const payload = JSON.stringify({ data: message, timestamp: Date.now() });
  const subscribers = await pub.publish(channel, payload);
  console.log(`Message sent to ${subscribers} subscribers`);
};

// sub.js — subscriber
const Redis = require("ioredis");
const sub = new Redis(process.env.REDIS_URL);

sub.subscribe("chat:room1", "notifications", (err, count) => {
  if (err) throw err;
  console.log(`Subscribed to ${count} channels`);
});

sub.on("message", (channel, message) => {
  const parsed = JSON.parse(message);
  console.log(`[${channel}] ${parsed.data}`);

  if (channel === "notifications") {
    // broadcast to WebSocket clients, etc.
  }
});

// Pattern subscribe — subscribe to all channels matching a pattern
sub.psubscribe("chat:*", (err, count) => {});
sub.on("pmessage", (pattern, channel, message) => {
  console.log(`Pattern ${pattern}, Channel: ${channel}: ${message}`);
});
```

---

## 9. Pipelines and Transactions.

### Pipelining.

By default, each Redis command is sent over the network individually and you wait for a response before sending the next.

With pipelining, you batch multiple commands and send them in a single round trip.

```javascript
// ❌ Without pipeline — 3 separate round trips
await redis.set("a", 1);
await redis.set("b", 2);
await redis.set("c", 3);

// ✅ With pipeline — 1 round trip, ~3× faster
const pipeline = redis.pipeline();
pipeline.set("a", 1);
pipeline.set("b", 2);
pipeline.set("c", 3);
pipeline.get("a");
const results = await pipeline.exec();
// results: [[null, 'OK'], [null, 'OK'], [null, 'OK'], [null, '1']]
// Each result is [error, value]

// ioredis also supports a cleaner multi-exec syntax:
const [setResult, getResult] = await redis
  .pipeline()
  .set("key", "value")
  .get("key")
  .exec();
```

### Transactions with MULTI/EXEC.

A Redis transaction groups commands that execute atomically, no other client's commands can interleave.

Unlike SQL transactions, Redis transactions do not roll back on command failure.

```javascript
// MULTI/EXEC — all commands queue up and execute atomically
const results = await redis
  .multi()
  .incr("counter")
  .incr("counter")
  .get("counter")
  .exec();
// results: [[null, 1], [null, 2], [null, '2']]
// All three ran atomically

// WATCH — optimistic locking
// WATCH a key. If it changes before EXEC, the transaction is aborted.
// Used for read-modify-write operations.
const transferPoints = async (fromUser, toUser, points) => {
  const fromKey = `points:${fromUser}`;
  const toKey = `points:${toUser}`;

  // Retry up to 5 times if the transaction is aborted
  for (let attempt = 0; attempt < 5; attempt++) {
    await redis.watch(fromKey);

    const balance = parseInt((await redis.get(fromKey)) || "0");
    if (balance < points) {
      await redis.unwatch();
      throw new Error("Insufficient points");
    }

    const result = await redis
      .multi()
      .decrby(fromKey, points)
      .incrby(toKey, points)
      .exec();

    // exec returns null if WATCH detected a change (transaction aborted)
    if (result !== null) return result;
    // else retry
  }
  throw new Error("Transaction failed after 5 attempts");
};
```

---

## 10. Persistence and Production Configuration.

### Persistence Options.

By default, Redis stores everything in memory. If the process restarts, data is lost.

For a cache, this is fine. For sessions or queues, you need persistence.

```
RDB (Redis Database) — Snapshots
  Redis periodically saves a point-in-time snapshot of the dataset to disk.
  Fast restarts, small files, some data loss between snapshots.
  Good for: cache backup, non-critical data.

  Config: save 900 1     # save if at least 1 key changed in 900 seconds
          save 300 10    # save if at least 10 keys changed in 300 seconds
          save 60 10000  # save if at least 10000 keys changed in 60 seconds

AOF (Append-Only File) — Write Log
  Every write command is appended to a log file.
  On restart, Redis replays the log to rebuild the dataset.
  Near-zero data loss, larger files, slower restarts.
  Good for: sessions, queues, anything where data loss is unacceptable.

  Config: appendonly yes
          appendfsync everysec   # fsync to disk every second (balance of safety vs speed)
```

### Redis Configuration File.

```bash
# /etc/redis/redis.conf (or wherever Redis is installed)

# Network
bind 127.0.0.1       # only listen on localhost (never expose Redis publicly)
port 6379
protected-mode yes

# Authentication (always set in production)
requirepass yourStrongPasswordHere

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru
# allkeys-lru → when memory is full, evict the least-recently-used keys
# Other policies:
#   noeviction       → return errors when memory is full (default)
#   allkeys-random   → evict random keys
#   volatile-lru     → evict LRU keys that have an expiry set
#   volatile-ttl     → evict keys with the shortest TTL first

# Persistence
save 900 1
save 300 10
appendonly yes
appendfsync everysec
```

### Cloud Redis Options.

For production, use a managed Redis service instead of running it yourself.

```
Upstash         Free tier (10,000 commands/day). Serverless pricing. Great for side projects.
Redis Cloud     Managed Redis by the creators. Free 30MB tier.
AWS ElastiCache Fully managed, integrates with AWS VPC. Best for AWS deployments.
Railway         Simple, cheap managed Redis. Good for hobby projects.

Connection string format:
  redis://localhost:6379                    local, no auth
  redis://:password@localhost:6379          local, with password
  rediss://username:password@host:6380      TLS (note: rediss, not redis)
```

---

## 11. Common Patterns in Practice.

### Distributed Lock.

When multiple server instances might try to do the same thing simultaneously (like sending a welcome email exactly once), use a Redis lock.

```javascript
// lib/lock.js
const redis = require("./redis");

const acquireLock = async (resource, ttlSeconds = 30) => {
  const lockKey = `lock:${resource}`;
  const lockId = Math.random().toString(36).slice(2); // unique lock identifier

  // SET NX (Not eXists) — only sets if key doesn't exist
  // Returns 'OK' if acquired, null if already locked
  const result = await redis.set(lockKey, lockId, "NX", "EX", ttlSeconds);
  if (result !== "OK") return null;

  return {
    release: async () => {
      // Only release if this instance owns the lock
      // Use a Lua script for atomic check-and-delete
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, lockKey, lockId);
    },
  };
};

// Usage
const withLock = async (resource, fn, ttl = 30) => {
  const lock = await acquireLock(resource, ttl);
  if (!lock) throw new Error(`Resource ${resource} is locked`);
  try {
    return await fn();
  } finally {
    await lock.release();
  }
};
```

### Caching API Responses (Middleware).

```javascript
// middleware/cache.js
const redis = require("../lib/redis");

// Generates a cache key from the request
const getCacheKey = (req) => {
  const query = JSON.stringify(req.query);
  return `cache:${req.method}:${req.path}:${query}`;
};

const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const key = getCacheKey(req);
    const cached = await redis.get(key);

    if (cached) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cached));
    }

    // Intercept res.json to capture the response and cache it
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      res.setHeader("X-Cache", "MISS");
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
      }
      return originalJson(data);
    };

    next();
  };
};

module.exports = { cacheMiddleware };

// Usage
app.get("/api/products", cacheMiddleware(300), getProductsHandler);
```

---

## Assignment.

1. **OTP Verification and API Response Caching.**

   **What you practice:**
   - Redis strings with TTL for OTP storage
   - single-use OTP deletion after verification
   - cache-aside pattern for GET endpoints
   - manual cache invalidation on writes
   - `X-Cache` header to observe cache hits and misses
   - key naming conventions.

   **Requirements:**
   - Connect to Redis using `ioredis`.
   - Use a PostgreSQL (or in-memory array for simplicity) store for products.
   - Endpoints:
     - `POST /api/auth/send-otp` — body: `{ email }`. Generate a 6-digit OTP, store it in Redis as `otp:{email}` with a 10-minute TTL, return `{ message, otp }` (return OTP in response for testing — in production you'd email it).
     - `POST /api/auth/verify-otp` — body: `{ email, otp }`. Retrieve from Redis, compare, delete on success. Return `400` if expired or wrong.
     - `GET /api/products` — return all products. Cache the result in Redis for 60 seconds under key `cache:products`. Set `X-Cache: HIT` or `X-Cache: MISS` header.
     - `POST /api/products` — create a product. After saving, delete the `cache:products` key so the next GET rebuilds the cache.
     - `GET /api/products/:id` — return one product. Cache under `cache:product:{id}` for 60 seconds.
     - `PUT /api/products/:id` — update a product. Delete `cache:product:{id}` and `cache:products` after update.

   [Solution](./Assignment/code1/)

   **POSTMAN Test Cases.**

   ```
   # ── OTP Flow ──────────────────────────────────────────────────────────────────

   # 1. Send OTP
   POST http://localhost:3000/api/auth/send-otp
   Body: { "email": "alice@example.com" }
   → 200  { message: "OTP sent", otp: "482910" }
       (copy the otp value)

   # 2. Verify OTP — correct
   POST http://localhost:3000/api/auth/verify-otp
   Body: { "email": "alice@example.com", "otp": "482910" }
   → 200  { message: "OTP verified successfully" }

   # 3. Verify OTP again — already deleted (single use)
   POST http://localhost:3000/api/auth/verify-otp
   Body: { "email": "alice@example.com", "otp": "482910" }
   → 400  { message: "OTP expired or not found" }

   # 4. Wrong OTP
   POST http://localhost:3000/api/auth/send-otp
   Body: { "email": "bob@example.com" }
   POST http://localhost:3000/api/auth/verify-otp
   Body: { "email": "bob@example.com", "otp": "000000" }
   → 400  { message: "Invalid OTP" }

   # 5. OTP expiry — send OTP, wait 10 minutes (or reduce TTL to 5s for testing), try to verify
   → 400  { message: "OTP expired or not found" }

   # ── Product Caching ───────────────────────────────────────────────────────────

   # 6. First GET — cache miss
   GET http://localhost:3000/api/products
   → 200  [ { id: 1, name: "Laptop", ... }, ... ]
           Headers: X-Cache: MISS

   # 7. Second GET — cache hit
   GET http://localhost:3000/api/products
   → 200  same data
           Headers: X-Cache: HIT   (served from Redis, no store access)

   # 8. Get one product — cache miss first time
   GET http://localhost:3000/api/products/1
   → 200  { id: 1, name: "Laptop", ... }
           Headers: X-Cache: MISS

   # 9. Get same product — cache hit
   GET http://localhost:3000/api/products/1
   → 200  same data
           Headers: X-Cache: HIT

   # 10. Create a product — invalidates list cache
   POST http://localhost:3000/api/products
   Body: { "name": "Keyboard", "price": 79.99, "category": "electronics" }
   → 201  { id: 4, name: "Keyboard", ... }

   # 11. GET all again — cache miss (was invalidated by POST)
   GET http://localhost:3000/api/products
   → 200  now includes Keyboard
           Headers: X-Cache: MISS

   # 12. Update a product — invalidates both caches
   PUT http://localhost:3000/api/products/1
   Body: { "price": 899.99 }
   → 200  { id: 1, name: "Laptop", price: 899.99, ... }

   # 13. GET product/1 — cache miss (was invalidated by PUT)
   GET http://localhost:3000/api/products/1
   → 200  { price: 899.99 }
           Headers: X-Cache: MISS

   # 14. GET product not found
   GET http://localhost:3000/api/products/9999
   → 404  { message: "Product not found" }
   ```

2. **Rate Limiting and Session Management with Refresh Token Rotation.**

   **What you practice:**
   - Redis-based fixed window rate limiting with atomic INCR
   - rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
   - JWT access tokens + Redis-stored refresh tokens
   - token rotation (delete old, issue new)
   - logout (delete from Redis)
   - logout-everywhere (delete all sessions for a user)
   - bcrypt for passwords.

   **Requirements:**
   - Users stored in a simple in-memory array (no DB needed).
   - Endpoints:
     - `POST /api/auth/register` — hash password, store user.
     - `POST /api/auth/login` — verify password, issue short-lived JWT access token (15 min) and random refresh token stored in Redis as `refresh:{token}` with value `userId`, TTL 7 days. Return both.
     - `POST /api/auth/refresh` — read refresh token from body, verify it exists in Redis, rotate (delete old, issue new pair), return new access + refresh tokens.
     - `POST /api/auth/logout` — delete the refresh token from Redis.
     - `POST /api/auth/logout-all` — delete ALL refresh tokens for the authenticated user (use a Redis Set `refresh:tokens:user:{userId}` to track them).
     - `GET /api/me` — protected route, verify JWT, return user info.
   - Rate limit: all `/api/auth` routes to 10 requests per IP per 15 minutes. Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. Return `429` when exceeded.

   [Solution](./Assignment/code2/)

   **POSTMAN Test Cases.**

   ```
   # 1. Register
   POST http://localhost:3000/api/auth/register
   Body: { "email": "alice@example.com", "password": "secret123" }
   → 201  { message: "Registered", email: "alice@example.com" }

   # 2. Login — get token pair
   POST http://localhost:3000/api/auth/login
   Body: { "email": "alice@example.com", "password": "secret123" }
   → 200  { accessToken: "eyJ...", refreshToken: "a3f8..." }
         (copy both values)

   # 3. Access protected route
   GET http://localhost:3000/api/auth/me
   Headers: Authorization: Bearer <accessToken>
   → 200  { id: 1, email: "alice@example.com" }

   # 4. Access with no token
   GET http://localhost:3000/api/auth/me
   → 401  { message: "No token provided" }

   # 5. Access with invalid token
   GET http://localhost:3000/api/auth/me
   Headers: Authorization: Bearer invalidtoken
   → 401  { message: "Invalid or expired token" }

   # 6. Refresh tokens — rotate
   POST http://localhost:3000/api/auth/refresh
   Body: { "refreshToken": "<refreshToken from step 2>" }
   → 200  { accessToken: "eyJ...(new)", refreshToken: "b7c2...(new)" }
         (old refresh token is now deleted from Redis)

   # 7. Use old refresh token again — rejected (rotated)
   POST http://localhost:3000/api/auth/refresh
   Body: { "refreshToken": "<old refreshToken from step 2>" }
   → 401  { message: "Invalid or expired refresh token" }

   # 8. Login again (second session)
   POST http://localhost:3000/api/auth/login
   Body: { "email": "alice@example.com", "password": "secret123" }
   → 200  { accessToken: "...", refreshToken: "..." }

   # 9. Logout (single session)
   POST http://localhost:3000/api/auth/logout
   Body: { "refreshToken": "<refreshToken from step 8>" }
   → 200  { message: "Logged out" }

   # 10. Logout all sessions
   POST http://localhost:3000/api/auth/logout-all
   Headers: Authorization: Bearer <a valid accessToken>
   → 200  { message: "Logged out from all 1 sessions" }

   # 11. Rate limit headers (check on any request)
   POST http://localhost:3000/api/auth/login
   → Headers:
       X-RateLimit-Limit: 10
       X-RateLimit-Remaining: 7
       X-RateLimit-Reset: 1735689600000

   # 12. Trigger rate limit (make 11 requests within 15 minutes)
   POST http://localhost:3000/api/auth/login (11th time)
   → 429  { message: "Too many requests. Please slow down.", retryAfter: 892 }
           X-RateLimit-Remaining: 0
   ```

3. **Leaderboard, Pub/Sub Notification System and Distributed Job Queue.**

   **What you practice:**
   - Redis sorted sets for real-time leaderboards with rank queries
   - Redis Pub/Sub with separate publisher and subscriber connections
   - Redis List as a FIFO job queue with `BLPOP` consumer
   - pipeline for batching multiple Redis writes
   - `MULTI/EXEC` transaction for atomic score update + leaderboard insert
   - combining multiple Redis data structures in one application.

   **Requirements:**

   **Part 1 — Leaderboard (Sorted Set):**
   - `POST /api/leaderboard/score` — body: `{ username, score }`. Use `ZADD leaderboard <score> <username>` to add/update. Use `ZINCRBY` if the request body includes `increment: true` instead.
   - `GET /api/leaderboard/top` — return top 10 players with rank and score. Use `ZRANGE leaderboard 0 9 REV WITHSCORES`.
   - `GET /api/leaderboard/rank/:username` — return the rank (1-indexed), score, and surrounding players (one above, one below) for a given username.
   - `DELETE /api/leaderboard/:username` — remove a player from the leaderboard.

   **Part 2 — Pub/Sub Notification System:**
   - Create a `lib/subscriber.js` that opens a dedicated Redis connection, subscribes to the `notifications` channel, and logs incoming messages to the console (simulating a notification handler).
   - `POST /api/notify` — body: `{ channel, message }`. Publish the message to the given Redis channel. Return `{ subscribers }` (the count of active subscribers that received it).

   **Part 3 — Job Queue:**
   - `POST /api/jobs` — body: `{ type, payload }`. Push a JSON job to the right end of `queue:jobs` list using `RPUSH`. Return the job with a generated `jobId` (use `Date.now()`).
   - `GET /api/jobs/queue-length` — return `{ length }` using `LLEN`.
   - Start a background worker in `server.js` that runs `BLPOP queue:jobs 0` in a loop, processes the job (just `console.log` for simulation), and stores the result in Redis as `job:result:{jobId}` with a 1-hour TTL.
   - `GET /api/jobs/:jobId/result` — return the job result from Redis, or `{ status: 'pending' }` if not yet processed.

   [Solution](./Assignment/code3/)

   **POSTMAN Test Cases.**

   ```
   # ── Part 1: Leaderboard ───────────────────────────────────────────────────────

   # 1. Add players
   POST http://localhost:3000/api/leaderboard/score
   Body: { "username": "alice", "score": 9850 }
   → 200  { username: "alice", score: 9850 }

   POST http://localhost:3000/api/leaderboard/score
   Body: { "username": "bob", "score": 8720 }
   → 200  { username: "bob", score: 8720 }

   POST http://localhost:3000/api/leaderboard/score
   Body: { "username": "carol", "score": 9200 }
   → 200  { username: "carol", score: 9200 }

   POST http://localhost:3000/api/leaderboard/score
   Body: { "username": "dave", "score": 7500 }
   → 200  { username: "dave", score: 7500 }

   # 2. Get top players
   GET http://localhost:3000/api/leaderboard/top
   → 200  [
       { rank: 1, username: "alice", score: 9850 },
       { rank: 2, username: "carol", score: 9200 },
       { rank: 3, username: "bob",   score: 8720 },
       { rank: 4, username: "dave",  score: 7500 }
     ]

   # 3. Increment alice's score
   POST http://localhost:3000/api/leaderboard/score
   Body: { "username": "alice", "score": 150, "increment": true }
   → 200  { username: "alice", score: 10000 }

   # 4. Get rank of a player
   GET http://localhost:3000/api/leaderboard/rank/carol
   → 200  {
       username: "carol", rank: 2, score: 9200,
       above: { username: "alice", score: 10000 },
       below: { username: "bob",   score: 8720  }
     }

   # 5. Player not found
   GET http://localhost:3000/api/leaderboard/rank/nobody
   → 404  { message: "nobody not found on leaderboard" }

   # 6. Remove a player
   DELETE http://localhost:3000/api/leaderboard/dave
   → 200  { message: "dave removed from leaderboard" }

   GET http://localhost:3000/api/leaderboard/top
   → 200  [ alice (10000), carol (9200), bob (8720) ]   (dave is gone)

   # ── Part 2: Pub/Sub ────────────────────────────────────────────────────────────

   # 7. Publish to the notifications channel
   POST http://localhost:3000/api/notify
   Body: { "channel": "notifications", "message": "Server maintenance in 10 minutes" }
   → 200  { channel: "notifications", subscribers: 1, message: "..." }
         (Check server console — subscriber.js should log the received message)

   # 8. Publish to a channel with no subscribers
   POST http://localhost:3000/api/notify
   Body: { "channel": "other-channel", "message": "Hello" }
   → 200  { channel: "other-channel", subscribers: 0 }

   # ── Part 3: Job Queue ──────────────────────────────────────────────────────────

   # 9. Enqueue a job
   POST http://localhost:3000/api/jobs
   Body: { "type": "send-email", "payload": { "to": "alice@example.com", "subject": "Welcome" } }
   → 201  { jobId: 1735689600000, type: "send-email", status: "queued", enqueuedAt: "..." }
         (copy the jobId)

   # 10. Check queue length (before worker processes it)
   GET http://localhost:3000/api/jobs/queue-length
   → 200  { length: 1 }
         (if worker already processed it, length may be 0)

   # 11. Check job result — pending (if checked quickly)
   GET http://localhost:3000/api/jobs/1735689600000/result
   → 200  { jobId: "1735689600000", status: "pending" }

   # 12. Wait ~1 second, check again — completed
   GET http://localhost:3000/api/jobs/1735689600000/result
   → 200  {
       jobId: "1735689600000", type: "send-email",
       status: "completed", processedAt: "...",
       result: "Processed send-email successfully"
     }
     (Also check server console — worker should have logged the job processing)

   # 13. Enqueue multiple jobs
   POST http://localhost:3000/api/jobs
   Body: { "type": "resize-image", "payload": { "url": "https://example.com/img.jpg" } }

   POST http://localhost:3000/api/jobs
   Body: { "type": "generate-report", "payload": { "month": 6, "year": 2026 } }

   GET http://localhost:3000/api/jobs/queue-length
   → 200  { length: 2 }   (before worker processes them)
         (watch console for worker processing both)

   # 14. Result for unknown jobId
   GET http://localhost:3000/api/jobs/9999999/result
   → 200  { jobId: "9999999", status: "pending" }
   ```
