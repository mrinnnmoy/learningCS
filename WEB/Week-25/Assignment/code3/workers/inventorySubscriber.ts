import Redis from "ioredis";
import { EventBus } from "../src/lib/eventBus";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const opts = { maxRetriesPerRequest: null as null, enableReadyCheck: false };

const pub = new Redis(REDIS_URL, opts);
const sub = new Redis(REDIS_URL, opts);
const bus = new EventBus(pub, sub);

console.log("[Inventory Subscriber] Listening for order.placed events...");

bus.subscribe("order.placed", async (payload) => {
  console.log(`[Inventory Sub] Updating stock for order #${payload.orderId}`);
  await new Promise((res) => setTimeout(res, 800)); // simulate stock update

  await bus.publish("stock.updated", {
    orderId: payload.orderId,
    items: payload.items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
    })),
    at: new Date().toISOString(),
  });
});

process.on("SIGTERM", async () => bus.close());
process.on("SIGINT", async () => bus.close());
