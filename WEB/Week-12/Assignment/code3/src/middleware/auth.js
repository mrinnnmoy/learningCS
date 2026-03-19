// Authentication middleware and role-based authorization factory.

const jwt = require('jsonwebtoken');
const env = require('../../config/env');

// auth — verifies the JWT from Authorization: Bearer or the x-token header.
//
// FIX for Vulnerability 2 (auth middleware crash):
//   The original code had no try/catch around jwt.verify.
//   jwt.verify throws JsonWebTokenError for invalid tokens and
//   TokenExpiredError for expired ones. Without try/catch both propagate
//   as unhandled exceptions — crashing the process or returning a 500
//   with a full internal stack trace.
//
//   Fix: wrap in try/catch, return 401 on any jwt error.
//
// { algorithms: ['HS256'] } prevents the algorithm confusion attack
//   where an attacker sets the JWT header to "alg: none" and removes
//   the signature. Some libraries accept "none" unless explicitly restricted.
function auth(req, res, next) {
    const token =
        req.headers['authorization']?.split(' ')[1] ||
        req.headers['x-token'];

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

// requireRole — authorization factory.
// requireRole('admin') → only admins pass through.
// requireRole('admin', 'manager') → either role passes.
// Must be placed after auth() in the middleware chain.
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
        }
        next();
    };
}

module.exports = { auth, requireRole };