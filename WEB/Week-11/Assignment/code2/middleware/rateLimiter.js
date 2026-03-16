const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    standardHeaders: true, legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            status: 'fail', code: 'AUTH_RATE_LIMIT',
            message: 'Too many authentication attempts. Try again in 15 minutes.',
        });
    },
});

module.exports = { authLimiter };