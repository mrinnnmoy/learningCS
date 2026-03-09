module.exports = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        status: err.status || 'error',
        statusCode,
        code: err.code || 'INTERNAL_SERVER_ERROR',
        message: isDev || statusCode < 500 ? err.message : 'Something went wrong',
        ...(err.details && { details: err.details }),
        ...(isDev && statusCode >= 500 && { stack: err.stack }),
    });
};