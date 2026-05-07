import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

const globalForRedis = globalThis as unknown as { redis?: Redis };

// Shared connection for general use and publishing
export const redis =
  globalForRedis.redis ??
  new Redis(REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Factory: creates a FRESH connection for subscribing
// Subscribed clients are in a special mode — they cannot issue other Redis commands
export function makeSubscriber(): Redis {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
