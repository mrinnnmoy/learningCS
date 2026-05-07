import Redis from "ioredis";
import { EventBus } from "../src/lib/eventBus";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const opts = { maxRetriesPerRequest: null as null, enableReadyCheck: false };

const pub = new Redis(REDIS_URL, opts);
const sub = new Redis(REDIS_URL, opts);
const bus = new EventBus(pub, sub);

console.log(
  "[Notification Subscriber] Listening for payment.processed events...",
);

bus.subscribe("payment.processed", async (payload) => {
  if (!payload.success) return;

  console.log(
    `[Notif Sub] Payment confirmed for order #${payload.orderId} — notifying user ${payload.userId}`,
  );
  await new Promise((res) => setTimeout(res, 500)); // simulate push notification

  await bus.publish("notification.sent", {
    userId: payload.userId,
    message: `Your order #${payload.orderId} of $${payload.total.toFixed(2)} has been confirmed!`,
    at: new Date().toISOString(),
  });
});

process.on("SIGTERM", async () => bus.close());
process.on("SIGINT", async () => bus.close());
