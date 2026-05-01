import { initTRPC, TRPCError } from "@trpc/server";

// Empty context for this assignment — no auth needed
interface Context {}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export { TRPCError };
