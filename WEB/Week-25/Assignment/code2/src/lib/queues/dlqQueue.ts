import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface DLQJobData {
  originalQueue: string;
  originalJobId: string | undefined;
  originalData: unknown;
  failedReason: string;
  failedAt: string;
  attemptsMade: number;
}

export const dlqQueue = new Queue<DLQJobData>("payment-dlq", {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
  },
});
