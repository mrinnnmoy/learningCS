# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code1 --typescript --tailwind --eslint --app --src-dir
  cd code1
  npm install bullmq ioredis
  npm install --save-dev tsx concurrently

Step 2 — Add scripts to package.json
  "dev":              "next dev"
  "worker:email":     "tsx workers/emailWorker.ts"
  "worker:notif":     "tsx workers/notificationWorker.ts"
  "workers":          "concurrently \"npm run worker:email\" \"npm run worker:notif\""
  Start Redis: docker run -d -p 6379:6379 redis:alpine

Step 3 — Create src/lib/redis.ts
  ioredis singleton. maxRetriesPerRequest: null (required by BullMQ).
  Export a single redis instance.

Step 4 — Create src/lib/store.ts
  In-memory users array and notifications array (no DB needed).
  Export helper functions: addUser, getUsers, addNotification, getNotifications.

Step 5 — Create src/lib/queues/emailQueue.ts
  Queue<EmailJobData> named 'email'. Default options: attempts 3, exponential backoff 2000ms.

Step 6 — Create src/lib/queues/notificationQueue.ts
  Queue<NotificationJobData> named 'notification'. Default: attempts 2.

Step 7 — Create workers/emailWorker.ts
  New Redis connection (separate from the producer connection).
  Worker<EmailJobData> on 'email' queue.
  Processor: log job start, updateProgress(0), simulate work (1s delay),
    updateProgress(50), log, updateProgress(100), return { sent: true }.
  worker.on('completed') and worker.on('failed') lifecycle handlers.

Step 8 — Create workers/notificationWorker.ts
  Worker<NotificationJobData> on 'notification' queue.
  Processor: call addNotification() from the store, return { stored: true }.

Step 9 — Create src/app/api/register/route.ts
  POST handler. Parse { name, email } from body.
  Validate — return 400 if missing.
  addUser() to in-memory store.
  addBulk() to add jobs to BOTH queues at once.
  Return 201 with the new user.

Step 10 — Create src/app/api/queue-status/route.ts
  GET handler. Call getJobCounts('waiting','active','completed','failed') on both queues.
  Return combined JSON.

Step 11 — Create src/app/page.tsx
  Client Component. Two sections:
    Registration form: name + email inputs, POST to /api/register on submit.
    Queue stats: fetch /api/queue-status every 5 seconds with setInterval in useEffect.
    Show waiting/active/completed/failed counts for both queues.
```

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
