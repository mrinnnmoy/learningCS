// Admin-only routes.

const express = require('express');
const store = require('../config/store');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users — list all registered users.
// Requires authentication AND the 'admin' role.
router.get('/users', auth, requireRole('admin'), (req, res) => {
    // Never return password hashes in the response — map to safe fields only.
    const safeUsers = store.users.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
    }));
    res.json(safeUsers);
});

module.exports = router;