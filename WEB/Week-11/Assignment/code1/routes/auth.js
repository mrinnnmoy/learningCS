const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateAccessToken } = require('../utils/token');
const authenticate = require('../middleware/authenticate');

const SALT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

// In-memory user store (replaced by MongoDB in Week-13)
const users = [];
let nextId = 1;

function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register', asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // 1. Validate
    const details = [];
    if (!name || name.trim() === '')
        details.push({ field: 'name', message: 'name is required' });
    if (!email)
        details.push({ field: 'email', message: 'email is required' });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        details.push({ field: 'email', message: 'must be a valid email' });
    if (!password)
        details.push({ field: 'password', message: 'password is required' });
    else if (password.length < 8)
        details.push({ field: 'password', message: 'must be at least 8 characters' });

    if (details.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = details;
        return next(err);
    }

    // 2. Duplicate email check (case-insensitive)
    if (users.find(u => u.email === email.toLowerCase().trim())) {
        return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
    }

    // 3. Hash password — NEVER store plain text
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Save user
    const user = {
        id: nextId++,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString(),
    };
    users.push(user);

    // 5. Issue token
    const token = generateAccessToken(user);

    res.status(201).json({ status: 'success', token, user: sanitizeUser(user) });
}));

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login', asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError('email and password are required', 400, 'VALIDATION_ERROR'));

    // Find user
    const user = users.find(u => u.email === email.toLowerCase().trim());

    // Timing-attack prevention: always run bcrypt.compare even if user not found.
    // If we returned early, an attacker could detect valid emails by measuring response time.
    const DUMMY = '$2b$10$dummyhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXX';
    const isMatch = await bcrypt.compare(password, user ? user.passwordHash : DUMMY);

    // User enumeration prevention: same generic message for wrong email OR wrong password.
    if (!user || !isMatch) {
        return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const token = generateAccessToken(user);

    res.json({ status: 'success', token, user: sanitizeUser(user) });
}));

// ── GET /auth/me — protected ──────────────────────────────────────────────────
router.get('/me', authenticate, asyncHandler(async (req, res, next) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    res.json({ status: 'success', user: sanitizeUser(user) });
}));

module.exports = { router, users };