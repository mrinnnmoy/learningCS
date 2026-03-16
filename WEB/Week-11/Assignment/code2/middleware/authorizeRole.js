const AppError = require('../utils/AppError');
module.exports = function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user)
            return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
        if (!allowedRoles.includes(req.user.role))
            return next(new AppError(
                `Requires role: ${allowedRoles.join(' or ')}. You have: ${req.user.role}`,
                403, 'FORBIDDEN'
            ));
        next();
    };
};