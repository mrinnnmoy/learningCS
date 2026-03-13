const AppError = require('../utils/AppError');
const { logger } = require('../config/logger');

function normalizeError(err) {
    if (err.type === 'entity.parse.failed') return new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
    if (err.name === 'JsonWebTokenError') return new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
    if (err.name === 'TokenExpiredError') return new AppError('Authentication token has expired', 401, 'TOKEN_EXPIRED');
    return err;
}

module.exports = function errorHandler(err, req, res, next) {
    const error = normalizeError(err);
    const statusCode = error.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';

    const logCtx = {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        code: error.code || 'UNKNOWN',
        message: error.message,
    };

    // 5xx → logger.error, 4xx → logger.warn
    if (statusCode >= 500) logger.error('Request failed — server error', { ...logCtx, stack: error.stack });
    else logger.warn('Request failed — client error', logCtx);

    if (isDev) {
        return res.status(statusCode).json({
            status: error.status || 'error', statusCode,
            code: error.code || 'INTERNAL_SERVER_ERROR',
            message: error.message, requestId: req.requestId,
            ...(error.details && { details: error.details }),
            stack: error.stack,
        });
    }

    if (error.isOperational) {
        return res.status(statusCode).json({
            status: error.status, statusCode, code: error.code,
            message: error.message, requestId: req.requestId,
            ...(error.details && { details: error.details }),
        });
    }

    return res.status(500).json({
        status: 'error', statusCode: 500, code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong. Please try again later.', requestId: req.requestId,
    });
};