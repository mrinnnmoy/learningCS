const cors = require('cors');
const { allowedOrigins } = require('../config/env');

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no Origin header (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin "${origin}" is not allowed`));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // cache preflight response for 24 hours
};

module.exports = cors(corsOptions);