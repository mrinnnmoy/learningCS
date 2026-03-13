require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const { logger, morganStream } = require('./config/logger');
const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');

const app = express();

app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));

app.get('/health', (req, res) => {
    res.json({
        status: 'ok', uptime: Number(process.uptime().toFixed(2)),
        env: process.env.NODE_ENV, timestamp: new Date().toISOString(),
        requestId: req.requestId
    });
});

app.get('/', (req, res) => {
    res.json({
        name: 'Users API — Week 10 A3', requestId: req.requestId,
        features: ['PII masking', 'field sanitization', 'error normalization',
            'graceful shutdown', 'structured logging']
    });
});

app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;