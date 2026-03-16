const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

let posts = [
    { id: 1, title: 'Getting Started', content: 'Hello world...', authorId: 1, published: true, views: 320 },
    { id: 2, title: 'REST API Design', content: 'REST basics...', authorId: 1, published: true, views: 891 },
    { id: 3, title: 'Draft: Auth Guide', content: 'Draft...', authorId: 2, published: false, views: 0 },
];
let nextId = 4;

// GET /posts — public
router.get('/', asyncHandler(async (req, res) => {
    const pub = posts.filter(p => p.published);
    res.json({ status: 'success', count: pub.length, data: pub });
}));

// GET /posts/drafts — editor=own, admin=all (must be before /:id)
router.get('/drafts', authenticate, asyncHandler(async (req, res) => {
    const drafts = posts.filter(p => !p.published &&
        (req.user.role === 'admin' || p.authorId === req.user.sub));
    res.json({ status: 'success', count: drafts.length, data: drafts });
}));

// GET /posts/:id — public
router.get('/:id', asyncHandler(async (req, res, next) => {
    const post = posts.find(p => p.id === Number(req.params.id));
    if (!post) return next(new AppError('Post not found', 404, 'POST_NOT_FOUND'));
    if (!post.published)
        return res.status(403).json({ status: 'fail', message: 'This post is not published' });
    post.views++;
    res.json({ status: 'success', data: post });
}));

// POST /posts — editor or admin
router.post('/', authenticate, authorizeRole('editor', 'admin'),
    asyncHandler(async (req, res, next) => {
        const { title, content } = req.body;
        if (!title || !content) {
            const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
            err.details = [];
            if (!title) err.details.push({ field: 'title', message: 'required' });
            if (!content) err.details.push({ field: 'content', message: 'required' });
            return next(err);
        }
        const post = { id: nextId++, title: title.trim(), content, authorId: req.user.sub, published: false, views: 0, createdAt: new Date().toISOString() };
        posts.push(post);
        res.status(201).json({ status: 'success', data: post });
    })
);

// PATCH /posts/:id — owner or admin
router.patch('/:id', authenticate, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError('Post not found', 404, 'POST_NOT_FOUND'));
    if (posts[idx].authorId !== req.user.sub && req.user.role !== 'admin')
        return next(new AppError('You can only edit your own posts', 403, 'FORBIDDEN'));

    const { title, content } = req.body;
    posts[idx] = { ...posts[idx], ...(title !== undefined && { title: title.trim() }), ...(content !== undefined && { content }), updatedAt: new Date().toISOString() };
    res.json({ status: 'success', data: posts[idx] });
}));

// POST /posts/:id/publish — editor (own) or admin
router.post('/:id/publish', authenticate, authorizeRole('editor', 'admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) return next(new AppError('Post not found', 404, 'POST_NOT_FOUND'));
        if (req.user.role === 'editor' && posts[idx].authorId !== req.user.sub)
            return next(new AppError('You can only publish your own posts', 403, 'FORBIDDEN'));
        if (posts[idx].published)
            return next(new AppError('Post is already published', 409, 'ALREADY_PUBLISHED'));

        posts[idx].published = true;
        posts[idx].publishedAt = new Date().toISOString();
        res.json({ status: 'success', message: `"${posts[idx].title}" is now published`, data: posts[idx] });
    })
);

// DELETE /posts/:id — admin only
router.delete('/:id', authenticate, authorizeRole('admin'),
    asyncHandler(async (req, res, next) => {
        const id = Number(req.params.id);
        const idx = posts.findIndex(p => p.id === id);
        if (idx === -1) return next(new AppError('Post not found', 404, 'POST_NOT_FOUND'));
        posts.splice(idx, 1);
        res.status(204).end();
    })
);

module.exports = router;