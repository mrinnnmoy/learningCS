const express = require('express');
const router = express.Router();
const { createProduct, getProducts } = require('../models/product');

router.post('/', async (req, res, next) => {
    try {
        const { name, price, stock, category, tags } = req.body;
        if (!name || price === undefined || !category) {
            return res.status(400).json({ message: 'name, price and category are required' });
        }
        res.status(201).json(await createProduct({ name, price, stock, category, tags }));
    } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
    try {
        res.json(await getProducts(req.query));
    } catch (err) { next(err); }
});

module.exports = router;