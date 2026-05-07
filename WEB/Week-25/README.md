# List of things learned.

## 1. Why Queues and Pub/Sub Exist.

When a user clicks _"Place Order"_ on an e-commerce site, dozens of things need to happen:

- send a confirmation email,
- charge the card,
- notify the warehouse,
- update inventory,
- generate a PDF receipt and
- log the event for analytics.

Doing all of that synchronously in the same HTTP request would take several seconds and if any one step fails, the whole request fails.

Queues and Pub/Sub systems decouple these concerns so that the HTTP response returns instantly and the heavy work happens asynchronously in the background.

```
Without a queue (synchronous):
  User clicks "Place Order"
  → HTTP handler runs:
      charge card     (300ms)
      send email      (500ms)
      notify warehouse(200ms)
      update inventory(150ms)
      generate PDF    (800ms)
  → Response returns after ~2000ms
  → If email fails, the whole order fails

With a queue (asynchronous):
  User clicks "Place Order"
  → HTTP handler runs:
      save order to DB       (50ms)
      add jobs to queue      (10ms)
  → Response returns after ~60ms  ✅

  (Meanwhile, in the background:)
  Worker 1 → charge card
  Worker 2 → send email       (retries automatically if SMTP is down)
  Worker 3 → notify warehouse
  Worker 4 → update inventory
  Worker 5 → generate PDF
```

### Key Concepts.

1. **Producer** : A process that creates and adds jobs/messages to the queue.
   - Example: your API route handler.

2. **Queue** : A durable list of jobs waiting to be processed.
   - Backed by Redis, jobs survive server restarts.

3. **Consumer / Worker** : A process that reads jobs from the queue and executes them.
   - Runs separately from your web server.

4. **Dead Letter Queue** (DLQ) : A secondary queue where jobs land after exhausting all retries.
   - Lets you inspect and replay failed jobs.

5. **Pub/Sub** : A pattern where producers publish to a "channel" or "topic" and multiple subscribers independently receive every message.
   - Unlike queues (one consumer per message), pub/sub delivers the same message to ALL subscribers.

### Queue vs Pub/Sub (When to Use Which).

```
Queue (Point-to-Point)         Pub/Sub (Broadcast)
──────────────────────────     ──────────────────────────────
One consumer per message       Every subscriber gets every message
Work distribution              Event broadcasting
Background jobs                Real-time notifications
Order processing               Live dashboard updates
Email sending                  Cache invalidation across servers
File processing                Fanout to multiple services

Examples:
  Queue:  "Send a welcome email to this new user" → one worker picks it up
  Pub/Sub:"A new order was placed" → inventory service AND email service
          AND analytics service ALL receive and handle it independently
```

---

## 2. Redis as the Backbone.

Both **BullMQ** (queues) and **Redis Pub/Sub** use _Redis_ as their storage layer.

Redis is an in-memory data structure store that is exceptionally fast and supports persistent data structures that make it ideal for queue systems.

```bash
# Start Redis locally with Docker (easiest approach)
docker run -d -p 6379:6379 --name redis redis:alpine

# Verify it is running
redis-cli ping
# → PONG
```

### Connecting with ioredis.

```typescript
// src/lib/redis.ts
import Redis from "ioredis";

// Singleton pattern — reuse one connection across the app
const globalForRedis = globalThis as unknown as { redis?: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Test the connection
redis.on("connect", () => console.log("[Redis] Connected"));
redis.on("error", (err) => console.error("[Redis] Error:", err.message));
```

### Key Redis Data Structures Used by Queues.

```
Sorted Sets (ZSET)   Jobs sorted by score (timestamp / priority).
                     Used for delayed jobs and scheduled jobs.

Lists                Simple FIFO queues. LPUSH to add, BRPOP to consume.

Hashes               Store job data and metadata as key-value pairs.

Pub/Sub channels     PUBLISH / SUBSCRIBE for real-time fanout.
```

---

## 3. BullMQ (Production-Grade Job Queues).

<cite index="4-1">BullMQ is a Node.js library that implements a fast and robust queue system built on top of Redis that helps in resolving many modern age micro-services architectures. It fulfils exactly-once queue semantics, is easy to scale horizontally by adding more workers, and achieves high performance through efficient Lua scripts and pipelining.</cite>

```bash
npm install bullmq ioredis
```

### Queue, Worker and QueueEvents (The Three Classes).

```
Queue         The producer side. You call queue.add() to enqueue jobs.
              Can also be used to inspect jobs, pause/resume, and drain.

Worker        The consumer side. Runs a processor function for each job.
              Should run in a separate process from your web server.

QueueEvents   Listen to lifecycle events (completed, failed, progress)
              from anywhere — useful for dashboards and webhooks.
```

### Creating a Queue (Producer Side).

```typescript
// src/lib/queues/emailQueue.ts
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

// Define the shape of your job data
export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  userId: number;
}

// Create the queue — this is the PRODUCER side
// The queue only adds jobs; it doesn't process them
export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // retry up to 3 times on failure
    backoff: {
      type: "exponential",
      delay: 2000, // wait 2s, 4s, 8s between retries
    },
    removeOnComplete: { count: 100 }, // keep only last 100 completed jobs
    removeOnFail: { count: 500 }, // keep last 500 failed jobs for inspection
  },
});

// Add a single job
await emailQueue.add("send-welcome", {
  to: "alice@example.com",
  subject: "Welcome!",
  body: "Thanks for signing up.",
  userId: 42,
});

// Add a job with custom options (overrides defaults)
await emailQueue.add("send-receipt", jobData, {
  delay: 5000, // wait 5 seconds before processing
  priority: 1, // lower number = higher priority
  jobId: "receipt-42", // deduplicate — won't add if this ID already exists
});

// Add multiple jobs at once (atomic)
await emailQueue.addBulk([
  {
    name: "send-welcome",
    data: { to: "a@b.com", subject: "Hi", body: "", userId: 1 },
  },
  {
    name: "send-newsletter",
    data: { to: "c@d.com", subject: "Hi", body: "", userId: 2 },
  },
]);
```

### Creating a Worker (Consumer Side).

```typescript
// workers/emailWorker.ts — runs as a SEPARATE PROCESS from your web server
import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { EmailJobData } from "@/lib/queues/emailQueue";
import { sendEmail } from "@/lib/email";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const worker = new Worker<EmailJobData>(
  "email", // must match the queue name exactly

  // Processor function — called for each job
  async (job: Job<EmailJobData>) => {
    console.log(`[Worker] Processing job ${job.id}: ${job.name}`);

    // Report progress (0-100) — visible in dashboards
    await job.updateProgress(10);

    await sendEmail({
      to: job.data.to,
      subject: job.data.subject,
      body: job.data.body,
    });

    await job.updateProgress(100);
    console.log(`[Worker] Completed job ${job.id}`);

    // Whatever you return is stored as job.returnvalue
    return { sent: true, at: new Date().toISOString() };
  },

  {
    connection,
    concurrency: 5, // process up to 5 jobs simultaneously
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
);

// Lifecycle events on the worker
worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(
    `❌ Job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
    err.message,
  );
});

worker.on("progress", (job, progress) => {
  console.log(`⏳ Job ${job.id} progress: ${progress}%`);
});

console.log("[Worker] Email worker started. Waiting for jobs...");
```

### Starting the Worker.

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "worker:email": "tsx workers/emailWorker.ts",
    "worker:all": "concurrently \"npm run worker:email\" \"npm run worker:pdf\""
  }
}
```

```bash
# Terminal 1 — Next.js web server
npm run dev

# Terminal 2 — Email worker (separate process)
npm run worker:email

# The web server and worker share the same Redis queue.
# The web server ADDS jobs, the worker PROCESSES them.
```

### Job Lifecycle.

```
Job states and transitions:

  waiting     → Job is in the queue, no worker has picked it up yet
  active      → A worker is currently processing this job
  completed   → Worker's processor function returned successfully
  failed      → Worker threw an error and all retries are exhausted
  delayed     → Job was added with a delay; waiting for the delay to expire
  prioritized → Job is waiting but has a priority (processed before lower-priority jobs)
  paused      → Queue was paused; jobs won't be picked up until resumed

                  add()
                    ↓
               [waiting]
                    ↓  worker picks up
               [active]
              ↙         ↘
      [completed]     [failed]
                          ↓ (if retries remain)
                       [waiting] ← back to queue for retry
```

### Job Options in Depth.

```typescript
await queue.add("job-name", data, {
  // Retry configuration
  attempts: 5, // total attempts (1 initial + 4 retries)
  backoff: {
    type: "exponential", // 'exponential' | 'fixed'
    delay: 1000, // delay in ms (doubles each attempt for exponential)
  },

  // Scheduling
  delay: 60_000, // wait 60 seconds before first attempt
  repeat: {
    pattern: "0 9 * * 1-5", // cron: 9am Mon-Fri (BullMQ scheduled jobs)
  },

  // Deduplication
  jobId: `receipt-${orderId}`, // unique — won't add if ID already exists

  // Priority (lower number = higher priority, processed first)
  priority: 1,

  // Cleanup
  removeOnComplete: { count: 1000, age: 24 * 3600 }, // keep 1000 or 24h, whichever first
  removeOnFail: false, // never auto-remove failed jobs

  // Timeout — fail the job if it runs longer than this
  timeout: 30_000, // 30 seconds
});
```

### Repeatable (Scheduled) Jobs.

```typescript
// Add a recurring job — runs every day at midnight
await queue.add(
  "daily-report",
  {},
  {
    repeat: { pattern: "0 0 * * *" }, // cron syntax
  },
);

// List and remove repeatable jobs
const repeatableJobs = await queue.getRepeatableJobs();
await queue.removeRepeatableByKey(repeatableJobs[0].key);
```

### QueueEvents (Monitor from Anywhere).

```typescript
// src/lib/queues/emailQueueEvents.ts
import { QueueEvents } from "bullmq";
import { redis } from "@/lib/redis";

export const emailQueueEvents = new QueueEvents("email", { connection: redis });

emailQueueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`Job ${jobId} completed:`, returnvalue);
});

emailQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed:`, failedReason);
});

emailQueueEvents.on("progress", ({ jobId, data }) => {
  console.log(`Job ${jobId} progress: ${data}%`);
});

// Wait for a specific job to complete (useful in tests or webhooks)
const result = await emailQueueEvents.waitUntilFinished(jobId, 30_000);
```

### Inspecting Jobs Programmatically.

```typescript
import { Queue } from "bullmq";

const queue = new Queue("email", { connection: redis });

// Get counts by state
const counts = await queue.getJobCounts(
  "waiting",
  "active",
  "completed",
  "failed",
);
// { waiting: 12, active: 3, completed: 1054, failed: 2 }

// Get specific jobs
const waitingJobs = await queue.getWaiting(0, 49); // first 50
const failedJobs = await queue.getFailed(0, 49);

// Get a single job
const job = await queue.getJob(jobId);
if (job) {
  console.log(job.data); // original input data
  console.log(job.progress); // current progress (0-100)
  console.log(job.returnvalue); // result (if completed)
  console.log(job.failedReason); // error message (if failed)
  console.log(job.attemptsMade); // how many attempts so far
}

// Retry a failed job
await job?.retry();

// Remove a job
await job?.remove();

// Pause / resume the queue
await queue.pause();
await queue.resume();

// Drain the queue (remove all waiting jobs)
await queue.drain();

// Obliterate (remove queue and all jobs)
await queue.obliterate();
```

---

## 4. Redis Pub/Sub.

Redis Pub/Sub is a lightweight messaging pattern built into Redis.

Publishers send messages to named channels and all current subscribers receive those messages instantly. Unlike queues, messages are **not persisted** and if no subscriber is listening when a message is published, it is lost.

```typescript
// src/lib/pubsub.ts
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

// IMPORTANT: A Redis client that is subscribed to channels
// CANNOT run other commands. You MUST use separate connections.
export const publisher = new Redis(REDIS_URL);
export const subscriber = new Redis(REDIS_URL);

// ─── Publishing ─────────────────────────────────────────────────────────────

// Publish a message to a channel
await publisher.publish(
  "order-events",
  JSON.stringify({
    type: "order.placed",
    orderId: 123,
    userId: 42,
    total: 99.99,
  }),
);

// ─── Subscribing ────────────────────────────────────────────────────────────

// Subscribe to a channel
await subscriber.subscribe("order-events");

subscriber.on("message", (channel, rawMessage) => {
  const message = JSON.parse(rawMessage);
  console.log(`[${channel}]`, message);

  // Route based on message type
  if (message.type === "order.placed") {
    handleOrderPlaced(message);
  }
});

// Subscribe to multiple channels at once
await subscriber.subscribe(
  "order-events",
  "payment-events",
  "notification-events",
);

// Subscribe using a pattern (wildcard)
await subscriber.psubscribe("order-*"); // matches order-placed, order-cancelled, etc.

subscriber.on("pmessage", (pattern, channel, message) => {
  console.log(`Pattern ${pattern} matched channel ${channel}:`, message);
});

// Unsubscribe
await subscriber.unsubscribe("order-events");
```

### Pub/Sub vs BullMQ (Key Differences).

```
Redis Pub/Sub                       BullMQ (Queue)
──────────────────────────────      ──────────────────────────────────
Fire and forget — no persistence    Jobs persisted in Redis
If no subscriber: message lost      Jobs wait until a worker picks them up
All subscribers get each message    Only one worker processes each job
No retries                          Automatic retries with backoff
No job state tracking               Full job lifecycle (waiting/active/failed)
Real-time broadcast                 Reliable task processing
Best for: live events, cache        Best for: email, PDF generation,
  invalidation, notifications         payments, any critical background work
```

---

## 5. Multiple Queue Patterns.

### Fan-Out Pattern.

A single event triggers jobs in multiple independent queues. Each queue is processed by its own worker pool.

```typescript
// When an order is placed, fan out to multiple queues
async function handleOrderPlaced(order: Order): Promise<void> {
  // All four queues receive a job simultaneously — they run independently
  await Promise.all([
    emailQueue.add("send-confirmation", {
      to: order.user.email,
      orderId: order.id,
    }),
    pdfQueue.add("generate-receipt", {
      orderId: order.id,
    }),
    inventoryQueue.add("decrement-stock", {
      items: order.items,
    }),
    analyticsQueue.add("track-purchase", {
      userId: order.userId,
      total: order.total,
      items: order.items,
    }),
  ]);
}
```

### Priority Queue.

```typescript
// Lower priority number = processed first
await queue.add("critical-alert", data, { priority: 1 });
await queue.add("normal-task", data, { priority: 5 });
await queue.add("background-sync", data, { priority: 10 });
```

### Rate-Limited Queue.

```typescript
// Process at most 10 jobs per second
const rateLimitedQueue = new Queue("api-calls", {
  connection: redis,
  limiter: {
    max: 10, // max 10 jobs
    duration: 1000, // per 1000ms (1 second)
  },
});
```

### Flow Producer (Job Hierarchies).

```typescript
// A parent job that waits for all children to complete before running
import { FlowProducer } from "bullmq";

const flow = new FlowProducer({ connection: redis });

await flow.add({
  name: "process-order",
  queueName: "orders",
  data: { orderId: 123 },
  children: [
    {
      name: "charge-card",
      queueName: "payments",
      data: { orderId: 123, amount: 99.99 },
    },
    {
      name: "update-inventory",
      queueName: "inventory",
      data: { items: [{ productId: 1, qty: 2 }] },
    },
  ],
  // 'process-order' only runs after BOTH children complete successfully
});
```

### Dead Letter Queue Pattern.

```typescript
// Worker with DLQ handling
const worker = new Worker(
  "email",
  async (job) => {
    await sendEmail(job.data);
  },
  {
    connection: redis,
    attempts: 5, // after 5 failed attempts...
  },
);

// ...move to DLQ for manual inspection
worker.on("failed", async (job, err) => {
  if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
    // Job has exhausted retries — move to dead letter queue
    await deadLetterQueue.add("failed-email", {
      originalJobId: job.id,
      originalData: job.data,
      failedReason: err.message,
      failedAt: new Date().toISOString(),
    });
    console.error(`[DLQ] Job ${job.id} moved to dead letter queue`);
  }
});
```

---

## 6. Using Queues in Next.js API Routes.

Because Next.js API Route Handlers and Server Actions run in a serverless-like environment, the **workers must run as separate processes**.

The API route only adds jobs to the queue; workers process them elsewhere.

```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queues/emailQueue";
import { pdfQueue } from "@/lib/queues/pdfQueue";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // 1. Save order to DB
  const order = await prisma.order.create({ data: body });

  // 2. Add jobs to queues — fire and forget
  // The API response does NOT wait for these to complete
  await Promise.all([
    emailQueue.add("order-confirmation", {
      to: body.email,
      subject: `Order #${order.id} confirmed`,
      body: `Thank you for your order of $${order.total}`,
      userId: order.userId,
    }),
    pdfQueue.add("generate-receipt", {
      orderId: order.id,
    }),
  ]);

  // 3. Return immediately — background jobs are now processing independently
  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
```

### Queue Status API Endpoint.

```typescript
// src/app/api/queue-status/route.ts
import { NextResponse } from "next/server";
import { emailQueue } from "@/lib/queues/emailQueue";

export async function GET() {
  const counts = await emailQueue.getJobCounts(
    "waiting",
    "active",
    "completed",
    "failed",
    "delayed",
  );
  return NextResponse.json(counts);
}
```

---

## 7. BullBoard (Queue Dashboard).

BullBoard provides a web UI to inspect queues, view job details, retry failed jobs and monitor throughput.

```bash
npm install @bull-board/express @bull-board/api @bull-board/ui express
```

```typescript
// dashboard/server.ts — run as a separate process
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  {
    maxRetriesPerRequest: null,
  },
);

const emailQueue = new Queue("email", { connection });
const pdfQueue = new Queue("pdf", { connection });
const notifQueue = new Queue("notification", { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(emailQueue),
    new BullMQAdapter(pdfQueue),
    new BullMQAdapter(notifQueue),
  ],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

app.listen(3001, () => {
  console.log("BullBoard running at http://localhost:3001/admin/queues");
});
```

---

## 8. Patterns and Best Practices.

### Idempotent Job Processors.

```typescript
// Jobs may be processed more than once (exactly-once delivery is not guaranteed).
// Design processors to be idempotent — running them twice produces the same result.

// ❌ Not idempotent — running twice sends two emails
async function processor(job: Job) {
  await sendEmail(job.data);
}

// ✅ Idempotent — check before acting
async function processor(job: Job) {
  const alreadySent = await redis.get(
    `email-sent:${job.data.userId}:${job.data.type}`,
  );
  if (alreadySent) {
    console.log(`Email already sent for job ${job.id}, skipping`);
    return { skipped: true };
  }

  await sendEmail(job.data);
  await redis.setex(
    `email-sent:${job.data.userId}:${job.data.type}`,
    3600,
    "1",
  );
  return { sent: true };
}
```

### Graceful Shutdown.

```typescript
// workers/emailWorker.ts
const worker = new Worker("email", processor, { connection });

// On SIGTERM (Docker stop, Kubernetes pod termination):
// Stop accepting new jobs and wait for current jobs to finish
process.on("SIGTERM", async () => {
  console.log("[Worker] SIGTERM received — shutting down gracefully");
  await worker.close();
  await connection.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});
```

### Job Data Design.

```typescript
// ✅ Pass minimal, serialisable data
// Store complex objects in DB, pass only the ID
await emailQueue.add("order-confirmation", {
  orderId: 123, // ← pass the ID, fetch the full order in the worker
});

// ❌ Don't pass large objects or class instances
await emailQueue.add("order-confirmation", {
  order: { ...hugeOrderObjectWith50Fields }, // bloats Redis, hard to debug
  user: userInstance, // class methods won't survive serialisation
});
```

### Error Handling in Workers.

```typescript
const worker = new Worker(
  "email",
  async (job) => {
    try {
      await sendEmail(job.data);
    } catch (err) {
      if (err instanceof NetworkError) {
        // Transient error — throw to trigger a retry
        throw err;
      }
      if (err instanceof InvalidEmailError) {
        // Permanent error — log and return (don't retry)
        await logPermanentFailure(job, err);
        return { failed: true, reason: err.message };
      }
      throw err; // unknown error — retry
    }
  },
  { connection, attempts: 3 },
);
```

---

## Assignment.

1. **Background Email and Notification Queue.**

   **What you practice:**
   - Installing and connecting BullMQ with ioredis
   - Creating a typed `Queue<JobData>` on the producer side
   - Creating a `Worker<JobData>` in a separate process on the consumer side
   - Adding jobs from a Next.js API Route Handler
   - `job.updateProgress()` and the `progress` worker event
   - `QueueEvents` to listen to job lifecycle from the web server
   - Inspecting queue state via a status API endpoint
   - Retry with exponential backoff
   - Next.js 16 + React 19 + Tailwind CSS 4

   **Requirements:**
   - Two queues: `email` (send welcome emails) and `notification` (in-app notifications).
   - An API route `POST /api/register` that creates a user in an in-memory store and adds jobs to both queues simultaneously.
   - An email worker (`workers/emailWorker.ts`) that simulates sending an email (log + 1s delay). Reports progress at 0%, 50%, 100%. Retries up to 3 times with exponential backoff.
   - A notification worker (`workers/notificationWorker.ts`) that writes to an in-memory notifications store.
   - A status API route `GET /api/queue-status` that returns job counts for both queues.
   - A dashboard page at `/` that shows queue stats (fetched client-side every 5 seconds) and a registration form that triggers the jobs.

   [Solution](./Assignment/code1)

   **Manual Test Cases.**

   ```
   # Setup
   docker run -d -p 6379:6379 --name redis redis:alpine

   # Terminal 1 — Next.js
   npm run dev → open http://localhost:3000

   # Terminal 2 — Workers
   npm run workers

   # 1. Register a user
   Fill in Name: "Alice Johnson", Email: "alice@example.com". Click "Register & Enqueue Jobs".
   → API returns immediately (< 100ms).
   → "User registered. Background jobs enqueued." message appears.
   → In Terminal 2 (workers):
   [Email Worker] Starting job ...: welcome-email
   ⏳ [Email] Job ... — 0%
   ⏳ [Email] Job ... — 50%
   [Email] Sent welcome email to alice@example.com
   ⏳ [Email] Job ... — 100%
   ✅ [Email] Job ... completed: { sent: true, to: '...', sentAt: '...' }
   [Notif Worker] Processing job ... for user 1
   ✅ [Notif] Job ... completed: { stored: true, ... }

   # 2. Queue stats update
   → After 5 seconds (or immediately after clicking Register), the dashboard
   updates: email.completed = 1, notification.completed = 1.

   # 3. Register multiple users rapidly
   Register 5 users in quick succession.
   → API responds instantly each time.
   → Workers process the 5 email jobs and 5 notification jobs concurrently.
   → Queue stats show: email.completed = 5 (or increasing as workers finish).

   # 4. Queue status API directly
   GET http://localhost:3000/api/queue-status
   → JSON: { email: { waiting:0, active:0, completed:5, failed:0, delayed:0 }, notification: {...} }

   # 5. Worker resilience — stop email worker, register a user, restart
   Stop email worker (Ctrl+C in Terminal 2).
   Register "Bob Smith".
   → API still responds 201. Job sits in waiting state.
   GET /api/queue-status → email.waiting = 1 (job is queued, waiting for a worker).
   Restart email worker.
   → Worker immediately picks up the waiting job and processes it.
   → email.waiting = 0, email.completed increments.

   # 6. Verify API is non-blocking
   Register a user and time the response in DevTools → Network.
   → Response time should be < 100ms regardless of how long the email takes.
   This proves the API is non-blocking — it returns before the workers finish.
   ```

2. **Job Processing Pipeline with Fan-Out, Priority and Dead Letter Queue.**

   **What you practice:**
   - Fan-out: one API event triggers jobs in multiple independent queues
   - Priority queues: high-priority jobs skip ahead of lower-priority ones
   - Dead Letter Queue (DLQ): failed jobs are moved to a separate queue for inspection
   - `FlowProducer` for parent-child job dependencies (parent runs after children complete)
   - Scheduled (repeatable) jobs with cron syntax
   - `QueueEvents` to emit Server-Sent Events (SSE) from a Next.js route, giving the client real-time job progress without a WebSocket
   - Prisma 6 + SQLite for persisting order data

   **Requirements:**
   - Prisma models: `Order` (id, userId, total, status, createdAt) and `OrderItem` (id, orderId, productName, quantity, price).
   - Three queues: `payment`, `inventory`, `email-receipt`.
   - On `POST /api/orders`, create an order in the DB and fan out to all three queues using `FlowProducer` (payment is the parent — it runs after inventory succeeds).
   - A `GET /api/orders/:id/status` SSE endpoint that streams job progress updates to the browser using `QueueEvents`.
   - Priority: urgent orders (total > $500) are added with `priority: 1`, normal orders with `priority: 5`.
   - A DLQ worker that catches failed payment jobs and moves them to a `payment-dlq` queue with the failure reason.
   - A scheduled job that runs every minute and logs "Heartbeat: N pending orders".
   - Dashboard page showing live job progress via SSE.

   [Solution](./Assignment/code2)

   **Manual Test Cases.**

   ```
   # Setup
   docker run -d -p 6379:6379 --name redis redis:alpine
   npx prisma migrate dev --name init
   npm run workers   (Terminal 2)
   npm run dev       (Terminal 1) → http://localhost:3000

   # 1. Normal priority order
   Enter userId: 1, total: $99.99. Click "Place Order".
   → API returns instantly. Priority shows "Normal (5)".
   → SSE stream opens. Events appear in real time:
   [connected] Listening for job events...
   [inventory] completed — { updated: true, orderId: 1 }
   [payment] progress — 10%
   [payment] progress — 70%
   [payment] progress — 100%
   [payment] completed — { charged: true, orderId: 1 }

   → Worker terminals show inventory completing before payment starts
   (FlowProducer parent-child dependency enforced).

   # 2. High-priority order
   Enter total: $750. Click "Place Order".
   → Priority shows "⚡ High Priority (p1)".
   → If there are pending normal orders in the queue, this order's jobs
   are processed before them (priority 1 < priority 5).

   # 3. Simultaneous orders
   Quickly place 5 orders.
   → Workers process them concurrently (concurrency: 3 for payment, 5 for inventory).
   → All SSE streams show independent events without interfering.

   # 4. DLQ in action
   The payment worker has a 10% random failure rate.
   Place several orders until one fails.
   → Worker terminal: ❌ [Payment] Job failed — Payment gateway timeout
   → BullMQ retries with exponential backoff (3s, 6s, 12s).
   → After 3 failed attempts: 🚨 [Payment] Job moved to DLQ
   → DLQ worker: 🚨 [DLQ] Dead letter job received: ...

   # 5. Scheduled heartbeat
   Wait 1 minute after workers start.
   → [Heartbeat] 2026-xx-xx — N pending order(s) logs every 60 seconds.

   # 6. SSE disconnect
   Place an order and watch events. Close the browser tab mid-stream.
   → The SSE connection closes gracefully (ReadableStream cleanup fires).
   → Workers continue processing regardless.

   # 7. Prisma persistence
   Place an order. Check the DB:
   npx prisma studio → Orders table → order shows status "paid" after payment completes.
   ```

3. **Pub/Sub Event Bus with Redis, Multi-Service Fan-Out and a Real-Time Dashboard.**

   **What you practice:**
   - Redis Pub/Sub with `ioredis` — separate publisher and subscriber connections
   - A typed event bus (`EventBus` class) that wraps Redis Pub/Sub with TypeScript generics
   - Publishing domain events from Next.js API routes
   - Multiple independent subscribers (each in their own worker process) consuming the same channel
   - Combining BullMQ + Pub/Sub: Pub/Sub triggers job enqueueing in multiple workers
   - Server-Sent Events (SSE) forwarding Pub/Sub messages to the browser in real time
   - A live dashboard that shows all events flowing through the system

   **Requirements:**
   - A typed `EventBus` class (`src/lib/eventBus.ts`) with `publish<T>` and `subscribe<T>` methods.
   - Domain events: `OrderPlaced`, `PaymentProcessed`, `StockUpdated`, `NotificationSent`.
   - API route `POST /api/events/order` publishes an `OrderPlaced` event.
   - Three subscriber workers, each in their own process:
     - `workers/paymentSubscriber.ts` — listens for `OrderPlaced`, enqueues a payment job in BullMQ, publishes `PaymentProcessed` when done.
     - `workers/inventorySubscriber.ts` — listens for `OrderPlaced`, publishes `StockUpdated`.
     - `workers/notificationSubscriber.ts` — listens for `PaymentProcessed`, publishes `NotificationSent`.
   - A SSE endpoint `GET /api/events/stream` that subscribes to ALL channels and pushes every event to the browser.
   - A live dashboard that renders each event as it arrives via SSE.

   [Solution](./Assignment/code3)

   **Manual Test Cases.**

   ```
   # Setup
   docker run -d -p 6379:6379 --name redis redis:alpine
   npm run subscribers   (Terminal 2)
   npm run dev           (Terminal 1) → http://localhost:3000

   # 1. SSE connection
   Open http://localhost:3000.
   → Status badge shows "SSE Connected" in green.
   → Dashboard shows 4 channel cards all at 0.

   # 2. Publish an order event
   Fill in userId: 1, total: $150. Click "Publish order.placed →".
   → API returns instantly.
   → In the live feed, events appear within ~100ms:
   📦 order.placed     { orderId, userId:1, total:150, items:[...] }
   (after ~800ms)
   🏭 stock.updated    { orderId, items:[...], at:'...' }
   (after ~1500ms)
   💳 payment.processed { orderId, userId:1, total:150, success:true, at:'...' }
   (after ~2000ms)
   🔔 notification.sent { userId:1, message:'Your order #... of $150.00 has been confirmed!', at:'...' }

   → Event count cards update as events arrive.
   → Worker terminals show corresponding log lines.

   # 3. Multiple subscribers receiving the same event
   Publish another order.
   → BOTH paymentSubscriber and inventorySubscriber receive the 'order.placed' event
   independently — this is the pub/sub fanout: all subscribers on a channel get
   every message.
   → You can verify this by checking that both "stock.updated" AND "payment.processed"
   appear for the same orderId.

   # 4. Chain reaction
   → 'order.placed' triggers paymentSubscriber AND inventorySubscriber simultaneously.
   → paymentSubscriber publishes 'payment.processed'.
   → 'payment.processed' triggers notificationSubscriber.
   → notificationSubscriber publishes 'notification.sent'.
   → The full chain: order.placed → payment.processed → notification.sent appears in the feed.

   # 5. Multiple simultaneous orders
   Publish 3 orders rapidly.
   → All 3 fan out to all subscribers simultaneously.
   → 12 events appear (3 orders × 4 channels each).
   → No events are lost because all 3 subscribers are live and listening.

   # 6. Subscriber not running (shows pub/sub limitation)
   Stop inventorySubscriber (Ctrl+C for that process only).
   Publish an order.
   → 'order.placed' is received by paymentSubscriber (still running).
   → 'stock.updated' is NEVER published (inventorySubscriber is not running).
   → This is the key pub/sub limitation: if no subscriber is listening when
   a message is published, it is LOST — unlike BullMQ where jobs persist.
   Restart inventorySubscriber.
   → The missed 'order.placed' event is gone — it was not persisted.

   # 7. Clear and verify isolation
   Click "Clear" button.
   → Event feed clears locally (no server state changed — just the UI state).
   ```
