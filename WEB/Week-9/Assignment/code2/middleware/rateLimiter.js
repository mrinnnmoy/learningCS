const rateLimit = require('express-rate-limit');

// Global — 100 req / 15 min per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,  // sends X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
    legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            status: 'fail', statusCode: 429,
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again in 15 minutes.',
        });
    },
});

// Write limiter — stricter: 20 req / 15 min per IP
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            status: 'fail', statusCode: 429,
            code: 'WRITE_RATE_LIMIT_EXCEEDED',
            message: 'Too many write requests. Please slow down.',
        });
    },
});

module.exports = { globalLimiter, writeLimiter };