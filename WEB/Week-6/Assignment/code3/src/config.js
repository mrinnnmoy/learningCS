// Load environment variables
require("dotenv").config();

// Export configuration
module.exports = {
    appName: process.env.APP_NAME,
    port: process.env.APP_PORT,
    mode: process.env.MODE
};