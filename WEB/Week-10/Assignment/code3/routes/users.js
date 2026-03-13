const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { logger } = require('../config/logger');

// ── PII and security helpers ──────────────────────────────────────────────────
function maskEmail(email) {
    if (!email) return null;
    const [local, domain] = email.split('@');
    return local[0] + '***@' + domain;
}

function sanitizeUser(user) {
    // NEVER return password hash or internal notes to API clients
    const { password, internalNotes, ...safe } = user;
    return safe;
}

// ── In-memory store ───────────────────────────────────────────────────────────
let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin', password: 'hash_abc', internalNotes: 'founder' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user', password: 'hash_def', internalNotes: '' },
    { id: 3, name: 'Carol', email: 'carol@example.com', role: 'editor', password: 'hash_ghi', internalNotes: 'vip user' },
];
let nextId = 4;

// ── Field-level validator ─────────────────────────────────────────────────────
function validateUser(body, requireAll = true) {
    const details = [];

    if (requireAll || body.name !== undefined) {
        if (!body.name || body.name.trim() === '')
            details.push({ field: 'name', message: 'name is required' });
        else if (body.name.trim().length < 2)
            details.push({ field: 'name', message: 'name must be at least 2 characters' });
    }

    if (requireAll || body.email !== undefined) {
        if (!body.email)
            details.push({ field: 'email', message: 'email is required' });
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
            details.push({ field: 'email', message: 'must be a valid email address' });
    }

    if (requireAll || body.password !== undefined) {
        if (!body.password)
            details.push({ field: 'password', message: 'password is required' });
        else if (body.password.length < 8)
            details.push({ field: 'password', message: 'password must be at least 8 characters' });
    }

    if (body.role !== undefined && !['admin', 'user', 'editor'].includes(body.role))
        details.push({ field: 'role', message: 'role must be one of: admin, user, editor' });

    return details;
}

// GET /users
router.get('/', asyncHandler(async (req, res) => {
    const { role } = req.query;
    logger.debug('Fetching users list', { requestId: req.requestId, filter: { role } });

    let result = users.map(sanitizeUser);
    if (role) result = result.filter(u => u.role === role);

    logger.info('users.list', { requestId: req.requestId, count: result.length });
    res.json({ status: 'success', count: result.length, data: result });
}));

// GET /users/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        logger.warn('Invalid user ID', { requestId: req.requestId, rawId: req.params.id });
        throw new AppError('User ID must be a positive number', 400, 'INVALID_ID');
    }

    const user = users.find(u => u.id === id);
    if (!user) {
        logger.warn('users.not_found', { requestId: req.requestId, userId: id });
        return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
    }

    logger.debug('User fetched', { requestId: req.requestId, userId: id });
    res.json({ status: 'success', data: sanitizeUser(user) });
}));

// POST /users
router.post('/', asyncHandler(async (req, res, next) => {
    logger.debug('User creation attempt', {
        requestId: req.requestId,
        maskedEmail: req.body.email ? maskEmail(req.body.email) : undefined,
        name: req.body.name,
        // NEVER log req.body.password
    });

    const errors = validateUser(req.body, true);
    if (errors.length > 0) {
        logger.warn('users.create.validation_failed', { requestId: req.requestId, fields: errors.map(e => e.field) });
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { name, email, password, role } = req.body;

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
        logger.warn('users.create.duplicate_email', { requestId: req.requestId, maskedEmail: maskEmail(email) });
        return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
    }

    const user = {
        id: nextId++,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role || 'user',
        password: `hashed_${password}`,   // fake hash — real hashing in Week-11
        internalNotes: '',
        createdAt: new Date().toISOString(),
    };
    users.push(user);

    logger.info('user.created', {
        requestId: req.requestId,
        userId: user.id,
        maskedEmail: maskEmail(user.email),
        role: user.role,
        // password is NEVER logged
    });

    res.status(201).location(`/users/${user.id}`).json({ status: 'success', data: sanitizeUser(user) });
}));

// PATCH /users/:id
router.patch('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
        logger.warn('users.update.not_found', { requestId: req.requestId, userId: id });
        return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
    }

    const errors = validateUser(req.body, false);
    if (errors.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { name, email, role } = req.body;
    if (email) {
        const conflict = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id);
        if (conflict) {
            logger.warn('users.update.email_conflict', { requestId: req.requestId, userId: id, maskedEmail: maskEmail(email) });
            return next(new AppError('Email already in use by another account', 409, 'EMAIL_CONFLICT'));
        }
    }

    users[idx] = {
        ...users[idx],
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(role !== undefined && { role }),
        updatedAt: new Date().toISOString(),
    };

    logger.info('user.updated', { requestId: req.requestId, userId: id, fields: Object.keys(req.body) });
    res.json({ status: 'success', data: sanitizeUser(users[idx]) });
}));

// DELETE /users/:id
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
        logger.warn('users.delete.not_found', { requestId: req.requestId, userId: id });
        return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
    }

    users.splice(idx, 1);
    logger.info('user.deleted', { requestId: req.requestId, userId: id });
    res.status(204).end();
}));

// TypeError — non-operational programmer error
router.get('/crash/programmer', asyncHandler(async (req, res) => {
    const obj = null;
    return obj.nonExistentProperty.doSomething(); // TypeError
}));

// AppError — operational — client always sees the message
router.get('/crash/operational', asyncHandler(async (req, res) => {
    throw new AppError(
        'Intentional operational error — you will always see this message',
        503,
        'INTENTIONAL_ERROR'
    );
}));

module.exports = router;