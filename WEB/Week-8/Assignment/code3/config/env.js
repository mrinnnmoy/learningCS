require('dotenv').config();

function requireEnv(key) {
    const val = process.env[key];
    if (!val) { console.error(`[CONFIG] Missing required env var: ${key}`); process.exit(1); }
    return val;
}

module.exports = {
    port: Number(process.env.PORT) || 3003,
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',').map(s => s.trim()),
    logLevel: process.env.LOG_LEVEL || 'dev',
};