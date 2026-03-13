// Attaches a unique UUID to every incoming request.
// - Stored on req.requestId so route handlers and loggers can reference it
// - Sent back in the X-Request-ID response header so clients can trace calls

const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
    // Honour an ID already set by an upstream proxy, or generate a fresh one
    req.requestId = req.headers['x-request-id'] || randomUUID();
    res.set('X-Request-ID', req.requestId);
    next();
};