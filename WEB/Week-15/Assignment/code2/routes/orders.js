const express = require('express');
const router = express.Router();
const { placeOrder, updateStatus } = require('../models/order');

const VALID_STATUSES = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

router.post('/', async (req, res, next) => {
    try {
        const { userId, items } = req.body;
        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'userId and a non-empty items array are required' });
        }
        res.status(201).json(await placeOrder(userId, items));
    } catch (err) {
        if (err.status === 400 || err.status === 404) {
            return res.status(err.status).json({ message: err.message });
        }
        next(err);
    }
});

router.put('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        res.json(await updateStatus(req.params.id, status));
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Order not found' });
        next(err);
    }
});

module.exports = router;