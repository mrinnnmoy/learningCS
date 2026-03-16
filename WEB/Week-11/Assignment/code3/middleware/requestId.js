const { randomUUID } = require('crypto');
module.exports = function requestId(req, res, next) {
    req.requestId = req.headers['x-request-id'] || randomUUID();
    res.set('X-Request-ID', req.requestId);
    next();
};