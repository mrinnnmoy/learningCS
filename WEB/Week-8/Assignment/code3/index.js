require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const env = require('./config/env');
const corsMiddleware = require('./middleware/corsConfig');
const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const productsRouter = require('./routes/products');

const app = express();

// ─── Security & core middleware ───────────────────────────────────────────────
app.use(helmet());                                    // sets 11 security headers automatically
app.use(corsMiddleware);                              // CORS with origin whitelist
app.use(requestId);                                   // X-Request-ID on every request
app.use(express.json());                              // parse JSON bodies
app.use(express.urlencoded({ extended: true }));      // parse form data
app.use(morgan(env.logLevel));                        // HTTP request logging

// ─── Routes ──────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'Products API',
        version: '1.0.0',
        requestId: req.requestId,
        endpoints: {
            'GET    /products': 'List all (?category, ?minPrice, ?maxPrice, ?sort)',
            'GET    /products/stats': 'Inventory statistics',
            'GET    /products/:id': 'Get one product',
            'POST   /products': 'Create product (name, category, price required)',
            'PUT    /products/:id': 'Replace product (name, category, price required)',
            'PATCH  /products/:id': 'Partial update',
            'DELETE /products/:id': 'Delete product',
        },
    });
});

app.use('/products', productsRouter);

// ─── 404 & error handler (always last) ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
    console.log('\n╔══════════════════════════════════════════╗');
    console.log('║       Products API — Week 8              ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log(`  URL:         http://localhost:${env.port}`);
    console.log(`  Environment: ${env.nodeEnv}`);
    console.log(`  CORS:        ${env.allowedOrigins.join(', ')}`);
    console.log('  Middleware:  helmet → cors → requestId → json → morgan\n');
});