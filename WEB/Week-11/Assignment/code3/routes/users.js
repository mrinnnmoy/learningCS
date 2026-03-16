// Users resource — full production-style with:
//   • Role-based access control (user / editor / admin)
//   • Resource ownership enforcement on every mutating route
//   • Sensitive-field sanitization (passwordHash stripped from every response)
//   • Structured logging with maskEmail (PII protection)
//   • Mass-assignment prevention (only named fields are allowed to update)
//   • Admin self-delete prevention

const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const { logger } = require('../config/logger');

// Share the same in-memory users array that auth routes write to
const { users } = require('./auth');

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}

function maskEmail(email) {
    if (!email) return null;
    const [local, domain] = email.split('@');
    return local[0] + '***@' + domain;
}

// ── GET /users ────────────────────────────────────────────────────────────────
// admin → all users | everyone else → their own record only
router.get('/', authenticate, asyncHandler(async (req, res) => {
    logger.debug('users.list.request', {
        requestId: req.requestId,
        requesterRole: req.user.role,
        requesterId: req.user.sub,
    });

    const result = req.user.role === 'admin'
        ? users.map(sanitizeUser)
        : [sanitizeUser(users.find(u => u.id === req.user.sub))].filter(Boolean);

    logger.info('users.list', {
        requestId: req.requestId,
        count: result.length,
        role: req.user.role,
    });

    res.json({ status: 'success', count: result.length, data: result });
}));

// ── GET /users/:id ────────────────────────────────────────────────────────────
// admin → any user | everyone else → own profile
router.get('/:id', authenticate, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));

    // Ownership check
    if (req.user.role !== 'admin' && req.user.sub !== id) {
        logger.warn('users.get.forbidden', {
            requestId: req.requestId,
            requesterId: req.user.sub,
            targetId: id,
        });
        return next(new AppError('You can only view your own profile', 403, 'FORBIDDEN'));
    }

    logger.debug('users.get', { requestId: req.requestId, userId: id });
    res.json({ status: 'success', data: sanitizeUser(user) });
}));

// ── PATCH /users/:id ──────────────────────────────────────────────────────────
// admin → update any user (including role)
// own   → update own name/email only (cannot self-promote role)
router.patch('/:id', authenticate, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = users.findIndex(u => u.id === id);

    if (idx === -1) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));

    // Ownership check
    if (req.user.role !== 'admin' && req.user.sub !== id) {
        return next(new AppError('You can only update your own profile', 403, 'FORBIDDEN'));
    }

    // Mass-assignment prevention — only explicitly named fields are allowed
    const { name, email, role } = req.body;

    // Non-admins cannot change role (prevents privilege escalation)
    if (role !== undefined && req.user.role !== 'admin') {
        return next(new AppError('Only admins can change user roles', 403, 'FORBIDDEN'));
    }

    // Email uniqueness check — ensure new email is not taken by another user
    if (email) {
        const conflict = users.find(
            u => u.email === email.toLowerCase().trim() && u.id !== id
        );
        if (conflict) {
            logger.warn('users.update.email_conflict', {
                requestId: req.requestId,
                userId: id,
                maskedEmail: maskEmail(email),
            });
            return next(new AppError('Email already in use by another account', 409, 'EMAIL_CONFLICT'));
        }
    }

    users[idx] = {
        ...users[idx],
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(role !== undefined && req.user.role === 'admin' && { role }),
        updatedAt: new Date().toISOString(),
    };

    logger.info('user.updated', {
        requestId: req.requestId,
        userId: id,
        updatedBy: req.user.sub,
        fields: Object.keys(req.body),
    });

    res.json({ status: 'success', data: sanitizeUser(users[idx]) });
}));

// ── DELETE /users/:id — admin only ───────────────────────────────────────────
router.delete('/:id',
    authenticate,
    authorizeRole('admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const idx = users.findIndex(u => u.id === id);

        if (idx === -1) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));

        // Prevent admins from accidentally deleting their own account
        if (req.user.sub === id) {
            return next(new AppError(
                'You cannot delete your own account',
                409,
                'CANNOT_DELETE_SELF'
            ));
        }

        const deletedUser = users[idx];
        users.splice(idx, 1);

        logger.info('user.deleted', {
            requestId: req.requestId,
            deletedId: id,
            deletedBy: req.user.sub,
            maskedEmail: maskEmail(deletedUser.email),
        });

        res.status(204).end();
    })
);

// ── POST /users/:id/promote — admin only ──────────────────────────────────────
// Promotes a user to editor or admin role.
// Body: { role: 'editor' | 'admin' }
router.post('/:id/promote',
    authenticate,
    authorizeRole('admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const { role: newRole } = req.body;
        const idx = users.findIndex(u => u.id === id);

        if (idx === -1)
            return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));

        // Only allow promotion to editor or admin (not demotion to 'user' via this route)
        if (!['editor', 'admin'].includes(newRole)) {
            return next(new AppError(
                'Can only promote to editor or admin',
                400,
                'INVALID_ROLE'
            ));
        }

        // 409 if they already have the target role
        if (users[idx].role === newRole) {
            return next(new AppError(
                `User is already ${newRole}`,
                409,
                'ALREADY_ROLE'
            ));
        }

        const prevRole = users[idx].role;
        users[idx].role = newRole;
        users[idx].updatedAt = new Date().toISOString();

        logger.info('user.role_changed', {
            requestId: req.requestId,
            userId: id,
            prevRole,
            newRole,
            changedBy: req.user.sub,
        });

        res.json({
            status: 'success',
            message: `${users[idx].name} promoted from ${prevRole} to ${newRole}`,
            data: sanitizeUser(users[idx]),
        });
    })
);

module.exports = router;