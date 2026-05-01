import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { prisma } from "@/lib/prisma";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export { TRPCError };

// Auth middleware
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.userId)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// Admin middleware — checks user role in the DB
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const user = await prisma.user.findUnique({
    where: { id: ctx.userId },
    select: { role: true },
  });
  if (user?.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
export const adminProcedure = t.procedure.use(isAdmin);
