// Centralises all JWT sign / verify logic.
// Routes never import jsonwebtoken directly — they use this module.

const jwt = require('jsonwebtoken');
const AppError = require('./AppError');

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
}

function verifyAccessToken(token) {
    // Throws JsonWebTokenError or TokenExpiredError on failure
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = { generateAccessToken, verifyAccessToken };