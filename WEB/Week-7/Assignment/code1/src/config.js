require('dotenv').config();

const config = {
    appName: process.env.APP_NAME,
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
};

// Bonus validation
if (!config.appName) {
    console.error('❌ ERROR: APP_NAME is missing in the .env file');
    process.exit(1);
}

module.exports = config;