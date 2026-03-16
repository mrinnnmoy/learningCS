const { verifyAccessToken } = require('../utils/token');
const AppError = require('../utils/AppError');

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(
            'Access denied. Please provide a token: Authorization: Bearer <token>',
            401, 'NO_TOKEN'
        ));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; // { sub, email, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return next(new AppError('Token has expired. Please log in again.', 401, 'TOKEN_EXPIRED'));
        return next(new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN'));
    }
};