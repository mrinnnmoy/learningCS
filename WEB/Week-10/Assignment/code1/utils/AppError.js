// Custom error class that carries an HTTP status code, machine-readable code,
// and an isOperational flag so the error handler knows how to respond.

class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);                    // sets this.message

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code || 'APP_ERROR';

        // 'fail'  → client error  (4xx) — user did something wrong
        // 'error' → server error  (5xx) — we did something wrong
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

        // true  → operational (expected runtime scenario) — safe to send message to client
        // false → programmer bug — hide message from client in production
        this.isOperational = true;

        // Remove AppError constructor frame from the stack trace
        // so the trace starts at the caller, not inside this class
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;