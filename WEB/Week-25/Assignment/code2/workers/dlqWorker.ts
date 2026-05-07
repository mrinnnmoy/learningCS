import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import type { DLQJobData } from "../src/lib/queues/dlqQueue";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

const worker = new Worker<DLQJobData>(
  "payment-dlq",
  async (job: Job<DLQJobData>) => {
    console.error(`🚨 [DLQ] Dead letter job received:`);
    console.error(`   Original queue:  ${job.data.originalQueue}`);
    console.error(`   Original job ID: ${job.data.originalJobId}`);
    console.error(`   Failed reason:   ${job.data.failedReason}`);
    console.error(`   Attempts made:   ${job.data.attemptsMade}`);
    console.error(`   Failed at:       ${job.data.failedAt}`);
    // In production: alert team via Slack, PagerDuty, etc.
    return { alerted: true };
  },
  { connection, concurrency: 1 },
);

worker.on("completed", (job) =>
  console.log(`✅ [DLQ] Processed dead letter job ${job.id}`),
);

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log("[DLQ Worker] Started — monitoring payment-dlq...");
