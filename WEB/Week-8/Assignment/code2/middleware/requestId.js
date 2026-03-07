const { randomUUID } = require('crypto');

function requestId(req, res, next) {
    req.requestId = randomUUID();         // attach unique ID to req
    res.set('X-Request-ID', req.requestId); // send it back in response header
    next();
}
module.exports = requestId;