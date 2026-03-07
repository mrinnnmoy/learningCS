function notFound(req, res, next) {
    res.status(404).json({
        status: 'fail',
        statusCode: 404,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}
module.exports = notFound;