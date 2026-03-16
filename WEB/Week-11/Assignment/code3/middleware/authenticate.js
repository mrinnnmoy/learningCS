// Extracts and verifies the Bearer token from the Authorization header.
// Attaches the decoded JWT payload to req.user for downstream handlers.
// Uses config/env.js (validated at startup) — never raw process.env.

const { verifyAccessToken } = require('../utils/token');
const AppError = require('../utils/AppError');

module.exports = function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError(
            'No token provided. Add header: Authorization: Bearer <token>',
            401,
            'NO_TOKEN'
        ));
    }

    const token = authHeader.split(' ')[1]; // "Bearer <token>" → "<token>"

    try {
        // verifyAccessToken throws on invalid signature, expired token, wrong algorithm
        const decoded = verifyAccessToken(token);
        req.user = decoded; // { sub, email, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(
                'Access token has expired. Use POST /auth/refresh to get a new one.',
                401,
                'TOKEN_EXPIRED'
            ));
        }
        return next(new AppError(
            'Invalid token. Please log in again.',
            401,
            'INVALID_TOKEN'
        ));
    }
};