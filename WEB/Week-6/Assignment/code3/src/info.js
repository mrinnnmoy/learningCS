const config = require("./config");

console.log("Node Version:", process.version);

console.log("App Name:", config.appName);

console.log("Environment:", config.mode);

console.log("Current Directory:", process.cwd());