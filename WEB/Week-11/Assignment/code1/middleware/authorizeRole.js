// Factory — returns middleware allowing only specified roles.
// MUST be used after authenticate (requires req.user).

const AppError = require('../utils/AppError');

module.exports = function authorizeRole(...allowedRoles) {
    return function (req, res, next) {
        if (!req.user)
            return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));

        if (!allowedRoles.includes(req.user.role))
            return next(new AppError(
                `Access denied. Required: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
                403, 'FORBIDDEN'
            ));

        next();
    };
};