const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Order, Product, User } = require('../models');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/orders — Create an order
// Uses atomic $inc with a $gte check to prevent overselling (race condition safe)
router.post('/', async (req, res, next) => {
  try {
    const { userId, items } = req.body;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: 'Invalid userId format' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and cannot be empty' });
    }

    const lineItems = [];
    let total = 0;

    // Process each item — atomically decrement stock
    for (const item of items) {
      if (!isValidId(item.productId)) {
        return res.status(400).json({ message: `Invalid productId: ${item.productId}` });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
      }

      // findOneAndUpdate with a $gte check on stock is atomic.
      // If stock < quantity, the filter doesn't match and returns null.
      // This is safer than: find product → check stock in JS → update stock
      // because between find and update, another request could buy the last item.
      const product = await Product.findOneAndUpdate(
        {
          _id:   item.productId,
          stock: { $gte: item.quantity }, // only match if enough stock
        },
        {
          $inc: { stock: -item.quantity }, // decrement atomically
        },
        { new: true } // return updated product to confirm the change
      );

      if (!product) {
        // Either product doesn't exist or stock was insufficient
        // Fetch the product to give a useful error message
        const existing = await Product.findById(item.productId).select('name stock');
        if (!existing) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        return res.status(400).json({
          message: `Insufficient stock for ${existing.name}. Available: ${existing.stock}`,
        });
      }

      lineItems.push({
        productId: product._id,
        name:      product.name,  // snapshot name at purchase time
        price:     product.price, // snapshot price at purchase time
        quantity:  item.quantity,
      });

      total += product.price * item.quantity;
    }

    const order = await Order.create({ userId, lineItems, total });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status — Update order status
router.put('/:id/status', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const { status } = req.body;
    const allowed = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
