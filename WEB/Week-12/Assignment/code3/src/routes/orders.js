// Order placement, retrieval, and admin listing routes.
// Contains fixes for Vulnerabilities 3, 4, and 6.

const express = require('express');
const store = require('../../config/store');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place a new order.
//
// FIX for Vulnerability 3 (negative quantity — Insecure Design, A04):
//   Original: const total = product.price * quantity  — no validation.
//   Attacker sends quantity: -5, total becomes -4995 (free money / credit exploit).
//
//   Fix: validate quantity is a positive integer BEFORE any arithmetic.
//   This is a business logic constraint that should have been there from the start.
//
// Also fixes mass assignment: only productId and quantity are read from req.body.
//   Spreading req.body would let an attacker inject fields like userId, total, status.
router.post('/', auth, (req, res) => {
    const { productId, quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'quantity must be a positive integer' });
    }

    const product = store.products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
    }

    const total = product.price * quantity; // always positive after the validation above
    const order = {
        id: store.getNextOrderId(),
        userId: req.user.userId, // always from the verified JWT, never from req.body
        productId,
        quantity,
        total,
        status: 'confirmed',
    };

    store.orders.push(order);
    product.stock -= quantity;

    res.status(201).json(order);
});

// GET /api/orders/:id — get a single order.
//
// FIX for Vulnerability 4 (IDOR — Broken Access Control, A01):
//   Original: res.json(order)  — returned regardless of who owns it.
//   Any authenticated user could read any other user's order by changing the ID.
//
//   Fix: compare order.userId against req.user.userId from the verified JWT.
//   Admins are exempt and can retrieve any order.
router.get('/:id', auth, (req, res) => {
    const order = store.orders.find(o => o.id === parseInt(req.params.id, 10));
    if (!order) return res.status(404).json({ message: 'Not found' });

    if (order.userId !== req.user.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(order);
});

// GET /api/admin/orders — list all orders.
//
// FIX for Vulnerability 6 (missing auth — Broken Access Control, A01):
//   Original: app.get('/api/admin/orders', (req, res) => { ... })
//   No middleware at all — anyone could call this endpoint unauthenticated.
//
//   Fix: auth + requireRole('admin') applied as a two-step chain.
//   Even if one check has a bug, the second provides a layer of defence.
router.get('/admin/orders', auth, requireRole('admin'), (req, res) => {
    res.json(store.orders);
});

module.exports = router;