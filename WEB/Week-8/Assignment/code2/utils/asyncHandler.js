// Wraps async route handlers — forwards any thrown error to next(err)
// so you never need try/catch in every route
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
module.exports = asyncHandler;