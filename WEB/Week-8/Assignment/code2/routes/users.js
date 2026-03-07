const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validateBody = require('../middleware/validateBody');

let users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
];
let nextId = 3;

// GET /users  (?role=admin)
router.get('/', asyncHandler(async (req, res) => {
    const { role } = req.query;
    const result = role ? users.filter(u => u.role === role) : users;
    res.json({ status: 'success', count: result.length, data: result });
}));

// GET /users/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if (!user) return next(new AppError(`User ${req.params.id} not found`, 404));
    res.json({ status: 'success', data: user });
}));

// POST /users — validateBody middleware runs before the handler
router.post('/', validateBody(['name', 'email']), asyncHandler(async (req, res, next) => {
    const { name, email, role } = req.body;

    // Check for duplicate email — 409 Conflict
    const exists = users.find(u => u.email === email);
    if (exists) throw new AppError('Email already registered', 409);
    // Note: throw works here because asyncHandler wraps it in .catch(next)

    const user = { id: nextId++, name, email, role: role || 'user' };
    users.push(user);

    res.status(201)
        .location(`/users/${user.id}`)
        .json({ status: 'success', data: user });
}));

// PATCH /users/:id — partial update
router.patch('/:id', asyncHandler(async (req, res, next) => {
    const idx = users.findIndex(u => u.id === Number(req.params.id));
    if (idx === -1) return next(new AppError(`User ${req.params.id} not found`, 404));

    users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
    res.json({ status: 'success', data: users[idx] });
}));

// DELETE /users/:id
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const idx = users.findIndex(u => u.id === Number(req.params.id));
    if (idx === -1) return next(new AppError(`User ${req.params.id} not found`, 404));

    users.splice(idx, 1);
    res.status(204).end();
}));

// Deliberate crash route — proves the error handler catches everything
router.get('/crash/now', asyncHandler(async (req, res) => {
    throw new Error('Deliberate crash to test error handler!');
}));

module.exports = router;