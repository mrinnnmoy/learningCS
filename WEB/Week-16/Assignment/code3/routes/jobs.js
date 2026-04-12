const express = require('express');
const router = express.Router();
const { redis } = require('../lib/redis');

// POST /api/jobs — enqueue a job
router.post('/', async (req, res, next) => {
    try {
        const { type, payload } = req.body;
        if (!type) return res.status(400).json({ message: 'type is required' });

        const job = {
            jobId: Date.now(),
            type,
            payload: payload || {},
            enqueuedAt: new Date().toISOString(),
            status: 'queued',
        };

        // RPUSH = push to the right (tail) — jobs are consumed from the left (head)
        // This gives us FIFO ordering
        await redis.rpush('queue:jobs', JSON.stringify(job));

        res.status(201).json(job);
    } catch (err) { next(err); }
});

// GET /api/jobs/queue-length
router.get('/queue-length', async (req, res, next) => {
    try {
        const length = await redis.llen('queue:jobs');
        res.json({ length });
    } catch (err) { next(err); }
});

// GET /api/jobs/:jobId/result
router.get('/:jobId/result', async (req, res, next) => {
    try {
        const result = await redis.get(`job:result:${req.params.jobId}`);

        if (!result) {
            return res.json({ jobId: req.params.jobId, status: 'pending' });
        }

        res.json(JSON.parse(result));
    } catch (err) { next(err); }
});

module.exports = router;