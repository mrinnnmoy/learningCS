import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export async function GET() {
  const sub = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Subscribe to ALL channels using pattern '*'
      sub.psubscribe("*").catch(console.error);

      sub.on(
        "pmessage",
        (_pattern: string, channel: string, message: string) => {
          try {
            const data = {
              channel,
              ...(JSON.parse(message) as object),
              receivedAt: new Date().toISOString(),
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            );
          } catch {
            /* ignore malformed */
          }
        },
      );

      // Send a heartbeat every 30 seconds to keep the SSE connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Cleanup when client disconnects
      return async () => {
        clearInterval(heartbeat);
        await sub.quit();
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
