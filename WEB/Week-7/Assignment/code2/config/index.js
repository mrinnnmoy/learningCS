const path = require('path');
const dotenv = require('dotenv');

const environment = process.env.NODE_ENV || 'development';

const envFile = `.env.${environment}`;

dotenv.config({
    path: path.resolve(process.cwd(), envFile),
});

console.log(`Loading config for: ${environment}`);

// Required environment variables
const requiredEnvVars = [
    'PORT',
    'DB_URL',
    'LOG_LEVEL',
    'API_BASE_URL',
    'API_KEY',
];

// Fail-fast validation
for (const variable of requiredEnvVars) {
    if (!process.env[variable]) {
        console.error(
            `❌ Missing required environment variable: ${variable}`
        );
        process.exit(1);
    }
}

// Typed config object
const config = {
    env: environment,

    port: Number(process.env.PORT),

    db: {
        url: process.env.DB_URL,
    },

    logLevel: process.env.LOG_LEVEL || 'info',

    api: {
        baseUrl: process.env.API_BASE_URL,
        key: process.env.API_KEY,
    },
};

module.exports = config;