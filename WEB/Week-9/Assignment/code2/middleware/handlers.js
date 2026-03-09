const AppError = require('../utils/AppError');

function notFound(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        status: err.status || 'error',
        statusCode,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: isDev || statusCode < 500 ? err.message : 'Something went wrong',
        ...(isDev && statusCode >= 500 && { stack: err.stack }),
    });
}

module.exports = { notFound, errorHandler };