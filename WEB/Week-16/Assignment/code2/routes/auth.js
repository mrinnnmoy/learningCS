const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../lib/redis');
const users = require('../data/users');
const { authenticate } = require('../middleware/authenticate');

const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// Helper: issue a new token pair and store refresh token in Redis
const issueTokens = async (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m', algorithm: 'HS256' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');

    // Store refresh token → userId mapping
    await redis.set(`refresh:${refreshToken}`, userId.toString(), 'EX', REFRESH_TTL);

    // Track all tokens for this user (for logout-all)
    await redis.sadd(`refresh:tokens:user:${userId}`, refreshToken);
    await redis.expire(`refresh:tokens:user:${userId}`, REFRESH_TTL);

    return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
        if (users.findByEmail(email)) return res.status(409).json({ message: 'Email already in use' });

        const hash = await bcrypt.hash(password, 12);
        const user = users.createUser(email, hash);
        res.status(201).json({ message: 'Registered', email: user.email });
    } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = users.findByEmail(email);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = await issueTokens(user.id);
        res.json(tokens);
    } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });

        const userId = await redis.get(`refresh:${refreshToken}`);
        if (!userId) return res.status(401).json({ message: 'Invalid or expired refresh token' });

        // Rotate: delete old token
        await redis.del(`refresh:${refreshToken}`);
        await redis.srem(`refresh:tokens:user:${userId}`, refreshToken);

        // Issue new pair
        const tokens = await issueTokens(parseInt(userId));
        res.json(tokens);
    } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });

        const userId = await redis.get(`refresh:${refreshToken}`);
        if (userId) {
            await redis.del(`refresh:${refreshToken}`);
            await redis.srem(`refresh:tokens:user:${userId}`, refreshToken);
        }

        res.json({ message: 'Logged out' });
    } catch (err) { next(err); }
});

// POST /api/auth/logout-all — requires valid access token
router.post('/logout-all', authenticate, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const setKey = `refresh:tokens:user:${userId}`;
        const allTokens = await redis.smembers(setKey);

        if (allTokens.length > 0) {
            // Delete all individual refresh token keys
            await redis.del(...allTokens.map(t => `refresh:${t}`));
        }
        // Delete the set itself
        await redis.del(setKey);

        res.json({ message: `Logged out from all ${allTokens.length} sessions` });
    } catch (err) { next(err); }
});

// GET /api/me
router.get('/me', authenticate, (req, res) => {
    const user = users.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email });
});

module.exports = router;