import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure; // public — no auth

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // TypeScript now knows userId is number, not undefined
    },
  });
});

// A procedure that requires authentication
export const protectedProcedure = t.procedure.use(isAuthenticated);
export { TRPCError };
