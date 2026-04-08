const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, softDeleteUser } = require('../models/user');
const { adminOnly } = require('../middleware/adminOnly');

// POST /api/users — register
router.post('/', async (req, res, next) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ message: 'email, name and password are required' });
        }

        const user = await createUser(email, name, password);
        res.status(201).json(user);
    } catch (err) {
        // Postgres unique violation — email already exists
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        next(err);
    }
});

// GET /api/users — all non-deleted users (admin only)
router.get('/', adminOnly, async (req, res, next) => {
    try {
        res.json(await getAllUsers());
    } catch (err) { next(err); }
});

// DELETE /api/users/:id — soft delete user + cascade (admin only)
router.delete('/:id', adminOnly, async (req, res, next) => {
    try {
        res.json(await softDeleteUser(Number(req.params.id)));
    } catch (err) { next(err); }
});

module.exports = router;