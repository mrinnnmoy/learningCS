// Reusable Zod validation middleware factory.
// Replaces req.body with Zod-cleaned, coerced, and transformed data on success.

const AppError = require('../utils/AppError');

module.exports = function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const details = result.error.issues.map(i => ({
                field: i.path.join('.') || 'body',
                message: i.message,
            }));
            const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
            err.details = details;
            return next(err);
        }
        req.body = result.data; // cleaned + coerced data
        next();
    };
};