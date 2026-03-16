// Access tokens and refresh tokens use DIFFERENT secrets.
// Compromising one secret does not compromise the other.

const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m', algorithm: 'HS256' }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id }, // minimal payload — only user ID needed for renewal
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', algorithm: 'HS256' }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
}

function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };