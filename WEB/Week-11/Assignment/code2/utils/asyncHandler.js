// Wraps an async route handler so any thrown error or rejected promise
// is automatically forwarded to Express next(err).
// Eliminates the need for try/catch in every route.

module.exports = function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};