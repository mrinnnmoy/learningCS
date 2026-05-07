import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";
import type { PaymentJobData } from "../src/lib/queues/paymentQueue";
import type { DLQJobData } from "../src/lib/queues/dlqQueue";
import { Queue } from "bullmq";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

const prisma = new PrismaClient();
const dlqConn = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});
const dlq = new Queue<DLQJobData>("payment-dlq", { connection: dlqConn });

const worker = new Worker<PaymentJobData>(
  "payment",
  async (job: Job<PaymentJobData>) => {
    console.log(
      `[Payment] Processing order ${job.data.orderId} ($${job.data.total})`,
    );
    await job.updateProgress(10);

    // Simulate payment gateway call (1.5s)
    await new Promise((res) => setTimeout(res, 1500));
    await job.updateProgress(70);

    // Simulate occasional failure for retry demonstration
    if (Math.random() < 0.1) throw new Error("Payment gateway timeout");

    // Update order status in DB
    await prisma.order.update({
      where: { id: job.data.orderId },
      data: { status: "paid" },
    });

    await job.updateProgress(100);
    console.log(`[Payment] Order ${job.data.orderId} charged successfully`);
    return {
      charged: true,
      orderId: job.data.orderId,
      at: new Date().toISOString(),
    };
  },
  {
    connection,
    concurrency: 3,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
);

worker.on("completed", (job, result) => {
  console.log(`✅ [Payment] Job ${job.id} completed:`, result);
});

worker.on("failed", async (job, err) => {
  console.error(
    `❌ [Payment] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
    err.message,
  );

  // Move to DLQ if all retries exhausted
  const maxAttempts = job?.opts.attempts ?? 3;
  if (job && job.attemptsMade >= maxAttempts) {
    await dlq.add("payment-failed", {
      originalQueue: "payment",
      originalJobId: job.id,
      originalData: job.data,
      failedReason: err.message,
      failedAt: new Date().toISOString(),
      attemptsMade: job.attemptsMade,
    });
    console.log(`🚨 [Payment] Job ${job.id} moved to DLQ`);
  }
});

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log("[Payment Worker] Started...");
