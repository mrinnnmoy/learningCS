// Registration and login routes.

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const env = require('../config/env');
const store = require('../config/store');

const router = express.Router();

// POST /api/register
//
// FIX — Mass Assignment (Privilege Escalation):
//   The original vulnerable code did: const { email, password, role } = req.body
//   An attacker could register with { "role": "admin" } in the body and
//   immediately get admin access.
//
//   Fix: destructure ONLY email and password. Role is always set to 'user'
//   by the server — it is never read from the request body.
router.post('/register', async (req, res, next) => {
    try {
        const { email, password } = req.body; // role is intentionally NOT read here

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
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
            role: 'user', // always 'user' — the server decides this, not the client
        };
        store.users.push(user);

        res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
        next(err);
    }
});

// POST /api/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = store.users.find(u => u.email === email?.toLowerCase().trim());

        // Timing-safe: always run bcrypt.compare whether or not the user exists.
        const dummyHash = '$2b$10$dummyhashtopreventtimingattackswhenuserdoesnotexist0000';
        const isMatch = await bcrypt.compare(password, user ? user.password : dummyHash);

        if (!user || !isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        next(err);
    }
});

module.exports = router;