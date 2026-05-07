import { Worker, Job } from "bullmq";
import Redis from "ioredis";
// Note: we import directly from the TypeScript source.
// In production this would be a compiled import.
import type { NotificationJobData } from "../src/lib/queues/notificationQueue";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

// In-memory store reference for the worker process
// (Separate process — own copy of in-memory data)
const notifLog: {
  userId: number;
  message: string;
  type: string;
  at: string;
}[] = [];

const worker = new Worker<NotificationJobData>(
  "notification",
  async (job: Job<NotificationJobData>) => {
    console.log(
      `[Notif Worker] Processing job ${job.id} for user ${job.data.userId}`,
    );

    const entry = {
      userId: job.data.userId,
      message: job.data.message,
      type: job.data.type,
      at: new Date().toISOString(),
    };
    notifLog.push(entry);

    console.log(`[Notif Worker] Stored notification:`, entry);
    return { stored: true, ...entry };
  },
  {
    connection,
    concurrency: 10,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
);

worker.on("completed", (job, result) => {
  console.log(`✅ [Notif] Job ${job.id} completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`❌ [Notif] Job ${job?.id} failed:`, err.message);
});

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log(
  '[Notif Worker] Started — waiting for jobs on "notification" queue...',
);
