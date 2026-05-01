import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { prisma } from "@/lib/prisma";

function parseCookie(header: string | null, name: string): number | undefined {
  if (!header) return undefined;
  const match = header
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === name);
  return match ? parseInt(match[1], 10) : undefined;
}

async function handleRequest(req: Request) {
  let pendingSetCookie: string | null = null;

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({
      prisma,
      userId: parseCookie(req.headers.get("cookie"), "userId"),
      setCookie: (v: string) => {
        pendingSetCookie = v;
      },
      clearCookie: () => {
        pendingSetCookie = "userId=; Max-Age=0; Path=/; HttpOnly";
      },
    }),
    onError: ({ error, path }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC] ${path}:`, error);
      }
    },
  });

  if (pendingSetCookie) {
    const headers = new Headers(response.headers);
    headers.set("Set-Cookie", pendingSetCookie);
    return new Response(response.body, { status: response.status, headers });
  }

  return response;
}

export { handleRequest as GET, handleRequest as POST };
