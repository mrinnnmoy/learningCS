const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../models/product');

// POST /api/products
router.post('/', async (req, res, next) => {
    try {
        const { name, price, category, stock } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({ message: 'name and price are required' });
        }
        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ message: 'price must be a non-negative number' });
        }

        const product = await createProduct({ name, price, category, stock });
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
});

// GET /api/products?category=electronics
router.get('/', async (req, res, next) => {
    try {
        const products = await getAllProducts(req.query.category);
        res.json(products);
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const product = await getProductById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        // PostgreSQL throws an error if $1 can't be cast to BIGINT (e.g. "abc")
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
    try {
        const product = await updateProduct(req.params.id, req.body);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        // 23514 = check_violation (e.g. price < 0 or stock < 0)
        if (err.code === '23514') {
            return res.status(400).json({ message: 'Value violates a constraint (price >= 0, stock >= 0)' });
        }
        next(err);
    }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await deleteProduct(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

module.exports = router;