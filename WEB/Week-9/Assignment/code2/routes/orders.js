const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { cursorPaginate } = require('../utils/cursorPaginate');
const idempotency = require('../middleware/idempotency');
const { writeLimiter } = require('../middleware/rateLimiter');

let orders = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    userId: Math.ceil((i + 1) / 5),
    product: ['Laptop', 'Chair', 'Notebook', 'Headphones', 'Webcam'][i % 5],
    quantity: (i % 3) + 1,
    status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][i % 5],
    total: Number((50 + i * 20).toFixed(2)),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));
let nextId = 26;

// Track deleted IDs for 410 Gone
const deletedOrderIds = new Set();

// GET /orders — cursor pagination + optional filters
router.get('/', asyncHandler(async (req, res) => {
    const { status, userId } = req.query;

    let result = [...orders];
    if (status) result = result.filter(o => o.status === status);
    if (userId) result = result.filter(o => o.userId === Number(userId));

    const { data, meta } = cursorPaginate(result, req.query);
    res.json({ status: 'success', data, meta });
}));

// GET /orders/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // Check 410 Gone first
    if (deletedOrderIds.has(id))
        return next(new AppError(`Order ${id} has been permanently deleted`, 410, 'ORDER_GONE'));

    const order = orders.find(o => o.id === id);
    if (!order) return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));

    res.json({ status: 'success', data: order });
}));

// POST /orders — idempotency key + write rate limit
router.post('/', writeLimiter, idempotency, asyncHandler(async (req, res, next) => {
    const { userId, product, quantity } = req.body;

    if (!userId || !product || !quantity)
        return next(new AppError('userId, product, and quantity are required', 400, 'VALIDATION_ERROR'));
    if (isNaN(Number(quantity)) || Number(quantity) < 1)
        return next(new AppError('quantity must be a positive integer', 400, 'INVALID_QUANTITY'));

    const order = {
        id: nextId++,
        userId: Number(userId),
        product,
        quantity: Number(quantity),
        status: 'pending',
        total: Number((Math.random() * 200 + 20).toFixed(2)),
        createdAt: new Date().toISOString(),
    };
    orders.push(order);

    res.status(201)
        .location(`/api/v1/orders/${order.id}`)
        .json({ status: 'success', data: order });
}));

// POST /orders/:id/cancel — non-CRUD action with business rules
router.post('/:id/cancel', writeLimiter, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = orders.findIndex(o => o.id === id);

    if (idx === -1) return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));

    if (orders[idx].status === 'delivered')
        return next(new AppError('Delivered orders cannot be cancelled', 409, 'CANNOT_CANCEL_DELIVERED'));
    if (orders[idx].status === 'cancelled')
        return next(new AppError('Order is already cancelled', 409, 'ALREADY_CANCELLED'));

    orders[idx].status = 'cancelled';
    orders[idx].cancelledAt = new Date().toISOString();

    res.json({
        status: 'success',
        message: `Order ${id} has been cancelled`,
        data: orders[idx],
    });
}));

// DELETE /orders/:id — 204 on first delete, 410 on repeat
router.delete('/:id', writeLimiter, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // Already deleted — 410 Gone (not 404 — we know it existed)
    if (deletedOrderIds.has(id))
        return next(new AppError(`Order ${id} has been permanently deleted`, 410, 'ORDER_GONE'));

    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));

    orders.splice(idx, 1);
    deletedOrderIds.add(id); // remember it was deleted
    res.status(204).end();
}));

module.exports = router;