// Product listing and search routes.

const express = require('express');
const store = require('../../config/store');
const { escapeHtml } = require('../utils/escapeHtml');

const router = express.Router();

// GET /api/products — list all products (public, no auth required)
router.get('/', (req, res) => {
    res.json(store.products);
});

// GET /api/products/search?q=<query>
//
// The query string q is reflected back in the response.
// Without escaping, an attacker can inject HTML/script tags that
// execute in any client that renders the value in an HTML context.
//
// Fix: escapeHtml() encodes < > " ' & before including q in the response.
router.get('/search', (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Query parameter q is required' });
    }

    const results = store.products.filter(p =>
        p.name.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
        query: escapeHtml(q), // sanitized before echoing back
        results,
    });
});

module.exports = router;