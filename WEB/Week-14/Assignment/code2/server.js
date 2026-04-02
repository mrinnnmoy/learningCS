require('dotenv').config();
const express = require('express');
require('./db');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => res.json({ message: 'Week 14 — Assignment 2: Blog API' }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));