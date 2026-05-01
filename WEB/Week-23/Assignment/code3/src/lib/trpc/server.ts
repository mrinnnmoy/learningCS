// Used to call tRPC directly from Server Components — no HTTP overhead

import { appRouter } from "@/server/routers/_app";
import { prisma } from "@/lib/prisma";

export const serverTrpc = appRouter.createCaller({
  prisma,
  userId: undefined,
  setCookie: () => {},
  clearCookie: () => {},
});
