// Single entry point — pulls config, middleware, routes, and starts the server.
//
// Load order matters:
//   1. config/env.js   — imported first so startup validation runs before
//                        any Express code is touched. If JWT_SECRET is missing
//                        or too short, process.exit(1) fires here.
//   2. helmet / cors   — security middleware before any route can respond
//   3. express.json()  — body parser before routes
//   4. rate limiter    — throttling before routes
//   5. routes          — registered after all middleware
//   6. 404 handler     — catches unmatched routes
//   7. errorHandler    — must be the very last app.use()

const env = require('./config/env'); // ← runs startup validation immediately

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const previewRoutes = require('./src/routes/preview');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ─────────────────────────────────────────────────────────────
// 1. Security headers — before all routes
//    Sets X-Frame-Options, X-Content-Type-Options,
//    Strict-Transport-Security, Referrer-Policy, and more.
// ─────────────────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────────────────
// 2. CORS — explicit origin allowlist
// ─────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || env.ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} is not allowed`));
        }
    },
    credentials: true,
}));

// ─────────────────────────────────────────────────────────────
// 3. Body parser
// ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// 4. General rate limiter — 100 requests per minute per IP
//    Prevents scraping and general DoS across all routes.
// ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));

// ─────────────────────────────────────────────────────────────
// 5. Routes
//    Each file handles its own URL prefix segment.
// ─────────────────────────────────────────────────────────────
app.use('/api', authRoutes);     // POST /api/login, POST /api/register
app.use('/api/products', productRoutes);  // GET  /api/products, GET /api/products/search
app.use('/api/orders', orderRoutes);    // POST /api/orders, GET /api/orders/:id
// GET  /api/orders/admin/orders
app.use('/api/preview', previewRoutes);  // POST /api/preview

// Health check — useful for uptime monitors and load balancers
app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV });
});

// ─────────────────────────────────────────────────────────────
// 6. 404 — catches any request that did not match a route above
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

// ─────────────────────────────────────────────────────────────
// 7. Global error handler — must be the last app.use()
// ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────
const server = app.listen(env.PORT, () => {
    console.log(`[server] Running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    console.log(`[server] Health check: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown on SIGTERM (PM2, Kubernetes) or SIGINT (Ctrl+C)
function shutdown(signal) {
    console.log(`\n[server] ${signal} received — shutting down gracefully...`);
    server.close(() => {
        console.log('[server] All connections closed.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000); // force exit after 10s
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught exception:', err);
    process.exit(1);
});