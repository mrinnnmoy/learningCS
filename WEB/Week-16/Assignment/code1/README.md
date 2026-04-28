# How to Build.

```
Step 1 — Initialise the project
  mkdir code1 && cd code1
  npm init -y
  npm install express ioredis dotenv
  npm install --save-dev nodemon

Step 2 — Create .env
  REDIS_URL=redis://localhost:6379
  PORT=3000
  NODE_ENV=development

Step 3 — Create lib/redis.js
  Instantiate ioredis with retryStrategy. Export the client.
  Log 'Redis connected' on the connect event.

Step 4 — Create data/store.js
  Export a simple in-memory array of products and helper functions:
  getAllProducts(), getProductById(id), createProduct(data), updateProduct(id, data).
  Use an auto-incrementing id counter.

Step 5 — Create routes/auth.js
  POST /send-otp:
    Generate 6-digit OTP with Math.floor(100000 + Math.random() * 900000).
    redis.set(`otp:${email}`, otp, 'EX', 600).
    Return { message: 'OTP sent', otp }.
  POST /verify-otp:
    redis.get(`otp:${email}`).
    If null → 400 'OTP expired or not found'.
    If mismatch → 400 'Invalid OTP'.
    redis.del(`otp:${email}`) on success.
    Return { message: 'OTP verified' }.

Step 6 — Create routes/products.js
  GET / :
    Check redis.get('cache:products').
    If hit: set X-Cache: HIT, return parsed JSON.
    If miss: get from store, redis.set('cache:products', JSON.stringify(data), 'EX', 60).
    Set X-Cache: MISS, return data.
  POST / :
    Add to store.
    redis.del('cache:products').
    Return 201 with new product.
  GET /:id :
    Check redis.get(`cache:product:${id}`).
    Cache miss: get from store, cache for 60s.
  PUT /:id :
    Update in store.
    redis.del(`cache:products`, `cache:product:${id}`).
    Return updated product.

Step 7 — Create server.js
  Mount routes. Add error handler. Listen on PORT.
```