import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import type { InventoryJobData } from "../src/lib/queues/inventoryQueue";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

const worker = new Worker<InventoryJobData>(
  "inventory",
  async (job: Job<InventoryJobData>) => {
    console.log(`[Inventory] Decrementing stock for order ${job.data.orderId}`);
    await new Promise((res) => setTimeout(res, 800)); // simulate stock update
    for (const item of job.data.items) {
      console.log(`[Inventory]   - ${item.productName}: -${item.quantity}`);
    }
    return {
      updated: true,
      orderId: job.data.orderId,
      itemCount: job.data.items.length,
    };
  },
  { connection, concurrency: 5 },
);

worker.on("completed", (job, r) =>
  console.log(`✅ [Inventory] Job ${job.id}:`, r),
);
worker.on("failed", (job, e) =>
  console.error(`❌ [Inventory] Job ${job?.id}:`, e.message),
);

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log("[Inventory Worker] Started...");
