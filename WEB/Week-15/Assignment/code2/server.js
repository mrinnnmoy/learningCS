require('dotenv').config();
const express = require('express');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => res.json({ message: 'Week 15 — Assignment 2: E-Commerce API' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));