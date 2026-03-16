const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const { logger, morganStream } = require('./config/logger');
const requestId = require('./middleware/requestId');
const { globalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { router: authRouter } = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.ALLOWED_ORIGINS.split(',').map(s => s.trim()), methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: true }));
app.use(requestId);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));
app.use('/api/', globalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', uptime: Number(process.uptime().toFixed(2)), env: env.NODE_ENV, timestamp: new Date().toISOString(), requestId: req.requestId }));
app.get('/', (req, res) => res.json({ name: 'Full Auth API — Week 11 A3', features: ['Zod env validation', 'bcrypt', 'JWT access+refresh', 'helmet+cors', 'Winston+PII masking', 'RBAC', 'change-password revokes all tokens', 'graceful shutdown'] }));

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;