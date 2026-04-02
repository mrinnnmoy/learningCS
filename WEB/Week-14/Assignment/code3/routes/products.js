const express = require('express');
const router = express.Router();
const { logStockMovement } = require('../models/stockLog');

router.put('/:id/stock', async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            return res.status(400).json({ message: 'quantity must be a positive number' });
        }

        const result = await logStockMovement(req.params.id, Number(quantity));
        if (!result) return res.status(404).json({ message: 'Product not found' });

        res.json(result);
    } catch (err) {
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

module.exports = router;