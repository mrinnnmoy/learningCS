// Factory that returns a middleware allowing only the specified roles.
// MUST be placed after authenticate in the middleware chain (requires req.user).
//
// Usage:
//   router.delete('/users/:id', authenticate, authorizeRole('admin'), handler)
//   router.post('/posts',       authenticate, authorizeRole('editor', 'admin'), handler)

const AppError = require('../utils/AppError');

module.exports = function authorizeRole(...allowedRoles) {
    return function (req, res, next) {
        // Guard: authenticate must have run first
        if (!req.user) {
            return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError(
                `Access denied. Required role: ${allowedRoles.join(' or ')}. ` +
                `Your role: ${req.user.role}`,
                403,
                'FORBIDDEN'
            ));
        }

        next();
    };
};