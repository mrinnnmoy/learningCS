const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const sanitize = require('../utils/sanitize');
const validateBody = require('../middleware/validateBody');

// In-memory store (internalNotes simulates a field that must never reach clients)
let products = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 15, internalNotes: 'supplier: TechCo' },
    { id: 2, name: 'Desk Chair', category: 'Furniture', price: 249.99, stock: 8, internalNotes: 'slow mover' },
    { id: 3, name: 'Notebook', category: 'Stationery', price: 4.99, stock: 200, internalNotes: 'bulk order' },
    { id: 4, name: 'Headphones', category: 'Electronics', price: 79.99, stock: 32, internalNotes: '' },
    { id: 5, name: 'Standing Desk', category: 'Furniture', price: 599.99, stock: 5, internalNotes: '' },
    { id: 6, name: 'Webcam', category: 'Electronics', price: 89.99, stock: 20, internalNotes: '' },
    { id: 7, name: 'USB-C Hub', category: 'Electronics', price: 39.99, stock: 60, internalNotes: '' },
    { id: 8, name: 'Pen Set', category: 'Stationery', price: 12.99, stock: 150, internalNotes: '' },
];
let nextId = 9;

const createRules = {
    name: { required: true, minLength: 2 },
    category: { required: true },
    price: { required: true, isNumber: true, min: 0 },
};

// GET /products — filter + search + sort + sparse fields + paginate
router.get('/', asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice, q, sort, fields } = req.query;

    let result = [...products];

    // Filtering
    if (category) result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));

    // Full-text search across name and category
    if (q) {
        const term = q.toLowerCase();
        result = result.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.category.toLowerCase().includes(term)
        );
    }

    // Sorting — '-' prefix = descending
    if (sort) {
        const desc = sort.startsWith('-');
        const key = desc ? sort.slice(1) : sort;
        const allowed = ['name', 'price', 'stock', 'category'];
        if (allowed.includes(key)) {
            result.sort((a, b) => {
                if (a[key] < b[key]) return desc ? 1 : -1;
                if (a[key] > b[key]) return desc ? -1 : 1;
                return 0;
            });
        }
    }

    // Sanitize — strip internalNotes and other sensitive fields
    result = sanitize(result);

    // Sparse fieldsets — return only requested fields
    if (fields) {
        const allowed = fields.split(',').map(f => f.trim());
        result = result.map(p =>
            allowed.reduce((obj, k) => {
                if (p[k] !== undefined) obj[k] = p[k];
                return obj;
            }, {})
        );
    }

    // Paginate
    const { data, meta } = paginate(result, req.query);
    res.json({ status: 'success', data, meta });
}));

// GET /products/stats — MUST be before /:id
router.get('/stats', asyncHandler(async (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const avgPrice = products.reduce((s, p) => s + p.price, 0) / products.length;
    const lowStock = products.filter(p => p.stock < 10);

    const byCategory = categories.map(cat => {
        const catProducts = products.filter(p => p.category === cat);
        return {
            category: cat,
            count: catProducts.length,
            avgPrice: Number((catProducts.reduce((s, p) => s + p.price, 0) / catProducts.length).toFixed(2)),
        };
    });

    res.json({
        status: 'success',
        data: {
            totalProducts: products.length,
            totalInventoryValue: Number(totalValue.toFixed(2)),
            averagePrice: Number(avgPrice.toFixed(2)),
            categories,
            byCategory,
            lowStockItems: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock })),
        },
    });
}));

// GET /products/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Product ID must be a number', 400, 'INVALID_ID'));
    const product = products.find(p => p.id === id);
    if (!product) return next(new AppError(`Product ${id} not found`, 404, 'PRODUCT_NOT_FOUND'));
    res.json({ status: 'success', data: sanitize(product) });
}));

// POST /products
router.post('/', validateBody(createRules), asyncHandler(async (req, res, next) => {
    const { name, category, price, stock } = req.body;

    if (products.find(p => p.name.toLowerCase() === name.toLowerCase()))
        return next(new AppError(`Product "${name}" already exists`, 409, 'DUPLICATE_PRODUCT'));

    const product = { id: nextId++, name, category, price: Number(price), stock: Number(stock) || 0 };
    products.push(product);

    res.status(201)
        .location(`/api/v1/products/${product.id}`)
        .json({ status: 'success', data: sanitize(product) });
}));

// PUT /products/:id — full replace
router.put('/:id', validateBody(createRules), asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404, 'PRODUCT_NOT_FOUND'));

    const { name, category, price, stock } = req.body;
    products[idx] = { id, name, category, price: Number(price), stock: Number(stock) || 0 };
    res.json({ status: 'success', data: sanitize(products[idx]) });
}));

// PATCH /products/:id — partial update
router.patch('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404, 'PRODUCT_NOT_FOUND'));

    const { name, category, price, stock } = req.body;
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0))
        return next(new AppError('price must be a non-negative number', 400, 'INVALID_PRICE'));

    products[idx] = {
        ...products[idx],
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
    };
    res.json({ status: 'success', data: sanitize(products[idx]) });
}));

// DELETE /products/:id
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Product ${id} not found`, 404, 'PRODUCT_NOT_FOUND'));
    products.splice(idx, 1);
    res.status(204).end();
}));

// POST /products/:id/restock — non-CRUD action
router.post('/:id/restock', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    const idx = products.findIndex(p => p.id === id);

    if (idx === -1)
        return next(new AppError(`Product ${id} not found`, 404, 'PRODUCT_NOT_FOUND'));
    if (!req.body.quantity || isNaN(quantity) || quantity <= 0)
        return next(new AppError('quantity must be a positive number', 400, 'INVALID_QUANTITY'));

    products[idx].stock += quantity;

    res.json({
        status: 'success',
        message: `Added ${quantity} units to "${products[idx].name}"`,
        data: sanitize(products[idx]),
    });
}));

module.exports = router;