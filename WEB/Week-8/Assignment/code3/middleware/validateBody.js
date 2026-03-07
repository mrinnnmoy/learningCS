module.exports = (fields) => (req, res, next) => {
    const missing = fields.filter(f => !req.body[f] && req.body[f] !== 0);
    if (missing.length) {
        return res.status(400).json({
            status: 'fail', statusCode: 400,
            message: `Missing required fields: ${missing.join(', ')}`,
        });
    }
    next();
};