// Reusable Zod validation middleware factory.
// On success: replaces req.body with Zod-cleaned, coerced, transformed data.
// On failure: forwards a 400 AppError with field-level details[] to errorHandler.

const AppError = require('../utils/AppError');

module.exports = function validate(schema) {
    return function (req, res, next) {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const details = result.error.issues.map(issue => ({
                field: issue.path.join('.') || 'body',
                message: issue.message,
            }));
            const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
            err.details = details;
            return next(err);
        }

        // Replace req.body with the validated, coerced, and transformed data.
        // e.g. email is already trimmed and lowercased, role has its default applied.
        req.body = result.data;
        next();
    };
};