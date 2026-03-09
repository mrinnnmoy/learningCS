// In-memory idempotency store — use Redis in production
const store = new Map();

module.exports = function idempotency(req, res, next) {
    if (req.method !== 'POST') return next();

    const key = req.headers['idempotency-key'];
    if (!key) return next(); // optional — skip if not provided

    // Duplicate request — return the stored response
    if (store.has(key)) {
        const cached = store.get(key);
        console.log(`[IDEMPOTENCY] Cache hit for key: ${key}`);
        return res.status(cached.statusCode).json(cached.body);
    }

    // Intercept res.json to cache the first response
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        store.set(key, { statusCode: res.statusCode, body });
        // Auto-expire after 24 hours
        setTimeout(() => store.delete(key), 24 * 60 * 60 * 1000);
        return originalJson(body);
    };

    next();
};