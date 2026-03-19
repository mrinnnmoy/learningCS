// Login and register routes.

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const env = require('../../config/env');
const store = require('../../config/store');

const router = express.Router();

// POST /api/login
//
// FIX for Vulnerability 1 (JWT with no expiry):
//   Original: jwt.sign({ ... }, SECRET)  — no options, token never expires.
//   A stolen token is valid forever — no time window after which the
//   attacker loses access.
//
//   Fix: { expiresIn: '15m' } — tokens expire after 15 minutes.
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const user = store.users.find(u => u.email === email.toLowerCase().trim());

        const dummyHash = '$2b$10$dummyhashtopreventtimingattackswhenuserdoesnotexist0000';
        const isMatch = await bcrypt.compare(password, user ? user.password : dummyHash);

        if (!user || !isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '15m' } // FIX — token now expires
        );

        res.json({ token });
    } catch (err) {
        next(err);
    }
});

// POST /api/register — creates a new user for testing.
// role is always 'user' — never read from req.body.
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }

        const exists = store.users.find(u => u.email === email.toLowerCase().trim());
        if (exists) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = {
            id: store.users.length + 1,
            email: email.toLowerCase().trim(),
            password: hashed,
            role: 'user',
        };
        store.users.push(user);

        res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
        next(err);
    }
});

module.exports = router;