const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
    console.error('FATAL: REDIS_URL is not set');
    process.exit(1);
}

const redis = new Redis(process.env.REDIS_URL, {
    retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
    },
    enableOfflineQueue: false,
    lazyConnect: true,
});

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

module.exports = redis;