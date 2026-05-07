import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface ReceiptJobData {
  orderId: number;
  userId: number;
  total: number;
}

export const emailReceiptQueue = new Queue<ReceiptJobData>("email-receipt", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 2000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
});
