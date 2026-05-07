# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code2 --typescript --tailwind --eslint --app --src-dir
  cd code2
  npm install bullmq ioredis prisma @prisma/client zod
  npm install --save-dev tsx concurrently @types/node
  npx prisma init --datasource-provider sqlite

Step 2 — Write prisma/schema.prisma
  Order: id, userId, total (Float), status (default "pending"), createdAt.
  OrderItem: id, orderId (FK), productName, quantity (Int), price (Float).
  Run: npx prisma migrate dev --name init

Step 3 — Create src/lib/redis.ts and src/lib/prisma.ts (singletons).

Step 4 — Create all 4 queue files in src/lib/queues/
  paymentQueue.ts:      Queue<PaymentJobData>, attempts 3, exponential backoff.
  inventoryQueue.ts:    Queue<InventoryJobData>, attempts 2.
  emailReceiptQueue.ts: Queue<ReceiptJobData>, attempts 2.
  dlqQueue.ts:          Queue<DLQJobData>, attempts 1 (DLQ jobs don't retry).

Step 5 — Create src/app/api/orders/route.ts
  POST: validate body (userId, total, items[]).
  Create Order + OrderItems in Prisma.
  Use FlowProducer to add parent (payment) and children (inventory).
  Add email-receipt job separately (not in the flow — can run independently).
  Priority: total > 500 → priority 1, else priority 5.
  Return 201 with orderId.

Step 6 — Create src/app/api/orders/[id]/status/route.ts
  SSE endpoint (GET). Set Content-Type: text/event-stream.
  Create QueueEvents for payment and inventory queues.
  Listen to 'progress', 'completed', 'failed' events.
  Format as SSE: "data: {json}\n\n".
  Use ReadableStream to push events to the client.
  Cleanup listeners when the client disconnects.

Step 7 — Create workers/paymentWorker.ts
  Process payment jobs. Simulate charge (1.5s delay).
  On job failure after all retries: add to dlqQueue.
  Update order status in a real DB call via prisma.

Step 8 — Create workers/inventoryWorker.ts
  Process inventory jobs. Simulate stock decrement.

Step 9 — Create workers/emailReceiptWorker.ts
  Process email receipt jobs. Simulate PDF generation + email.

Step 10 — Create workers/dlqWorker.ts
  Process DLQ jobs. Log the failure, send an alert (simulated).

Step 11 — Create workers/scheduledWorker.ts
  One Queue and one Worker for the heartbeat.
  On startup: add a repeatable job with pattern '* * * * *' (every minute).
  Worker logs count of pending orders.

Step 12 — Create src/app/page.tsx
  Order form: userId input, total input, items textarea.
  On submit: POST /api/orders, get back orderId.
  Open an EventSource to /api/orders/:id/status.
  Show real-time progress updates as they stream in.
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
