const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById } = require('../models/user');

router.post('/', async (req, res, next) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            return res.status(400).json({ message: 'email, name and password are required' });
        }
        const user = await createUser({ email, name, password });
        res.status(201).json(user);
    } catch (err) {
        if (err.code === 'P2002') return res.status(409).json({ message: 'Email already in use' });
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        res.json(await getAllUsers());
    } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const user = await getUserById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) { next(err); }
});

module.exports = router;