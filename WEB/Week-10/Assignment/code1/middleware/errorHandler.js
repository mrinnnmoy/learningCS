// Centralized error-handling middleware — MUST have exactly 4 arguments.
//
// Behaviour:
//   development → return full details: message, code, stack
//   production  → operational errors get message + code; bugs get generic message
//
// Also transforms known framework/library errors into operational AppErrors
// so they produce correct HTTP status codes instead of defaulting to 500.

const AppError = require('../utils/AppError');

// ── Transform known error types into operational AppErrors ────────────────────

function handleJsonSyntaxError() {
    // express.json() throws this when the request body is malformed JSON
    return new AppError(
        'Invalid JSON in request body — please check your syntax',
        400,
        'INVALID_JSON'
    );
}

function handleJwtError() {
    return new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
}

function handleJwtExpired() {
    return new AppError('Authentication token has expired, please log in again', 401, 'TOKEN_EXPIRED');
}

// ── Main handler ──────────────────────────────────────────────────────────────

module.exports = function errorHandler(err, req, res, next) {
    // Normalise: transform known non-AppError types first
    let error = err;

    if (err.type === 'entity.parse.failed') error = handleJsonSyntaxError();
    if (err.name === 'JsonWebTokenError') error = handleJwtError();
    if (err.name === 'TokenExpiredError') error = handleJwtExpired();

    // Apply defaults for anything not already an AppError
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    error.code = error.code || 'INTERNAL_SERVER_ERROR';

    const isDev = process.env.NODE_ENV === 'development';

    // ── Development: expose everything ─────────────────────────────────────────
    if (isDev) {
        return res.status(error.statusCode).json({
            status: error.status,
            statusCode: error.statusCode,
            code: error.code,
            message: error.message,
            requestId: req.requestId,
            ...(error.details && { details: error.details }),
            stack: error.stack,
        });
    }

    // ── Production: distinguish operational vs programmer errors ────────────────
    if (error.isOperational) {
        // Operational (AppError) — safe to return message to client
        return res.status(error.statusCode).json({
            status: error.status,
            statusCode: error.statusCode,
            code: error.code,
            message: error.message,
            requestId: req.requestId,
            ...(error.details && { details: error.details }),
        });
    }

    // Programmer error / unknown error — never expose internals
    console.error('[PROGRAMMER ERROR]', {
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
    });

    return res.status(500).json({
        status: 'error',
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again later.',
        requestId: req.requestId,
    });
};