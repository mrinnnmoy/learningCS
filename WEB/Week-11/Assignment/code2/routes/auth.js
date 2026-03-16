const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
    generateAccessToken, generateRefreshToken, verifyRefreshToken,
} = require('../utils/token');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema, refreshSchema } = require('../schemas/auth');

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

const users = [];
let nextId = 1;
const refreshTokenStore = new Map(); // Map<refreshToken, userId>

function sanitizeUser(user) { const { passwordHash, ...s } = user; return s; }

// POST /auth/register
router.post('/register', authLimiter, validate(registerSchema),
    asyncHandler(async (req, res, next) => {
        const { name, email, password, role } = req.body;
        if (users.find(u => u.email === email))
            return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = { id: nextId++, name, email, passwordHash, role, createdAt: new Date().toISOString() };
        users.push(user);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokenStore.set(refreshToken, user.id);

        res.status(201).json({ status: 'success', accessToken, refreshToken, expiresIn: 900, user: sanitizeUser(user) });
    })
);

// POST /auth/login
router.post('/login', authLimiter, validate(loginSchema),
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        const DUMMY = '$2b$10$dummyhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXX';
        const isMatch = await bcrypt.compare(password, user ? user.passwordHash : DUMMY);
        if (!user || !isMatch)
            return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokenStore.set(refreshToken, user.id);

        res.json({ status: 'success', accessToken, refreshToken, expiresIn: 900, user: sanitizeUser(user) });
    })
);

// POST /auth/refresh
router.post('/refresh', validate(refreshSchema),
    asyncHandler(async (req, res, next) => {
        const { refreshToken } = req.body;
        if (!refreshTokenStore.has(refreshToken))
            return next(new AppError('Invalid or expired refresh token. Please log in again.', 401, 'INVALID_REFRESH_TOKEN'));

        try {
            const decoded = verifyRefreshToken(refreshToken);
            const user = users.find(u => u.id === decoded.sub);
            if (!user) { refreshTokenStore.delete(refreshToken); return next(new AppError('User not found', 401, 'USER_NOT_FOUND')); }

            res.json({ status: 'success', accessToken: generateAccessToken(user), expiresIn: 900 });
        } catch {
            refreshTokenStore.delete(refreshToken);
            return next(new AppError('Refresh token expired. Please log in again.', 401, 'REFRESH_TOKEN_EXPIRED'));
        }
    })
);

// POST /auth/logout
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) refreshTokenStore.delete(refreshToken);
    res.json({ status: 'success', message: 'Logged out successfully' });
}));

// GET /auth/me
router.get('/me', authenticate, asyncHandler(async (req, res, next) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    res.json({ status: 'success', user: sanitizeUser(user) });
}));

module.exports = { router, users, refreshTokenStore };