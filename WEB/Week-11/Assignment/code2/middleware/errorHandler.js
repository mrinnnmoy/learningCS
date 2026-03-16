const AppError = require('../utils/AppError');

function notFound(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
    let error = err;
    if (err.name === 'JsonWebTokenError') error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
    if (err.name === 'TokenExpiredError') error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    const statusCode = error.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        status: error.status || 'error',
        statusCode,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: isDev || statusCode < 500 ? error.message : 'Something went wrong',
        ...(error.details && { details: error.details }),
        ...(isDev && { stack: error.stack }),
    });
}

module.exports = { notFound, errorHandler };