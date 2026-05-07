import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { FlowProducer } from "bullmq";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { emailReceiptQueue } from "@/lib/queues/emailReceiptQueue";

const OrderSchema = z.object({
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
  const parsed = OrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const { userId, total, items } = parsed.data;

  // 1. Save order
  const order = await prisma.order.create({
    data: {
      userId,
      total,
      status: "pending",
      items: {
        create: items,
      },
    },
  });

  // High-value orders receive higher priority
  const priority = total > 500 ? 1 : 5;

  const flow = new FlowProducer({
    connection: redis,
  });

  // Parent payment job
  await flow.add({
    name: `charge-order-${order.id}`,
    queueName: "payment",
    data: {
      orderId: order.id,
      userId,
      total,
    },
    opts: {
      priority,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: {
        count: 200,
      },
      removeOnFail: {
        count: 500,
      },
    },
    children: [
      {
        name: `decrement-inventory-${order.id}`,
        queueName: "inventory",
        data: {
          orderId: order.id,
          items: items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
          })),
        },
        opts: {
          priority,
          attempts: 2,
          backoff: {
            type: "fixed",
            delay: 2000,
          },
          removeOnComplete: {
            count: 200,
          },
          removeOnFail: {
            count: 500,
          },
        },
      },
    ],
  });

  // Independent receipt job
  await emailReceiptQueue.add(
    `receipt-order-${order.id}`,
    {
      orderId: order.id,
      userId,
      total,
    },
    {
      priority,
    },
  );

  return NextResponse.json(
    {
      orderId: order.id,
      priority,
    },
    {
      status: 201,
    },
  );
}
