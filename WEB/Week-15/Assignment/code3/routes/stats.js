const express = require('express');
const router = express.Router();
const { getStats } = require('../models/stats');

router.get('/', async (req, res, next) => {
    try {
        res.json(await getStats());
    } catch (err) { next(err); }
});

module.exports = router;