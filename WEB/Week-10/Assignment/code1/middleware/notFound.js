// Catches any request that didn't match a defined route and forwards
// a 404 AppError to the centralized error handler.

const AppError = require('../utils/AppError');

module.exports = function notFound(req, res, next) {
    next(
        new AppError(
            `Route not found: ${req.method} ${req.originalUrl}`,
            404,
            'ROUTE_NOT_FOUND'
        )
    );
};