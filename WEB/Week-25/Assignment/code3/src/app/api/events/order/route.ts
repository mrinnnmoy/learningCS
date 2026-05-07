import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Redis from "ioredis";
import { EventBus } from "@/lib/eventBus";
import { redis } from "@/lib/redis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const OrderEventSchema = z.object({
  userId: z.number().int().positive(),
  total: z.number().positive(),
  items: z
    .array(
      z.object({
        productName: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      }),
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = OrderEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  // Publisher-only bus (sub connection not needed for publishing)
  const subConn = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  const bus = new EventBus(redis, subConn);

  const orderId = Date.now(); // simple ID for demo

  await bus.publish("order.placed", {
    orderId,
    userId: parsed.data.userId,
    total: parsed.data.total,
    items: parsed.data.items,
  });

  await subConn.quit();

  return NextResponse.json(
    { orderId, message: "order.placed event published" },
    { status: 201 },
  );
}
