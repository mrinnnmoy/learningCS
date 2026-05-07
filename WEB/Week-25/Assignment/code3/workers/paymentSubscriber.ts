import Redis from "ioredis";
import { Queue } from "bullmq";
import { EventBus } from "../src/lib/eventBus";
import type { PaymentJobData } from "../src/lib/queues/paymentQueue";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const opts = { maxRetriesPerRequest: null as null, enableReadyCheck: false };

const pub = new Redis(REDIS_URL, opts);
const sub = new Redis(REDIS_URL, opts);
const queueConn = new Redis(REDIS_URL, opts);
const bus = new EventBus(pub, sub);
const payQueue = new Queue<PaymentJobData>("payment", {
  connection: queueConn,
});

console.log("[Payment Subscriber] Listening for order.placed events...");

bus.subscribe("order.placed", async (payload) => {
  console.log(
    `[Payment Sub] Order placed: #${payload.orderId} ($${payload.total})`,
  );

  // Enqueue a BullMQ job for durable processing
  const job = await payQueue.add("charge-card", {
    orderId: payload.orderId,
    userId: payload.userId,
    total: payload.total,
  });

  console.log(`[Payment Sub] Enqueued payment job ${job.id}`);

  // Simulate processing (in production, the BullMQ worker does this)
  await new Promise((res) => setTimeout(res, 1500));

  // Publish the result event
  await bus.publish("payment.processed", {
    orderId: payload.orderId,
    userId: payload.userId,
    total: payload.total,
    success: true,
    at: new Date().toISOString(),
  });
});

process.on("SIGTERM", async () => {
  await bus.close();
  await queueConn.quit();
});
process.on("SIGINT", async () => {
  await bus.close();
  await queueConn.quit();
});
