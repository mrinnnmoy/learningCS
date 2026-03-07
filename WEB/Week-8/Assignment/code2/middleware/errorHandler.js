function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Log server errors with requestId for easy log searching
    if (statusCode >= 500) {
        console.error(`[ERROR] [${req.requestId}] ${statusCode} — ${message}`);
    }

    res.status(statusCode).json({
        status: err.status || 'error',
        statusCode,
        message,
        requestId: req.requestId,
        ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    });
}
module.exports = errorHandler;