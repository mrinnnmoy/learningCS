require('dotenv').config();
const express = require('express');
require('./db');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) =>
    res.json({
        message: 'Week 14 — Assignment 3: E-Commerce Dashboard',
        routes: [
            'POST   /api/orders',
            'PUT    /api/orders/:id/status',
            'GET    /api/dashboard/revenue',
            'GET    /api/dashboard/top-products',
            'GET    /api/dashboard/category-stats',
            'GET    /api/dashboard/top-customers',
            'PUT    /api/products/:id/stock',
        ],
    })
);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));