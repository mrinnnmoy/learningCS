// Factory — returns middleware that validates req.body against rules
// Rules: { fieldName: { required, minLength, isEmail, isNumber, min } }
module.exports = (rules) => (req, res, next) => {
    const details = [];

    for (const [field, validators] of Object.entries(rules)) {
        const val = req.body[field];

        if (validators.required && (val === undefined || val === null || val === '')) {
            details.push({ field, message: `${field} is required` });
            continue; // skip further checks if field is missing
        }
        if (val && validators.minLength && val.length < validators.minLength)
            details.push({ field, message: `${field} must be at least ${validators.minLength} characters` });
        if (val && validators.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
            details.push({ field, message: `${field} must be a valid email address` });
        if (val !== undefined && validators.isNumber && isNaN(Number(val)))
            details.push({ field, message: `${field} must be a number` });
        if (val !== undefined && validators.min !== undefined && Number(val) < validators.min)
            details.push({ field, message: `${field} must be at least ${validators.min}` });
    }

    if (details.length > 0) {
        return res.status(400).json({
            status: 'fail',
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,           // ← field-level errors
        });
    }
    next();
};