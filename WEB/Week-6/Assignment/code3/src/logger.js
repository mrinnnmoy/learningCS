const config = require("./config");

// Logger function
function log(message) {
    console.log(`[${config.appName}] ${message}`);
}

module.exports = log;