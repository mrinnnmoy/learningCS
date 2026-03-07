const { nodeEnv } = require('../config/env');

module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    if (statusCode >= 500) {
        console.error(`[ERROR] [${req.requestId}] ${statusCode} — ${message}`);
        if (nodeEnv === 'development') console.error(err.stack);
    }

    res.status(statusCode).json({
        status: err.status || 'error',
        statusCode,
        // Never expose internal error details in production
        message: nodeEnv === 'production' && statusCode >= 500 ? 'Something went wrong' : message,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        ...(nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
};