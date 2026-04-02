require('dotenv').config();
const express = require('express');
const pool = require('./db');
const productRoutes = require('./routes/products');

const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/', (req, res) => res.json({ message: 'Week 14 — Assignment 1: Products API' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));