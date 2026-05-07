import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export interface NotificationJobData {
  userId: number;
  message: string;
  type: "info" | "success" | "warning";
}

export const notificationQueue = new Queue<NotificationJobData>(
  "notification",
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: "fixed", delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  },
);
