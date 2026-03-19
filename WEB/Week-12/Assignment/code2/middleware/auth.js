// Authentication middleware and role-based authorization factory.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

// auth — verifies the JWT from the Authorization: Bearer header.
//
// Security:
//   - try/catch around jwt.verify: without this, an invalid token throws an
//     unhandled exception that either crashes the server or returns a 500
//     with a full stack trace.
//   - { algorithms: ['HS256'] }: prevents the algorithm confusion attack
//     where an attacker sets the JWT header to "alg: none", removes the
//     signature, and some libraries accept it as valid.
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token' });
    }

    try {
        req.user = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// requireRole — authorization middleware factory.
// Call requireRole('admin') to restrict a route to admins only.
// Must be used after auth() since it reads req.user.
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
}

module.exports = { auth, requireRole };