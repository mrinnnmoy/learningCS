const app = require('./app');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 3003;
const server = app.listen(PORT, () => {
    logger.info('Server started', { port: PORT, env: process.env.NODE_ENV, pid: process.pid });
});

// Graceful shutdown — gives in-flight requests up to 30 s to finish
function gracefulShutdown(signal, exitCode = 0) {
    logger.info(`${signal} received — beginning graceful shutdown`);
    server.close(() => {
        logger.info('All connections closed', { exitCode });
        process.exit(exitCode);
    });
    // Force exit if server doesn't close in time
    setTimeout(() => {
        logger.error('Graceful shutdown timed out — forcing exit');
        process.exit(1);
    }, 30_000).unref();
}

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION — shutting down immediately', {
        name: err.name, message: err.message, stack: err.stack,
    });
    process.exit(1); // exit immediately — state is unknown after uncaughtException
});

process.on('unhandledRejection', (reason) => {
    logger.error('UNHANDLED REJECTION — shutting down', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });
    gracefulShutdown('unhandledRejection', 1);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0)); // Docker / Kubernetes stop
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0)); // Ctrl+C