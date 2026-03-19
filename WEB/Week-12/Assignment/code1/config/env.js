// Loads and validates all environment variables at startup.
// Every other file imports from here — no file reads process.env directly.

require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 3000;

module.exports = {
    NODE_ENV,
    PORT,
    isDev: NODE_ENV === 'development',
    isProd: NODE_ENV === 'production',
};
