const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { logger } = require('../config/logger');

let orders = [
    { id: 1, userId: 10, product: 'Laptop', quantity: 1, status: 'delivered', total: 999.99 },
    { id: 2, userId: 10, product: 'Headphones', quantity: 2, status: 'shipped', total: 159.98 },
    { id: 3, userId: 20, product: 'Keyboard', quantity: 1, status: 'pending', total: 79.99 },
    { id: 4, userId: 20, product: 'Monitor', quantity: 1, status: 'pending', total: 399.99 },
];
let nextId = 5;

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// GET /orders
router.get('/', asyncHandler(async (req, res) => {
    const { status, userId } = req.query;
    logger.debug('Fetching orders list', { requestId: req.requestId, filters: { status, userId } });

    let result = [...orders];
    if (status) result = result.filter(o => o.status === status);
    if (userId) result = result.filter(o => o.userId === Number(userId));

    logger.info('orders.list', { requestId: req.requestId, count: result.length });
    res.json({ status: 'success', count: result.length, data: result });
}));

// GET /orders/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    logger.debug('Fetching single order', { requestId: req.requestId, orderId: id });

    if (isNaN(id) || id <= 0) {
        logger.warn('Invalid order ID requested', { requestId: req.requestId, raw: req.params.id });
        throw new AppError('Order ID must be a positive number', 400, 'INVALID_ID');
    }

    const order = orders.find(o => o.id === id);
    if (!order) {
        logger.warn('Order not found', { requestId: req.requestId, orderId: id });
        return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));
    }

    res.json({ status: 'success', data: order });
}));

// POST /orders
router.post('/', asyncHandler(async (req, res, next) => {
    const { userId, product, quantity } = req.body;
    logger.debug('Creating order', { requestId: req.requestId, payload: { userId, product, quantity } });

    const details = [];
    if (!userId) details.push({ field: 'userId', message: 'userId is required' });
    if (!product || product.trim() === '') details.push({ field: 'product', message: 'product is required' });
    if (!quantity) details.push({ field: 'quantity', message: 'quantity is required' });
    else if (isNaN(Number(quantity)) || Number(quantity) < 1)
        details.push({ field: 'quantity', message: 'quantity must be a positive integer' });

    if (details.length > 0) {
        logger.warn('Order creation failed validation', { requestId: req.requestId, details });
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = details;
        return next(err);
    }

    const order = {
        id: nextId++,
        userId: Number(userId),
        product: product.trim(),
        quantity: Number(quantity),
        status: 'pending',
        total: Number((Math.random() * 500 + 50).toFixed(2)),
        createdAt: new Date().toISOString(),
    };
    orders.push(order);

    logger.info('order.created', {
        requestId: req.requestId,
        orderId: order.id,
        userId: order.userId,
        product: order.product,
        total: order.total,
    });

    res.status(201).location(`/orders/${order.id}`).json({ status: 'success', data: order });
}));

// POST /orders/:id/cancel
router.post('/:id/cancel', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = orders.findIndex(o => o.id === id);

    if (idx === -1) {
        logger.warn('Cancel on non-existent order', { requestId: req.requestId, orderId: id });
        return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));
    }
    if (orders[idx].status === 'delivered') {
        logger.warn('Cancel attempted on delivered order', { requestId: req.requestId, orderId: id });
        return next(new AppError('Delivered orders cannot be cancelled', 409, 'CANNOT_CANCEL'));
    }
    if (orders[idx].status === 'cancelled') {
        logger.warn('Cancel on already-cancelled order', { requestId: req.requestId, orderId: id });
        return next(new AppError('Order is already cancelled', 409, 'ALREADY_CANCELLED'));
    }

    const prevStatus = orders[idx].status;
    orders[idx].status = 'cancelled';
    orders[idx].cancelledAt = new Date().toISOString();

    logger.info('order.cancelled', { requestId: req.requestId, orderId: id, prevStatus });

    res.json({ status: 'success', message: `Order ${id} has been cancelled`, data: orders[idx] });
}));

// DELETE /orders/:id
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = orders.findIndex(o => o.id === id);

    if (idx === -1) {
        logger.warn('Delete on non-existent order', { requestId: req.requestId, orderId: id });
        return next(new AppError(`Order ${id} not found`, 404, 'ORDER_NOT_FOUND'));
    }

    const deleted = orders[idx];
    orders.splice(idx, 1);

    logger.info('order.deleted', { requestId: req.requestId, orderId: deleted.id, userId: deleted.userId });
    res.status(204).end();
}));

// GET /orders/crash/error — programmer error, proves logger.error fires
router.get('/crash/error', asyncHandler(async (req, res) => {
    const obj = undefined;
    return obj.nonExistentMethod(); // TypeError
}));

module.exports = router;