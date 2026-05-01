import { z } from "zod";
import { observable } from "@trpc/server/observable";
import { router, protectedProcedure, adminProcedure, TRPCError } from "../trpc";
import { UpdateOrderStatusSchema, OrderStatus } from "@/schemas/order";
import { orderEvents } from "@/lib/events";

export const orderRouter = router({
  checkout: protectedProcedure.mutation(async ({ ctx }) => {
    const cartItems = await ctx.prisma.cartItem.findMany({
      where: { userId: ctx.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
    }

    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    const total = cartItems.reduce(
      (s, i) => s + i.product.price * i.quantity,
      0,
    );

    // Atomic: create order + order items + decrement stock + clear cart
    const order = await ctx.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: ctx.userId,
          total,
          status: "pending",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
              name: item.product.name,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { userId: ctx.userId } });

      return newOrder;
    });

    return order;
  }),

  getMyOrders: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.order.findMany({
      where: { userId: ctx.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ),

  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.id },
        include: { items: { include: { product: true } } },
      });
      if (!order)
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      if (order.userId !== ctx.userId)
        throw new TRPCError({ code: "FORBIDDEN" });
      return order;
    }),

  updateStatus: adminProcedure
    .input(UpdateOrderStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const order = await ctx.prisma.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
      // Emit real-time event so the customer's subscription fires
      orderEvents.emitStatusChange({
        orderId: order.id,
        userId: order.userId,
        status: input.status as OrderStatus,
      });
      return order;
    }),

  // SSE subscription — fires when the order status changes
  onStatusChange: protectedProcedure
    .input(z.object({ orderId: z.number().int() }))
    .subscription(({ input, ctx }) => {
      return observable<{ orderId: number; status: OrderStatus }>(
        ({ emit }) => {
          const unsubscribe = orderEvents.onStatusChange((data) => {
            // Only emit to the order owner and for the correct order
            if (data.userId === ctx.userId && data.orderId === input.orderId) {
              emit.next({ orderId: data.orderId, status: data.status });
            }
          });
          return unsubscribe;
        },
      );
    }),
});
