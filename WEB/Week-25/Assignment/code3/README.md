# How to Build.

```
Step 1 — Initialise
  npx create-next-app@latest code3 --typescript --tailwind --eslint --app --src-dir
  cd code3
  npm install bullmq ioredis zod
  npm install --save-dev tsx concurrently

Step 2 — Create src/lib/redis.ts
  Export a 'redis' singleton (producer/general use).
  Also export a makeSubscriber() factory function that creates a FRESH Redis
  connection each time — subscribers must never reuse the same connection
  as publishers (subscribed clients cannot send commands).

Step 3 — Define domain event types in src/lib/eventBus.ts
  DomainEvents interface: maps channel names to their payload types.
    'order.placed':        { orderId, userId, total, items }
    'payment.processed':   { orderId, userId, total, success, at }
    'stock.updated':       { orderId, items, at }
    'notification.sent':   { userId, message, at }
  EventBus class:
    constructor(publisherConn: Redis, subscriberConn: Redis).
    publish<K extends keyof DomainEvents>(channel: K, payload: DomainEvents[K]): Promise<void>
      → this.pub.publish(channel, JSON.stringify(payload))
    subscribe<K extends keyof DomainEvents>(channel: K, handler: (payload) => void): void
      → this.sub.subscribe(channel), listen to 'message' event, parse and call handler.
    psubscribe(pattern: string, handler): void
      → this.sub.psubscribe(pattern), listen to 'pmessage'.
    close(): Promise<void> — quit both connections.

Step 4 — Create src/lib/queues/paymentQueue.ts
  BullMQ Queue for payment jobs (same as Assignment 2).

Step 5 — Create workers/paymentSubscriber.ts
  Create its own EventBus instance (own pub + sub connections).
  Subscribe to 'order.placed'.
  On each event:
    Log the event.
    Enqueue a payment BullMQ job (paymentQueue.add()).
    Simulate processing (1.5s delay).
    Publish 'payment.processed' with { orderId, success: true, at }.

Step 6 — Create workers/inventorySubscriber.ts
  Subscribe to 'order.placed'.
  On each event: simulate stock update (800ms), publish 'stock.updated'.

Step 7 — Create workers/notificationSubscriber.ts
  Subscribe to 'payment.processed'.
  On each event: simulate sending a push notification, publish 'notification.sent'.

Step 8 — Create src/app/api/events/order/route.ts
  POST handler. Parse and validate body with Zod.
  Create a publisher-only EventBus (no subscriber connection needed here).
  Publish 'order.placed' event.
  Return 201 immediately.

Step 9 — Create src/app/api/events/stream/route.ts
  SSE endpoint.
  Create a subscriber-only connection.
  Use psubscribe('*') to listen to ALL channels.
  On each message: encode as SSE and enqueue to the ReadableStream controller.
  Cleanup on client disconnect.

Step 10 — Create src/app/page.tsx
  Event log dashboard.
  Form: trigger an 'order.placed' event by POSTing to /api/events/order.
  Open EventSource to /api/events/stream on mount.
  Render each incoming event as a row in a live feed.
  Color-code by channel name.
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
