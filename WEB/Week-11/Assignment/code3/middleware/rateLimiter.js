const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
    handler(req, res) { res.status(429).json({ status: 'fail', code: 'AUTH_RATE_LIMIT', message: 'Too many auth attempts. Try again in 15 minutes.' }); },
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false,
    handler(req, res) { res.status(429).json({ status: 'fail', code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests.' }); },
});

module.exports = { authLimiter, globalLimiter };