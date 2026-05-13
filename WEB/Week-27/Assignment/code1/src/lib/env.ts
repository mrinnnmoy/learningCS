// This file runs on the SERVER ONLY (no 'use client').
// It validates all required environment variables at startup.
// If anything is missing, the server crashes immediately with a clear message
// instead of failing silently with a cryptic error later.

const required = ["DATABASE_URL", "AUTH_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `\n\n❌ Missing required environment variable: ${key}\n` +
        `   Check your .env.local file and make sure it is set.\n` +
        `   See .env.example for all required variables.\n`,
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
