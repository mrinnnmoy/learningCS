import { prisma } from "@/lib/prisma";

export interface Context {
  prisma: typeof prisma;
  userId: number | undefined;
  setCookie: (value: string) => void;
  clearCookie: () => void;
}

function parseCookie(header: string | null, name: string): number | undefined {
  if (!header) return undefined;
  const pair = header
    .split(";")
    .map((c) => c.trim().split("="))
    .find(([k]) => k === name);
  return pair ? parseInt(pair[1], 10) : undefined;
}

export function createContext(req: Request): Context {
  let pendingCookie: string | null = null;

  return {
    prisma,
    userId: parseCookie(req.headers.get("cookie"), "userId"),
    setCookie: (v: string) => {
      pendingCookie = v;
    },
    clearCookie: () => {
      pendingCookie = "userId=; Max-Age=0; Path=/; HttpOnly";
    },
  };
}
