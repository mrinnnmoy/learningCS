// Authentication routes — register and login.

const express = require('express');
const bcrypt = require('bcrypt');

const { users } = require('../config/store');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/register
// Accepts email + password, hashes the password with bcrypt, stores the user.
//
// Security:
//   - bcrypt hash with 12 salt rounds before storing — never plain text.
//   - Response returns only { message, email } — never the password hash.
//   - Duplicate email check to prevent silent overwrites.
router.post('/register', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const exists = users.find(u => u.email === email.toLowerCase().trim());
        if (exists) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash with bcrypt — 12 salt rounds is the recommended default.
        // Higher rounds = slower = harder for an attacker to brute-force.
        const hashedPassword = await bcrypt.hash(password, 12);

        users.push({
            id: users.length + 1,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        // Never return the password hash in the response.
        res.status(201).json({ message: 'Registered', email: email.toLowerCase().trim() });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
// Validates email + password against the stored bcrypt hash.
//
// Security:
//   - Timing-safe: bcrypt.compare runs even when the email is not found.
//     Without this, an attacker can detect registered emails by measuring
//     response time (email found = slow bcrypt compare, not found = instant).
//   - Same error message for "email not found" and "wrong password".
//     Different messages let attackers enumerate which emails are registered.
//   - Response returns only { message: 'Logged in' } — never the user object.
router.post('/login', authLimiter, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = users.find(u => u.email === email.toLowerCase().trim());

        // Always run bcrypt.compare — even when no user was found — to keep
        // response time consistent and prevent email enumeration via timing.
        const dummyHash = '$2b$12$dummyhashtopreventtimingattackswhenuserdoesnotexist0000';
        const hashToCheck = user ? user.password : dummyHash;
        const isMatch = await bcrypt.compare(password, hashToCheck);

        if (!user || !isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Return only what the client needs.
        // The user object contains the bcrypt hash — never send it.
        res.json({ message: 'Logged in' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;