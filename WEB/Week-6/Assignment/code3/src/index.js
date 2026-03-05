// Import config and logger
const config = require("./config");
const log = require("./logger");

// Print app configuration
console.log("App Name:", config.appName);
console.log("Port:", config.port);
console.log("Mode:", config.mode);

console.log("");

// Logger example
log(`Server running on port ${config.port}`);