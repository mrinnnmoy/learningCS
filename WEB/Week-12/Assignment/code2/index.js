// Entry point — loads config, mounts all middleware and routes, starts the server.
//
// config/env.js is required first. It runs the JWT_SECRET startup guard
// the moment it is imported. If the secret is missing or too short,
// the process throws here — before Express is even configured.

const env = require('./config/env');

const express = require('express');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
app.use('/api', authRoutes);   // POST /api/register, POST /api/login
app.use('/api/notes', notesRoutes);  // GET  /api/notes/:id, POST /api/notes
app.use('/api/admin', adminRoutes);  // GET  /api/admin/users

// 404 — catches any request that did not match a registered route
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

// ─────────────────────────────────────────────────────────────
// Global error handler — must be last
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
    console.log(`[server] Running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});