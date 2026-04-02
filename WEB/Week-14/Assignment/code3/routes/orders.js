const express = require('express');
const router = express.Router();
const { placeOrder, updateOrderStatus } = require('../models/order');

router.post('/', async (req, res, next) => {
    try {
        const { userId, items } = req.body;

        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'userId and a non-empty items array are required' });
        }

        const order = await placeOrder(userId, items);
        res.status(201).json(order);
    } catch (err) {
        if (err.status === 400 || err.status === 404) {
            return res.status(err.status).json({ message: err.message });
        }
        next(err);
    }
});

router.put('/:id/status', async (req, res, next) => {
    try {
        const allowed = ['pending', 'shipped', 'delivered', 'cancelled'];
        const { status } = req.body;

        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
        }

        const order = await updateOrderStatus(req.params.id, status);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        next(err);
    }
});

module.exports = router;