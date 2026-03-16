// Custom error class — carries HTTP status code, machine-readable code,
// and isOperational flag so the error handler knows how to respond.

class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code || 'APP_ERROR';

        // 'fail'  → 4xx client error  | 'error' → 5xx server error
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        // true  → expected operational error — safe to expose message to client
        // false → programmer bug — hide details in production
        this.isOperational = true;

        // Remove AppError constructor from stack so trace starts at the caller
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;