import { router, protectedProcedure, TRPCError } from "../trpc";
import { AddToCartSchema, UpdateCartItemSchema } from "@/schemas/cart";

export const cartRouter = router({
  getCart: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.cartItem.findMany({
      where: { userId: ctx.userId },
      include: { product: true },
      orderBy: { id: "asc" },
    }),
  ),

  addItem: protectedProcedure
    .input(AddToCartSchema)
    .mutation(async ({ input, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
      });
      if (!product)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient stock",
        });
      }

      return ctx.prisma.cartItem.upsert({
        where: {
          userId_productId: { userId: ctx.userId, productId: input.productId },
        },
        create: {
          userId: ctx.userId,
          productId: input.productId,
          quantity: input.quantity,
        },
        update: { quantity: { increment: input.quantity } },
        include: { product: true },
      });
    }),

  updateItem: protectedProcedure
    .input(UpdateCartItemSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.quantity === 0) {
        await ctx.prisma.cartItem.deleteMany({
          where: { userId: ctx.userId, productId: input.productId },
        });
        return { removed: true as const };
      }
      const item = await ctx.prisma.cartItem.update({
        where: {
          userId_productId: { userId: ctx.userId, productId: input.productId },
        },
        data: { quantity: input.quantity },
        include: { product: true },
      });
      return item;
    }),

  clear: protectedProcedure.mutation(({ ctx }) =>
    ctx.prisma.cartItem.deleteMany({ where: { userId: ctx.userId } }),
  ),
});
