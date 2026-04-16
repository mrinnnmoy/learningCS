interface Env {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: "development" | "production" | "test";
}

function getEnv(): Env {
  const missing = ["DATABASE_URL"].filter((k) => !process.env[k]);
  if (missing.length)
    throw new Error(`Missing env vars: ${missing.join(", ")}`);

  // satisfies checks the object matches Env without widening the inferred type.
  // Unlike 'as Env', it still catches type errors on individual properties.
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    PORT: parseInt(process.env.PORT || "3000", 10),
    NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) || "development",
  } satisfies Env;
}

export const env = getEnv();
