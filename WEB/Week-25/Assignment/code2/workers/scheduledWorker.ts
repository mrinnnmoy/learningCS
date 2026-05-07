import { Worker, Queue, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@prisma/client";

const connection = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
  { maxRetriesPerRequest: null, enableReadyCheck: false },
);

const prisma = new PrismaClient();
const heartbeatQueue = new Queue("heartbeat", { connection });

// Add a repeatable job on startup — runs every minute
heartbeatQueue
  .add("check-pending-orders", {}, { repeat: { pattern: "* * * * *" } })
  .then(() =>
    console.log("[Scheduler] Heartbeat job scheduled (every minute)"),
  );

const worker = new Worker<Record<string, never>>(
  "heartbeat",
  async (_job: Job) => {
    const count = await prisma.order.count({ where: { status: "pending" } });
    console.log(
      `💓 [Heartbeat] ${new Date().toISOString()} — ${count} pending order(s)`,
    );
    return { pendingOrders: count };
  },
  { connection },
);

worker.on("completed", (job, r) => console.log(`[Heartbeat] Ran:`, r));

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
});
process.on("SIGINT", async () => {
  await worker.close();
  await connection.quit();
});

console.log("[Scheduler Worker] Started...");
