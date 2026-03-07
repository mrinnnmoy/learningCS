// Factory function — returns middleware that validates required fields
// Usage: validateBody(['name', 'email'])
function validateBody(requiredFields) {
    return (req, res, next) => {
        const missing = requiredFields.filter(field => {
            const val = req.body[field];
            return val === undefined || val === null || val === '';
        });

        if (missing.length > 0) {
            return res.status(400).json({
                status: 'fail',
                statusCode: 400,
                message: `Missing required fields: ${missing.join(', ')}`,
            });
        }
        next();
    };
}
module.exports = validateBody;