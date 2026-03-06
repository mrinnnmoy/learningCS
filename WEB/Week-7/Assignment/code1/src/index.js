const config = require('./config');

console.log('====================================');
console.log(`App: ${config.appName}`);
console.log(`Port: ${config.port}`);
console.log(`Environment: ${config.nodeEnv}`);
console.log(`Debug Mode: ${config.debug}`);
console.log('====================================');