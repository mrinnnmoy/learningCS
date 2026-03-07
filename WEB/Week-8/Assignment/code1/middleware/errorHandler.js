function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: statusCode < 500 ? 'fail' : 'error',
        statusCode,
        message,
        // Only expose stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
module.exports = errorHandler;