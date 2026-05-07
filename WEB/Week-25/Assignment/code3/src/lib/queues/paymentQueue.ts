import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface PaymentJobData {
  orderId: number;
  userId: number;
  total: number;
}

export const paymentQueue = new Queue<PaymentJobData>("payment", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});
