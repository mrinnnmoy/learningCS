// Loads and validates all environment variables at startup.
// Throws immediately if JWT_SECRET is missing or too short.
// Every other file imports from here — no file reads process.env directly.

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 3000;

// Startup guard — refuse to run with a weak or missing JWT secret.
// A short or default secret can be brute-forced offline against any
// token your server has ever issued.
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error(
        'FATAL: JWT_SECRET must be set in .env and be at least 32 characters long.\n' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
}

module.exports = {
    JWT_SECRET,
    NODE_ENV,
    PORT,
    isDev: NODE_ENV === 'development',
    isProd: NODE_ENV === 'production',
};