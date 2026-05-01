import bcrypt from "bcrypt";
import { router, procedure, protectedProcedure, TRPCError } from "../trpc";
import { RegisterSchema, LoginSchema } from "@/schemas/auth";

const safeSelect = { id: true, email: true, name: true, role: true } as const;

export const authRouter = router({
  register: procedure.input(RegisterSchema).mutation(async ({ input, ctx }) => {
    const existing = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing)
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email already registered",
      });
    const hash = await bcrypt.hash(input.password, 12);
    return ctx.prisma.user.create({
      data: { name: input.name, email: input.email, password: hash },
      select: safeSelect,
    });
  }),

  login: procedure.input(LoginSchema).mutation(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }
    ctx.setCookie(
      `userId=${user.id}; Path=/; HttpOnly; Max-Age=604800; SameSite=Strict`,
    );
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: safeSelect,
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
