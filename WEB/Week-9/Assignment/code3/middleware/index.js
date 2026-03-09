const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

// ── notFound ──────────────────────────────────────────────────────────────────
function notFound(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

// ── errorHandler ──────────────────────────────────────────────────────────────
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        status: err.status || 'error',
        statusCode,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: isDev || statusCode < 500 ? err.message : 'Something went wrong',
        ...(err.details && { details: err.details }),
        ...(isDev && statusCode >= 500 && { stack: err.stack }),
    });
}

// ── API key authentication ────────────────────────────────────────────────────
const VALID_API_KEYS = new Set([
    'key-read-only-abc123',
    'key-write-xyz789',
    'key-admin-secret',
]);

function apiKeyAuth(req, res, next) {
    const key = req.headers['x-api-key'];
    if (!key)
        return next(new AppError('API key required — add X-API-Key header', 401, 'MISSING_API_KEY'));
    if (!VALID_API_KEYS.has(key))
        return next(new AppError('Invalid API key', 403, 'INVALID_API_KEY'));

    req.apiKey = key;
    req.canWrite = key !== 'key-read-only-abc123'; // write tier check
    next();
}

// Authorization guard — requires write-tier key
function requireWrite(req, res, next) {
    if (!req.canWrite)
        return next(new AppError('This API key is read-only', 403, 'READ_ONLY_KEY'));
    next();
}

// ── Rate limiters ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 100,
    standardHeaders: true, legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            status: 'fail', statusCode: 429,
            code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again in 15 minutes.'
        });
    },
});

const writeLimiter = rateLimit({
    windowMs: 60 * 1000, max: 10,
    standardHeaders: true, legacyHeaders: false,
    handler(req, res) {
        res.status(429).json({
            status: 'fail', statusCode: 429,
            code: 'WRITE_RATE_LIMIT_EXCEEDED', message: 'Too many write requests. Max 10/min.'
        });
    },
});

module.exports = { notFound, errorHandler, apiKeyAuth, requireWrite, globalLimiter, writeLimiter };