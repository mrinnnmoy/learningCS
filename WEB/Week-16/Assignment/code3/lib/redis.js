const Redis = require('ioredis');

const createRedisClient = (name = 'redis') => {
    if (!process.env.REDIS_URL) {
        console.error('FATAL: REDIS_URL is not set');
        process.exit(1);
    }

    const client = new Redis(process.env.REDIS_URL, {
        retryStrategy(times) {
            if (times > 5) return null;
            return Math.min(times * 200, 2000);
        },
        enableOfflineQueue: false,
        lazyConnect: true,
    });

    client.on('connect', () => console.log(`✅ ${name} connected`));
    client.on('error', (err) => console.error(`${name} error:`, err.message));

    return client;
};

// Main client for commands
const redis = createRedisClient('Redis');

module.exports = { redis, createRedisClient };