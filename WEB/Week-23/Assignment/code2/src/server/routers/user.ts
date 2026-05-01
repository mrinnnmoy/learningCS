import { z } from "zod";
import bcrypt from "bcrypt";
import { router, procedure, protectedProcedure, TRPCError } from "../trpc";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
} as const;

export const userRouter = router({
  register: procedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }
      const hash = await bcrypt.hash(input.password, 12);
      const user = await ctx.prisma.user.create({
        data: { name: input.name, email: input.email, password: hash },
        select: safeUserSelect,
      });
      return user;
    }),

  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !(await bcrypt.compare(input.password, user.password))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
      // Signal the route handler to set a session cookie
      ctx.setCookie(
        `userId=${user.id}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`,
      );
      return { id: user.id, email: user.email, name: user.name };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: safeUserSelect,
    });
    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    return user;
  }),

  logout: protectedProcedure.mutation(({ ctx }) => {
    ctx.clearCookie();
    return { success: true as const };
  }),
});
