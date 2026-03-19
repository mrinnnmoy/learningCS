// Global error handler.
// 4 parameters required — Express uses the parameter count to identify
// this as an error handler rather than a regular middleware function.

const { isDev } = require('../../config/env');

function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
    if (isDev) console.error(err.stack);

    res.status(err.status || 500).json({
        message: isDev ? err.message : 'Something went wrong',
        stack: isDev ? err.stack : undefined,
    });
}

module.exports = errorHandler;