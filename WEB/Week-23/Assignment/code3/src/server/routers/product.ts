import { z } from "zod";
import { router, procedure, adminProcedure, TRPCError } from "../trpc";
import { CreateProductSchema } from "@/schemas/product";

export const productRouter = router({
  getAll: procedure.query(({ ctx }) =>
    ctx.prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
  ),

  getById: procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.id },
      });
      if (!product)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      return product;
    }),

  create: adminProcedure
    .input(CreateProductSchema)
    .mutation(({ input, ctx }) => ctx.prisma.product.create({ data: input })),
});
