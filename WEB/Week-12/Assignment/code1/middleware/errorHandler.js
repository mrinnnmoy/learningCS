// Global error handler.
// Must have exactly 4 parameters — that is how Express identifies it
// as an error handler rather than a regular middleware function.
//
// Security: stack trace is only included in development.
// In production it is omitted because it reveals internal file paths,
// framework versions, and sometimes database query structure.

const { isDev } = require('../config/env');

function errorHandler(err, req, res, next) {
    // Always log the full error on the server regardless of environment.
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
    if (isDev) console.error(err.stack);

    res.status(err.status || 500).json({
        message: isDev ? err.message : 'Something went wrong',
        stack: isDev ? err.stack : undefined,
    });
}

module.exports = errorHandler;