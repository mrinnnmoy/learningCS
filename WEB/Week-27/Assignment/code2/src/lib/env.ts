const required = ["DATABASE_URL", "AUTH_SECRET", "REDIS_URL"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `\n\n❌ Missing required environment variable: ${key}\n` +
        `   See .env.example for required variables.\n`,
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  REDIS_URL: process.env.REDIS_URL!,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
