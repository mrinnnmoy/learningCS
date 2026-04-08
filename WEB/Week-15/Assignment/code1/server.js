require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.get('/', (req, res) => res.json({ message: 'Week 15 — Assignment 1: Blog API' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));