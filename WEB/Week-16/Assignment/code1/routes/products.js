const express = require('express');
const router = express.Router();
const redis = require('../lib/redis');
const store = require('../data/store');

const CACHE_TTL = 60; // seconds

// GET /api/products
router.get('/', async (req, res, next) => {
    try {
        const cacheKey = 'cache:products';
        const cached = await redis.get(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(JSON.parse(cached));
        }

        const products = store.getAllProducts();
        await redis.set(cacheKey, JSON.stringify(products), 'EX', CACHE_TTL);

        res.setHeader('X-Cache', 'MISS');
        res.json(products);
    } catch (err) { next(err); }
});

// POST /api/products
router.post('/', async (req, res, next) => {
    try {
        const { name, price, category } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ message: 'name and price are required' });
        }

        const product = store.createProduct({ name, price, category });

        // Invalidate the list cache — it no longer reflects the new product
        await redis.del('cache:products');

        res.status(201).json(product);
    } catch (err) { next(err); }
});

// GET /api/products/:id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const cacheKey = `cache:product:${id}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(JSON.parse(cached));
        }

        const product = store.getProductById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        await redis.set(cacheKey, JSON.stringify(product), 'EX', CACHE_TTL);

        res.setHeader('X-Cache', 'MISS');
        res.json(product);
    } catch (err) { next(err); }
});

// PUT /api/products/:id
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = store.updateProduct(id, req.body);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Invalidate both the individual and list caches
        await redis.del(`cache:product:${id}`, 'cache:products');

        res.json(product);
    } catch (err) { next(err); }
});

module.exports = router;