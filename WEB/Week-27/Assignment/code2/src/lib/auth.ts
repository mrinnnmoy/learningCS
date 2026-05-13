"use server";

import { cookies } from "next/headers";
import { env } from "./env";
import { redis } from "./redis";

const COOKIE_NAME = "session";
const SESSION_TTL_S = 60 * 60 * 24 * 7; // 7 days

function sessionKey(id: string): string {
  return `session:${id}`;
}

export async function login(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  if (password !== env.AUTH_SECRET) {
    return { success: false, error: "Invalid password" };
  }

  const sessionId = crypto.randomUUID();
  await redis.set(sessionKey(sessionId), "1", "EX", SESSION_TTL_S);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: SESSION_TTL_S,
    path: "/",
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await redis.del(sessionKey(sessionId));
    cookieStore.delete(COOKIE_NAME);
  }
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId) return false;
  const value = await redis.get(sessionKey(sessionId));
  return value === "1";
}
