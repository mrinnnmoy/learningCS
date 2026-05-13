"use server";

import { cookies } from "next/headers";
import { env } from "./env";

const SESSION_COOKIE = "session";
const SESSION_VALUE = "authenticated";

export async function login(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  // In a real app: look up user in DB, compare bcrypt hash
  // For this demo: compare against AUTH_SECRET directly
  if (password !== env.AUTH_SECRET) {
    return { success: false, error: "Invalid password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
