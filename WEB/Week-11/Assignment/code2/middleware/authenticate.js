const { verifyAccessToken } = require('../utils/token');
const AppError = require('../utils/AppError');

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return next(new AppError('No token provided. Use Authorization: Bearer <token>', 401, 'NO_TOKEN'));

    const token = authHeader.split(' ')[1];
    try {
        req.user = verifyAccessToken(token);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return next(new AppError('Token has expired. Use POST /auth/refresh', 401, 'TOKEN_EXPIRED'));
        return next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
};