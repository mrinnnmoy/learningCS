const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const validateBody = require('../middleware/validateBody');

let products = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 15 },
    { id: 2, name: 'Desk Chair', category: 'Furniture', price: 249.99, stock: 8 },
    { id: 3, name: 'Notebook', category: 'Stationery', price: 4.99, stock: 200 },
    { id: 4, name: 'Headphones', category: 'Electronics', price: 79.99, stock: 32 },
];
let nextId = 5;

// GET /products — supports ?category, ?minPrice, ?maxPrice, ?sort=price|name
router.get('/', asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, sort } = req.query;

    let result = [...products];

    if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    if (sort === 'price') result.sort((a, b) => a.price - b.price);
    if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ status: 'success', count: result.length, data: result });
}));

// GET /products/stats — MUST be before /:id to prevent 'stats' matching as an id
router.get('/stats', asyncHandler(async (req, res) => {
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
    const categories = [...new Set(products.map(p => p.category))];
    const lowStock = products.filter(p => p.stock < 10);

    res.json({
        status: 'success',
        data: {
            totalProducts: products.length,
            totalInventoryValue: Number(totalValue.toFixed(2)),
            averagePrice: Number(avgPrice.toFixed(2)),
            categories,
            lowStockItems: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
        },
    });
}));

// GET /products/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Product ID must be a number', 400));

    const product = products.find(p => p.id === id);
    if (!product) return next(new AppError(`Product with id ${id} not found`, 404));

    res.json({ status: 'success', data: product });
}));

// POST /products
router.post('/', validateBody(['name', 'category', 'price']), asyncHandler(async (req, res, next) => {
    const { name, category, price, stock } = req.body;

    if (isNaN(Number(price)) || Number(price) < 0)
        return next(new AppError('price must be a non-negative number', 400));

    const duplicate = products.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return next(new AppError(`Product "${name}" already exists`, 409));

    const product = { id: nextId++, name, category, price: Number(price), stock: Number(stock) || 0 };
    products.push(product);

    res.status(201)
        .location(`/products/${product.id}`)
        .json({ status: 'success', data: product });
}));

// PUT /products/:id — full replace (idempotent)
router.put('/:id', validateBody(['name', 'category', 'price']), asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404));

    const { name, category, price, stock } = req.body;
    products[idx] = { id, name, category, price: Number(price), stock: Number(stock) || 0 };
    res.json({ status: 'success', data: products[idx] });
}));

// PATCH /products/:id — partial update (only update what is sent)
router.patch('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404));

    const { name, category, price, stock } = req.body;
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0))
        return next(new AppError('price must be a non-negative number', 400));

    // Spread existing, then overwrite only provided fields
    products[idx] = {
        ...products[idx],
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
    };

    res.json({ status: 'success', data: products[idx] });
}));

// DELETE /products/:id
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404));

    products.splice(idx, 1);
    res.status(204).end();
}));

module.exports = router;