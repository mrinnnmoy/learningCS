const express = require('express');
const router = express.Router();
const { getStats } = require('../models/dashboard');

router.get('/stats', async (req, res, next) => {
    try {
        res.json(await getStats());
    } catch (err) { next(err); }
});

module.exports = router;