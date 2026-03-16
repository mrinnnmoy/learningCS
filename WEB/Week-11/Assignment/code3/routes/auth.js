// Full authentication lifecycle for A3:
//   POST /auth/register        — Zod validation, bcrypt hash, issue both tokens, structured logs
//   POST /auth/login           — timing-safe, enumeration-safe, structured logs
//   POST /auth/refresh         — verify refreshToken, issue new accessToken
//   POST /auth/logout          — revoke refreshToken from store
//   GET  /auth/me              — return current user [protected]
//   POST /auth/change-password — verify old password, hash new, revoke ALL user tokens

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/token');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../config/logger');
const {
    registerSchema,
    loginSchema,
    refreshSchema,
    changePasswordSchema,
} = require('../schemas/auth');
const env = require('../config/env');

const SALT_ROUNDS = env.BCRYPT_ROUNDS;

// ── In-memory stores (replaced by DB in Week-13) ──────────────────────────────
const users = [];
let nextId = 1;
const refreshTokenStore = new Map(); // Map<refreshToken string, userId>

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeUser(user) {
    // NEVER return passwordHash in any response
    const { passwordHash, ...safe } = user;
    return safe;
}

function maskEmail(email) {
    // Mask email before logging — PII protection
    // alice@example.com → a***@example.com
    if (!email) return null;
    const [local, domain] = email.split('@');
    return local[0] + '***@' + domain;
}

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register',
    authLimiter,                   // 10 attempts / 15 min per IP
    validate(registerSchema),      // Zod validates + transforms req.body
    asyncHandler(async (req, res, next) => {
        const { name, email, password, role } = req.body; // already cleaned by Zod

        logger.debug('auth.register.attempt', {
            requestId: req.requestId,
            maskedEmail: maskEmail(email),
            name,
            // NEVER log password
        });

        // Duplicate email check (Zod already lowercased + trimmed email)
        if (users.find(u => u.email === email)) {
            logger.warn('auth.register.duplicate_email', {
                requestId: req.requestId,
                maskedEmail: maskEmail(email),
            });
            return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
        }

        // Hash password — NEVER store plain text
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = {
            id: nextId++,
            name,
            email,        // already normalised by Zod
            passwordHash,
            role,
            createdAt: new Date().toISOString(),
            lastLoginAt: null,
        };
        users.push(user);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokenStore.set(refreshToken, user.id);

        logger.info('auth.register.success', {
            requestId: req.requestId,
            userId: user.id,
            maskedEmail: maskEmail(user.email),
            role: user.role,
            // password and passwordHash NEVER logged
        });

        res.status(201).json({
            status: 'success',
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // seconds
            user: sanitizeUser(user),
        });
    })
);

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login',
    authLimiter,
    validate(loginSchema),
    asyncHandler(async (req, res, next) => {
        const { email, password } = req.body;
        const ip = req.ip;

        logger.debug('auth.login.attempt', {
            requestId: req.requestId,
            maskedEmail: maskEmail(email),
            ip,
        });

        const user = users.find(u => u.email === email);

        // ── Timing-attack prevention ───────────────────────────────────────────
        // Always call bcrypt.compare — even when user not found.
        // If we returned early on "user not found", an attacker could detect
        // which emails are registered by measuring the shorter response time.
        const DUMMY = '$2b$10$dummyhashtopreventtimingattacksXXXXXXXXXXXXXXXXXXXXX';
        const isMatch = await bcrypt.compare(password, user ? user.passwordHash : DUMMY);

        // ── User enumeration prevention ────────────────────────────────────────
        // Return the exact same error message whether:
        //   (a) the email is not registered, or
        //   (b) the password is wrong
        // This prevents an attacker from scanning for valid email addresses.
        if (!user || !isMatch) {
            logger.warn('auth.login.failed', {
                requestId: req.requestId,
                maskedEmail: maskEmail(email),
                ip,
                // Log the real reason internally for monitoring, but never expose it to client
                reason: !user ? 'email_not_found' : 'wrong_password',
            });
            return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
        }

        // Update last login timestamp
        const idx = users.findIndex(u => u.id === user.id);
        users[idx].lastLoginAt = new Date().toISOString();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        refreshTokenStore.set(refreshToken, user.id);

        logger.info('auth.login.success', {
            requestId: req.requestId,
            userId: user.id,
            maskedEmail: maskEmail(user.email),
            ip,
        });

        res.json({
            status: 'success',
            accessToken,
            refreshToken,
            expiresIn: 15 * 60,
            user: sanitizeUser(user),
        });
    })
);

// ── POST /auth/refresh ────────────────────────────────────────────────────────
router.post('/refresh',
    validate(refreshSchema),
    asyncHandler(async (req, res, next) => {
        const { refreshToken } = req.body;

        // Check it exists in our store (was issued by us and not yet logged out)
        if (!refreshTokenStore.has(refreshToken)) {
            return next(new AppError(
                'Invalid or revoked refresh token. Please log in again.',
                401,
                'INVALID_REFRESH_TOKEN'
            ));
        }

        try {
            const decoded = verifyRefreshToken(refreshToken);
            const user = users.find(u => u.id === decoded.sub);

            if (!user) {
                refreshTokenStore.delete(refreshToken);
                return next(new AppError('User not found', 401, 'USER_NOT_FOUND'));
            }

            const newAccessToken = generateAccessToken(user);

            logger.debug('auth.token.refreshed', {
                requestId: req.requestId,
                userId: user.id,
            });

            res.json({
                status: 'success',
                accessToken: newAccessToken,
                expiresIn: 15 * 60,
            });
        } catch (err) {
            // refreshToken is expired or tampered — remove and force re-login
            refreshTokenStore.delete(refreshToken);
            return next(new AppError(
                'Refresh token expired. Please log in again.',
                401,
                'REFRESH_TOKEN_EXPIRED'
            ));
        }
    })
);

// ── POST /auth/logout ─────────────────────────────────────────────────────────
router.post('/logout',
    authenticate,
    asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        // Delete the refresh token so it can no longer be used to get new access tokens.
        // The current access token will naturally expire (15 min max).
        if (refreshToken) {
            refreshTokenStore.delete(refreshToken);
        }

        logger.info('auth.logout', {
            requestId: req.requestId,
            userId: req.user.sub,
        });

        res.json({ status: 'success', message: 'Logged out successfully' });
    })
);

// ── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me',
    authenticate,
    asyncHandler(async (req, res, next) => {
        const user = users.find(u => u.id === req.user.sub);
        if (!user) return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));

        res.json({ status: 'success', user: sanitizeUser(user) });
    })
);

// ── POST /auth/change-password ────────────────────────────────────────────────
// Verifies current password, hashes new password, and revokes ALL refresh
// tokens for this user — forcing re-login on every device.
router.post('/change-password',
    authenticate,
    validate(changePasswordSchema),
    asyncHandler(async (req, res, next) => {
        const { currentPassword, newPassword } = req.body;

        const idx = users.findIndex(u => u.id === req.user.sub);
        if (idx === -1) return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));

        // Verify the current password before allowing any change
        const isMatch = await bcrypt.compare(currentPassword, users[idx].passwordHash);
        if (!isMatch) {
            logger.warn('auth.change_password.wrong_current', {
                requestId: req.requestId,
                userId: req.user.sub,
            });
            return next(new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD'));
        }

        // Hash the new password
        users[idx].passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        users[idx].updatedAt = new Date().toISOString();

        // Revoke ALL refresh tokens for this user (force re-login on every device)
        for (const [token, userId] of refreshTokenStore.entries()) {
            if (userId === req.user.sub) refreshTokenStore.delete(token);
        }

        logger.info('auth.password_changed', {
            requestId: req.requestId,
            userId: req.user.sub,
        });

        res.json({
            status: 'success',
            message: 'Password changed successfully. Please log in again on all devices.',
        });
    })
);

module.exports = { router, users, refreshTokenStore };