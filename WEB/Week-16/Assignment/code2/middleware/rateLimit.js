const redis = require('../lib/redis');

const createRateLimiter = ({ windowSeconds, maxRequests, keyPrefix = 'ratelimit' }) => {
    return async (req, res, next) => {
        try {
            const key = `${keyPrefix}:${req.ip}`;
            const count = await redis.incr(key);

            // Only set the expiry on the first request in the window
            if (count === 1) {
                await redis.expire(key, windowSeconds);
            }

            const ttl = await redis.ttl(key);
            const remaining = Math.max(0, maxRequests - count);
            const resetAt = Date.now() + ttl * 1000;

            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', resetAt);

            if (count > maxRequests) {
                return res.status(429).json({
                    message: 'Too many requests. Please slow down.',
                    retryAfter: ttl,
                });
            }

            next();
        } catch (err) {
            // If Redis is down, don't block the request — fail open
            console.error('Rate limiter error:', err.message);
            next();
        }
    };
};

module.exports = { createRateLimiter };