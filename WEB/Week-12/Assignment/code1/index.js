// Entry point — pulls all pieces together and starts the HTTP server.
//
// Load order matters:
//   1. config/env.js   — must be first so process.env is populated
//   2. Middleware       — applied before routes
//   3. Routes          — registered after middleware
//   4. Error handler   — must be registered last (Express requirement)

const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─────────────────────────────────────────────────────────────
// 1. Security headers — applied before ALL routes.
//    Sets: X-Frame-Options, X-Content-Type-Options,
//          Strict-Transport-Security, Referrer-Policy, and more.
//    Must come first so every response — including errors — gets the headers.
// ─────────────────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────────────────
// 2. CORS — explicit origin allowlist only.
//    cors() with no options defaults to allowing every origin (*).
//    We restrict to our own frontend dev server.
// ─────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true,
}));

// ─────────────────────────────────────────────────────────────
// 3. Body parser — parse incoming JSON request bodies.
// ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// 4. Routes
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Simulated crash route — used to test the error handler in dev
app.get('/api/break', (req, res) => {
    throw new Error('DB connection failed at /home/ubuntu/app/db/pool.js:42');
});

// 404 — catches any request that did not match a registered route
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

// ─────────────────────────────────────────────────────────────
// 5. Global error handler — MUST be registered last.
//    Express only calls this when next(err) is invoked or an
//    error is thrown inside a route handler.
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// 6. Start the server
// ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
    console.log(`[server] Running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});