// Global error handler.
// Must have exactly 4 parameters for Express to treat it as an error handler.

const { isDev } = require('../config/env');

function errorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
    if (isDev) console.error(err.stack);

    res.status(err.status || 500).json({
        message: isDev ? err.message : 'Something went wrong',
        stack: isDev ? err.stack : undefined,
    });
}

module.exports = errorHandler;