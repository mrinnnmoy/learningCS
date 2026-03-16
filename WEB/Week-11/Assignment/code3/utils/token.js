// Centralises all JWT sign / verify logic.
// Access tokens and refresh tokens use DIFFERENT secrets — a compromised
// refresh secret cannot be used to forge access tokens and vice versa.
// Reads from config/env.js (already validated at startup) instead of
// raw process.env so missing values fail loudly on boot, not at runtime.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN, algorithm: 'HS256' }
    );
}

function generateRefreshToken(user) {
    // Minimal payload — only the user ID is needed to issue a new access token.
    // Never put role or email here; those must always come from a fresh DB lookup.
    return jwt.sign(
        { sub: user.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN, algorithm: 'HS256' }
    );
}

function verifyAccessToken(token) {
    // Throws JsonWebTokenError or TokenExpiredError on failure.
    // { algorithms } restricts to HS256 — prevents the "alg: none" attack.
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}

function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};