import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface EmailJobData {
  to: string;
  name: string;
  userId: number;
  type: "welcome" | "receipt" | "reset-password";
}

export const emailQueue = new Queue<EmailJobData>("email", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});
