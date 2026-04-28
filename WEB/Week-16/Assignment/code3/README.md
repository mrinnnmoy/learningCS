# How to Build.

```
Step 1 — Initialise
  mkdir code3 && cd code3
  npm init -y
  npm install express ioredis dotenv
  npm install --save-dev nodemon

Step 2 — Create .env
  REDIS_URL=redis://localhost:6379
  PORT=3000

Step 3 — Create lib/redis.js
  Export the main redis client (used for commands).

Step 4 — Create lib/subscriber.js
  IMPORTANT: A subscribed Redis connection cannot run normal commands.
  Create a SECOND Redis instance (const sub = new Redis(REDIS_URL)).
  sub.subscribe('notifications').
  sub.on('message', ...) to handle incoming messages.
  Export the sub instance and a getSubscriberCount() helper.

Step 5 — Create routes/leaderboard.js
  POST /score:
    If increment: use ZINCRBY, else ZADD.
    Use MULTI/EXEC to atomically update score and
    trim the leaderboard to top 1000 (ZREMRANGEBYRANK leaderboard 0 -1001).
  GET /top:
    ZRANGE leaderboard 0 9 REV WITHSCORES.
    Parse into [{ rank, username, score }, ...] (rank is 1-indexed).
  GET /rank/:username:
    ZREVRANK for 0-indexed rank.
    ZSCORE for score.
    ZRANGE with REV to get the player above and below.
  DELETE /:username:
    ZREM leaderboard username.

Step 6 — Create routes/notify.js
  POST /: redis.publish(channel, JSON.stringify({ message, timestamp })).
  Return { channel, subscribers }.

Step 7 — Create workers/jobWorker.js
  Export an async startWorker(redis) function.
  Run a while(true) loop calling redis.blpop('queue:jobs', 0).
  Parse the job JSON.
  Simulate processing with a 500ms delay.
  Store result in redis.set(`job:result:${job.jobId}`, JSON.stringify(result), 'EX', 3600).

Step 8 — Create routes/jobs.js
  POST /: RPUSH the job to queue:jobs, return job with jobId.
  GET /queue-length: LLEN queue:jobs, return { length }.
  GET /:jobId/result: GET job:result:{jobId}, return result or { status: 'pending' }.

Step 9 — Create server.js
  Import and start the subscriber (lib/subscriber.js).
  Import and start the worker (workers/jobWorker.js) with a separate Redis instance.
  Mount all routes.
```