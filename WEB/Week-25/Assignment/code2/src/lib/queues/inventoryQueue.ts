import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface InventoryJobData {
  orderId: number;
  items: { productName: string; quantity: number }[];
}

export const inventoryQueue = new Queue<InventoryJobData>("inventory", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 2000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  },
});
