import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import type { EmailJobData } from "../src/lib/queues/emailQueue";

// Workers use their OWN connection — never share with the producer
const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

async function simulateSendEmail(data: EmailJobData): Promise<void> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 1000));
  // In production: call nodemailer, SendGrid, Resend, etc.
  console.log(
    `[Email] Sent ${data.type} email to ${data.to} (userId: ${data.userId})`,
  );
}

const worker = new Worker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    console.log(`[Email Worker] Starting job ${job.id}: ${job.name}`);

    await job.updateProgress(0);
    console.log(`[Email Worker] Preparing email to ${job.data.to}...`);

    await job.updateProgress(50);
    await simulateSendEmail(job.data);

    await job.updateProgress(100);
    return { sent: true, to: job.data.to, sentAt: new Date().toISOString() };
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
);

worker.on("completed", (job, result) => {
  console.log(`✅ [Email] Job ${job.id} completed:`, result);
});

worker.on("failed", (job, err) => {
  console.error(
    `❌ [Email] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
    err.message,
  );
});

worker.on("progress", (job, progress) => {
  console.log(`⏳ [Email] Job ${job.id} — ${progress}%`);
});

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log('[Email Worker] Started — waiting for jobs on "email" queue...');
