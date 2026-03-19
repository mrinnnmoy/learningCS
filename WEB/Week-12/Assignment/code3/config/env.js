// Loads and validates all required environment variables at startup.
// If any check fails, process.exit(1) is called before the server ever starts.
// Every other file imports from here — nothing reads process.env directly.

require('dotenv').config();

const errors = [];

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push(
        'JWT_SECRET must be set and at least 32 characters.\n' +
        '  Generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
}

if (errors.length > 0) {
    console.error('\nFATAL: Invalid environment configuration:\n');
    errors.forEach(e => console.error(' •', e));
    console.error('\nFix the above in your .env file and restart.\n');
    process.exit(1);
}

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
    PORT: parseInt(process.env.PORT, 10) || 3000,
    NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:5173'],
    isDev: NODE_ENV === 'development',
    isProd: NODE_ENV === 'production',
};