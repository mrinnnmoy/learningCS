import { z } from "zod";
import { router, procedure, protectedProcedure, TRPCError } from "../trpc";

const authorSelect = { select: { id: true, name: true, email: true } } as const;

export const postRouter = router({
  getAll: procedure.query(async ({ ctx }) =>
    ctx.prisma.post.findMany({
      where: { published: true },
      include: { author: authorSelect },
      orderBy: { createdAt: "desc" },
    }),
  ),

  getMyPosts: protectedProcedure.query(async ({ ctx }) =>
    ctx.prisma.post.findMany({
      where: { authorId: ctx.userId },
      orderBy: { createdAt: "desc" },
    }),
  ),

  getById: procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { author: authorSelect },
      });
      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      return post;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(200),
        content: z.string().min(1, "Content is required"),
      }),
    )
    .mutation(async ({ input, ctx }) =>
      ctx.prisma.post.create({
        data: { ...input, authorId: ctx.userId, published: false },
      }),
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const post = await ctx.prisma.post.findUnique({ where: { id } });
      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (post.authorId !== ctx.userId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own posts",
        });
      return ctx.prisma.post.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (post.authorId !== ctx.userId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        });
      await ctx.prisma.post.delete({ where: { id: input.id } });
      return { success: true as const };
    }),

  togglePublish: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });
      if (!post)
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      if (post.authorId !== ctx.userId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only publish your own posts",
        });
      return ctx.prisma.post.update({
        where: { id: input.id },
        data: { published: !post.published },
      });
    }),
});
