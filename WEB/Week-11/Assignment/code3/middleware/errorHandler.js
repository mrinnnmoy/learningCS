const AppError = require('../utils/AppError');
const { logger } = require('../config/logger');

function notFound(req, res, next) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

function normalizeError(err) {
    if (err.type === 'entity.parse.failed') return new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
    if (err.name === 'JsonWebTokenError') return new AppError('Invalid token', 401, 'INVALID_TOKEN');
    if (err.name === 'TokenExpiredError') return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    return err;
}

function errorHandler(err, req, res, next) {
    const error = normalizeError(err);
    const statusCode = error.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    const logCtx = { requestId: req.requestId, method: req.method, url: req.originalUrl, statusCode, code: error.code, message: error.message, userId: req.user?.sub || null };
    if (statusCode >= 500) logger.error('Server error', { ...logCtx, stack: error.stack });
    else logger.warn('Client error', logCtx);
    if (isDev) return res.status(statusCode).json({ status: error.status || 'error', statusCode, code: error.code || 'ERROR', message: error.message, requestId: req.requestId, timestamp: new Date().toISOString(), ...(error.details && { details: error.details }), stack: error.stack });
    if (error.isOperational) return res.status(statusCode).json({ status: error.status, statusCode, code: error.code, message: error.message, requestId: req.requestId, timestamp: new Date().toISOString(), ...(error.details && { details: error.details }) });
    return res.status(500).json({ status: 'error', statusCode: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.', requestId: req.requestId, timestamp: new Date().toISOString() });
}

module.exports = { notFound, errorHandler };