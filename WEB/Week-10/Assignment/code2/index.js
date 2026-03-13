require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const { logger, morganStream } = require('./config/logger');
const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Morgan writes through Winston so all logs go to the same output
app.use(morgan('combined', { stream: morganStream }));

app.get('/', (req, res) => {
    res.json({ name: 'Orders API — Week 10 A2', requestId: req.requestId });
});
app.use('/orders', ordersRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception — shutting down', { name: err.name, message: err.message, stack: err.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection — shutting down', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
    });
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM — graceful shutdown');
    server.close(() => { logger.info('Server closed'); process.exit(0); });
});