import { NextRequest } from "next/server";
import { QueueEvents } from "bullmq";
import { redis } from "@/lib/redis";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const paymentEvents = new QueueEvents("payment", { connection: redis });
      const inventoryEvents = new QueueEvents("inventory", {
        connection: redis,
      });

      function send(data: object): void {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          /* client disconnected */
        }
      }

      // Helper to check if this event is for our order
      function isOurOrder(jobName: string): boolean {
        return jobName.includes(`-${orderId}`);
      }

      paymentEvents.on("progress", ({ jobId, data }) => {
        send({
          queue: "payment",
          event: "progress",
          jobId,
          progress: data,
          orderId,
        });
      });

      paymentEvents.on("completed", ({ jobId, returnvalue }) => {
        send({
          queue: "payment",
          event: "completed",
          jobId,
          result: returnvalue,
          orderId,
        });
      });

      paymentEvents.on("failed", ({ jobId, failedReason }) => {
        send({
          queue: "payment",
          event: "failed",
          jobId,
          reason: failedReason,
          orderId,
        });
      });

      inventoryEvents.on("completed", ({ jobId, returnvalue }) => {
        send({
          queue: "inventory",
          event: "completed",
          jobId,
          result: returnvalue,
          orderId,
        });
      });

      inventoryEvents.on("failed", ({ jobId, failedReason }) => {
        send({
          queue: "inventory",
          event: "failed",
          jobId,
          reason: failedReason,
          orderId,
        });
      });

      // Send initial connected event
      send({
        event: "connected",
        orderId,
        message: "Listening for job events...",
      });

      // Cleanup after 5 minutes (SSE timeout)
      const timeout = setTimeout(
        async () => {
          await paymentEvents.close();
          await inventoryEvents.close();
          controller.close();
        },
        5 * 60 * 1000,
      );

      // Allow cleanup on controller cancel
      return () => {
        clearTimeout(timeout);
        paymentEvents.close();
        inventoryEvents.close();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
