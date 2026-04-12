const express = require('express');
const router = express.Router();
const { redis } = require('../lib/redis');

const LEADERBOARD_KEY = 'leaderboard';

// POST /api/leaderboard/score
router.post('/score', async (req, res, next) => {
    try {
        const { username, score, increment } = req.body;
        if (!username || score === undefined) {
            return res.status(400).json({ message: 'username and score are required' });
        }

        let newScore;
        if (increment) {
            // ZINCRBY adds to the existing score
            newScore = await redis.zincrby(LEADERBOARD_KEY, Number(score), username);
        } else {
            // ZADD sets the score (overwrites if exists)
            await redis.zadd(LEADERBOARD_KEY, Number(score), username);
            newScore = Number(score);
        }

        // Keep only top 1000 players — remove players outside that range
        await redis.zremrangebyrank(LEADERBOARD_KEY, 0, -1001);

        res.json({ username, score: parseFloat(newScore) });
    } catch (err) { next(err); }
});

// GET /api/leaderboard/top
router.get('/top', async (req, res, next) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);

        // ZRANGE with REV returns highest scores first
        // WITHSCORES returns alternating [member, score, member, score, ...]
        const raw = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, 'REV', 'WITHSCORES');

        const leaderboard = [];
        for (let i = 0; i < raw.length; i += 2) {
            leaderboard.push({
                rank: leaderboard.length + 1,
                username: raw[i],
                score: parseFloat(raw[i + 1]),
            });
        }

        res.json(leaderboard);
    } catch (err) { next(err); }
});

// GET /api/leaderboard/rank/:username
router.get('/rank/:username', async (req, res, next) => {
    try {
        const { username } = req.params;

        const [rank0, score] = await Promise.all([
            redis.zrevrank(LEADERBOARD_KEY, username),  // 0-indexed, highest = 0
            redis.zscore(LEADERBOARD_KEY, username),
        ]);

        if (rank0 === null) {
            return res.status(404).json({ message: `${username} not found on leaderboard` });
        }

        // Get surrounding players for context
        // zrange with REV: rank0-1 is the player above (better rank), rank0+1 is below
        const above = rank0 > 0
            ? await redis.zrange(LEADERBOARD_KEY, rank0 - 1, rank0 - 1, 'REV', 'WITHSCORES')
            : [];
        const below = await redis.zrange(LEADERBOARD_KEY, rank0 + 1, rank0 + 1, 'REV', 'WITHSCORES');

        res.json({
            username,
            rank: rank0 + 1, // convert to 1-indexed
            score: parseFloat(score),
            above: above.length ? { username: above[0], score: parseFloat(above[1]) } : null,
            below: below.length ? { username: below[0], score: parseFloat(below[1]) } : null,
        });
    } catch (err) { next(err); }
});

// DELETE /api/leaderboard/:username
router.delete('/:username', async (req, res, next) => {
    try {
        const removed = await redis.zrem(LEADERBOARD_KEY, req.params.username);
        if (!removed) return res.status(404).json({ message: 'Player not found' });
        res.json({ message: `${req.params.username} removed from leaderboard` });
    } catch (err) { next(err); }
});

module.exports = router;