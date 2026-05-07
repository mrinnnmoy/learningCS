import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import type { ReceiptJobData } from "../src/lib/queues/emailReceiptQueue";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

const worker = new Worker<ReceiptJobData>(
  "email-receipt",
  async (job: Job<ReceiptJobData>) => {
    console.log(
      `[Receipt] Generating PDF receipt for order ${job.data.orderId}`,
    );
    await new Promise((res) => setTimeout(res, 1200)); // simulate PDF generation
    console.log(`[Receipt] Sending receipt email to user ${job.data.userId}`);
    await new Promise((res) => setTimeout(res, 500)); // simulate email
    return { sent: true, orderId: job.data.orderId };
  },
  { connection, concurrency: 3 },
);

worker.on("completed", (job, r) =>
  console.log(`✅ [Receipt] Job ${job.id}:`, r),
);
worker.on("failed", (job, e) =>
  console.error(`❌ [Receipt] Job ${job?.id}:`, e.message),
);

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log("[Receipt Worker] Started...");
