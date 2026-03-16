const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');
const { users } = require('./auth');

function sanitizeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}

// GET /users — admin=all, others=own
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = req.user.role === 'admin'
        ? users.map(sanitizeUser)
        : [sanitizeUser(users.find(u => u.id === req.user.sub))].filter(Boolean);
    res.json({ status: 'success', count: result.length, data: result });
}));

// GET /users/:id — admin or own
router.get('/:id', authenticate, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);
    if (!user) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
    if (req.user.role !== 'admin' && req.user.sub !== id)
        return next(new AppError('You can only view your own profile', 403, 'FORBIDDEN'));
    res.json({ status: 'success', data: sanitizeUser(user) });
}));

// PATCH /users/:id — admin or own; non-admin cannot change role
router.patch('/:id', authenticate, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
    if (req.user.role !== 'admin' && req.user.sub !== id)
        return next(new AppError('You can only edit your own profile', 403, 'FORBIDDEN'));
    if (req.body.role && req.user.role !== 'admin')
        return next(new AppError('Only admins can change roles', 403, 'FORBIDDEN'));

    const { name, email } = req.body;
    users[idx] = {
        ...users[idx],
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(req.body.role !== undefined && req.user.role === 'admin' && { role: req.body.role }),
        updatedAt: new Date().toISOString(),
    };
    res.json({ status: 'success', data: sanitizeUser(users[idx]) });
}));

// DELETE /users/:id — admin only
router.delete('/:id',
    authenticate,
    authorizeRole('admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
        users.splice(idx, 1);
        res.status(204).end();
    })
);

// POST /users/:id/promote — admin only
router.post('/:id/promote',
    authenticate,
    authorizeRole('admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const idx = users.findIndex(u => u.id === id);
        if (idx === -1) return next(new AppError(`User ${id} not found`, 404, 'USER_NOT_FOUND'));
        if (users[idx].role === 'admin')
            return next(new AppError('Cannot change role of an admin', 409, 'CANNOT_PROMOTE_ADMIN'));
        users[idx].role = 'editor';
        res.json({
            status: 'success',
            message: `${users[idx].name} promoted to editor`,
            data: sanitizeUser(users[idx]),
        });
    })
);

module.exports = router;