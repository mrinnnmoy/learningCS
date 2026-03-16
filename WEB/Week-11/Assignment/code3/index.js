const app = require('./app');
const { logger } = require('./config/logger');
const env = require('./config/env');

const server = app.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT, env: env.NODE_ENV, pid: process.pid });
});

function gracefulShutdown(signal, exitCode = 0) {
    logger.info(`${signal} received — graceful shutdown`);
    server.close(() => { logger.info('Server closed', { exitCode }); process.exit(exitCode); });
    setTimeout(() => { logger.error('Shutdown timeout — forcing exit'); process.exit(1); }, 30_000).unref();
}

process.on('uncaughtException', (err) => { logger.error('UNCAUGHT EXCEPTION', { name: err.name, message: err.message, stack: err.stack }); process.exit(1); });
process.on('unhandledRejection', (reason) => { logger.error('UNHANDLED REJECTION', { reason: reason instanceof Error ? reason.message : String(reason) }); gracefulShutdown('unhandledRejection', 1); });
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0));
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0));