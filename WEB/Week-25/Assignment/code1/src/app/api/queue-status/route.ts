import { NextResponse } from "next/server";
import { emailQueue } from "@/lib/queues/emailQueue";
import { notificationQueue } from "@/lib/queues/notificationQueue";

export async function GET() {
  const [emailCounts, notifCounts] = await Promise.all([
    emailQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    ),
    notificationQueue.getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    ),
  ]);

  return NextResponse.json({
    email: emailCounts,
    notification: notifCounts,
    fetchedAt: new Date().toISOString(),
  });
}
