require('dotenv').config();
const express = require('express');
const { redis, createRedisClient } = require('./lib/redis');
const { subscribeToChannel } = require('./lib/subscriber');
const { startWorker } = require('./workers/jobWorker');
const leaderboardRoutes = require('./routes/leaderboard');
const notifyRoutes = require('./routes/notify');
const jobRoutes = require('./routes/jobs');

const app = express();
app.use(express.json());

app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => res.json({
    message: 'Week 16 — Assignment 3: Leaderboard, Pub/Sub, Job Queue',
    routes: [
        'POST   /api/leaderboard/score',
        'GET    /api/leaderboard/top',
        'GET    /api/leaderboard/rank/:username',
        'DELETE /api/leaderboard/:username',
        'POST   /api/notify',
        'POST   /api/jobs',
        'GET    /api/jobs/queue-length',
        'GET    /api/jobs/:jobId/result',
    ],
}));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`🚀 http://localhost:${PORT}`);

    // Start the Pub/Sub subscriber
    await subscribeToChannel('notifications');

    // Start the job worker with a dedicated Redis connection
    // The worker uses BLPOP which blocks the connection — it needs its own client
    const workerRedis = createRedisClient('Worker Redis');
    startWorker(workerRedis); // intentionally not awaited — runs forever in background
});