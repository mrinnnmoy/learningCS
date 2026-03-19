// Rate limiter for authentication routes.
//
// Security: limits how many requests a single IP can make to login/register.
// Without this, an attacker can send thousands of requests per second to
// brute-force passwords or enumerate registered email addresses.
//
// Max 5 attempts per IP per 15-minute window.
// After the 5th attempt the client receives HTTP 429 Too Many Requests.

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' },
    standardHeaders: true,  // return rate limit info in RateLimit-* headers
    legacyHeaders: false,
});

module.exports = { authLimiter };