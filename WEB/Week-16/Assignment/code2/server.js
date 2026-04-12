require('dotenv').config();
const express = require('express');
const { createRateLimiter } = require('./middleware/rateLimit');
const authRoutes = require('./routes/auth');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET must be set and at least 32 characters');
    process.exit(1);
}

const app = express();
app.use(express.json());

const authLimiter = createRateLimiter({
    windowSeconds: 15 * 60,
    maxRequests: 10,
    keyPrefix: 'ratelimit:auth',
});

app.use('/api/auth', authLimiter, authRoutes);

app.get('/', (req, res) => res.json({ message: 'Week 16 — Assignment 2: Rate Limiting & Sessions' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));