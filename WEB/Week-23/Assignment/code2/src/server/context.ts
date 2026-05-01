import { prisma } from "@/lib/prisma";

// Context created for every tRPC request
// We read the session cookie and pass userId down to every procedure
export interface Context {
  prisma: typeof prisma;
  userId: number | undefined;
  // We also store a response helper so procedures can set/clear cookies
  setCookie: (value: string) => void;
  clearCookie: () => void;
}

export function createContext(req: Request): Context {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const userId = parseCookie(cookieHeader, "userId");

  // We accumulate Set-Cookie headers to apply after the handler runs
  let pendingCookie: string | null = null;

  return {
    prisma,
    userId: userId ? parseInt(userId, 10) : undefined,
    setCookie: (value: string) => {
      pendingCookie = value;
    },
    clearCookie: () => {
      pendingCookie = "userId=; Max-Age=0; Path=/; HttpOnly";
    },
    // Note: in the route handler we read pendingCookie back via a closure trick
    // For simplicity this assignment uses response headers set directly in the handler
  };
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  return cookieHeader
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === name)?.[1];
}
