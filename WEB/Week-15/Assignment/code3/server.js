require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => res.json({
    message: 'Week 15 — Assignment 3: Drizzle ORM',
    routes: [
        'POST   /api/users',
        'GET    /api/users              (x-role: ADMIN)',
        'DELETE /api/users/:id          (x-role: ADMIN)',
        'POST   /api/posts',
        'GET    /api/posts',
        'PATCH  /api/posts/:id/status',
        'POST   /api/posts/:id/comments',
        'GET    /api/stats',
    ],
}));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));