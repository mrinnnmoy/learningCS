const express = require('express');
const router = express.Router();
const { redis } = require('../lib/redis');

// POST /api/notify
router.post('/', async (req, res, next) => {
    try {
        const { channel, message } = req.body;
        if (!channel || !message) {
            return res.status(400).json({ message: 'channel and message are required' });
        }

        const payload = JSON.stringify({ message, timestamp: new Date().toISOString() });
        const subscribers = await redis.publish(channel, payload);

        res.json({ channel, subscribers, message });
    } catch (err) { next(err); }
});

module.exports = router;