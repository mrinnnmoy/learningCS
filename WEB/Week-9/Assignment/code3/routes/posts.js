const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const sanitize = require('../utils/sanitize');
const { requireWrite, writeLimiter } = require('../middleware/index');

// In-memory store — internalNotes simulates a field that must never reach clients
let posts = [
    { id: 1, title: 'Getting Started with Node.js', content: 'Node.js is a runtime built on Chrome V8...', author: 'Alice', tags: ['node', 'javascript'], published: true, views: 342, createdAt: '2024-01-01T00:00:00Z', internalNotes: 'featured' },
    { id: 2, title: 'REST API Design Best Practices', content: 'When designing APIs, consistency is key...', author: 'Bob', tags: ['api', 'rest'], published: true, views: 891, createdAt: '2024-01-05T00:00:00Z', internalNotes: '' },
    { id: 3, title: 'Understanding Async/Await', content: 'Async functions return a Promise...', author: 'Alice', tags: ['javascript', 'async'], published: false, views: 0, createdAt: '2024-01-10T00:00:00Z', internalNotes: 'draft' },
    { id: 4, title: 'Express Middleware Deep Dive', content: 'Middleware functions have access to req...', author: 'Carol', tags: ['express', 'node'], published: true, views: 215, createdAt: '2024-01-15T00:00:00Z', internalNotes: '' },
    { id: 5, title: 'Database Indexing Explained', content: 'Indexes speed up read queries...', author: 'Bob', tags: ['database', 'sql'], published: true, views: 560, createdAt: '2024-01-20T00:00:00Z', internalNotes: '' },
];
let nextId = 6;

// Field-level validator
// requireAll=true → all fields required (POST)
// requireAll=false → only validate fields that are present (PATCH)
function validatePost(body, requireAll = true) {
    const details = [];

    if (requireAll || body.title !== undefined) {
        if (!body.title)
            details.push({ field: 'title', message: 'title is required' });
        else if (body.title.length < 5)
            details.push({ field: 'title', message: 'title must be at least 5 characters' });
    }
    if (requireAll || body.content !== undefined) {
        if (!body.content)
            details.push({ field: 'content', message: 'content is required' });
        else if (body.content.length < 10)
            details.push({ field: 'content', message: 'content must be at least 10 characters' });
    }
    if (requireAll || body.author !== undefined) {
        if (!body.author)
            details.push({ field: 'author', message: 'author is required' });
    }

    return details;
}

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: List posts (published only by default)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: author
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search in title and content
 *       - in: query
 *         name: published
 *         schema: { type: string, enum: [all] }
 *         description: Pass "all" to include drafts
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [views, -views, createdAt, -createdAt, title] }
 *       - in: query
 *         name: fields
 *         schema: { type: string }
 *         description: Comma-separated fields to include
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 50 }
 *     responses:
 *       200:
 *         description: List of posts
 *       401:
 *         description: Missing API key
 */
router.get('/', asyncHandler(async (req, res) => {
    const { author, tag, q, sort, fields, published } = req.query;

    // Only published by default — pass ?published=all to include drafts
    let result = published === 'all' ? [...posts] : posts.filter(p => p.published);

    if (author) result = result.filter(p => p.author.toLowerCase() === author.toLowerCase());
    if (tag) result = result.filter(p => p.tags.includes(tag));
    if (q) {
        const term = q.toLowerCase();
        result = result.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term)
        );
    }

    // Sorting — map sort key to comparator
    const sortMap = {
        'views': (a, b) => a.views - b.views,
        '-views': (a, b) => b.views - a.views,
        'createdAt': (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        '-createdAt': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        'title': (a, b) => a.title.localeCompare(b.title),
    };
    if (sort && sortMap[sort]) result.sort(sortMap[sort]);

    // Always sanitize before sending (strips internalNotes)
    result = sanitize(result);

    // Sparse fieldsets — return only requested fields
    if (fields) {
        const allowed = fields.split(',').map(f => f.trim());
        result = result.map(p =>
            allowed.reduce((obj, k) => { if (p[k] !== undefined) obj[k] = p[k]; return obj; }, {})
        );
    }

    const { data, meta } = paginate(result, req.query);
    res.json({ status: 'success', data, meta });
}));

/**
 * @swagger
 * /posts/stats:
 *   get:
 *     summary: Blog statistics
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Aggregated blog stats
 */
router.get('/stats', asyncHandler(async (req, res) => {
    const published = posts.filter(p => p.published);
    const totalViews = posts.reduce((s, p) => s + p.views, 0);
    const topPost = [...posts].sort((a, b) => b.views - a.views)[0];
    const allTags = [...new Set(posts.flatMap(p => p.tags))];

    const byAuthor = [...new Set(posts.map(p => p.author))].map(author => ({
        author,
        posts: posts.filter(p => p.author === author).length,
        totalViews: posts.filter(p => p.author === author).reduce((s, p) => s + p.views, 0),
    }));

    res.json({
        status: 'success',
        data: {
            totalPosts: posts.length,
            publishedPosts: published.length,
            draftPosts: posts.length - published.length,
            totalViews,
            avgViewsPerPost: Number((totalViews / posts.length).toFixed(1)),
            topPost: topPost ? { id: topPost.id, title: topPost.title, views: topPost.views } : null,
            uniqueTags: allTags,
            byAuthor,
        },
    });
}));

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID (increments view count)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post found
 *       404:
 *         description: Post not found
 */
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return next(new AppError('Post ID must be a number', 400, 'INVALID_ID'));

    const post = posts.find(p => p.id === id);
    if (!post) return next(new AppError(`Post ${id} not found`, 404, 'POST_NOT_FOUND'));

    post.views++; // increment view counter on every GET

    res.json({ status: 'success', data: sanitize(post) });
}));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new draft post (write key required)
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreatePost' }
 *     responses:
 *       201:
 *         description: Post created as draft
 *       400:
 *         description: Validation error
 *       403:
 *         description: Read-only API key
 */
router.post('/', writeLimiter, requireWrite, asyncHandler(async (req, res, next) => {
    const errors = validatePost(req.body, true);
    if (errors.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { title, content, author, tags } = req.body;
    const post = {
        id: nextId++,
        title,
        content,
        author,
        tags: Array.isArray(tags) ? tags : [],
        published: false,            // always starts as a draft
        views: 0,
        createdAt: new Date().toISOString(),
        internalNotes: '',
    };
    posts.push(post);

    res.status(201)
        .location(`/api/v1/posts/${post.id}`)
        .json({ status: 'success', data: sanitize(post) });
}));

/**
 * @swagger
 * /posts/{id}:
 *   patch:
 *     summary: Partial update a post (write key required)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Updated post
 *       400:
 *         description: Validation error
 *       404:
 *         description: Not found
 */
router.patch('/:id', writeLimiter, requireWrite, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Post ${id} not found`, 404, 'POST_NOT_FOUND'));

    // Validate only the fields that were actually sent
    const errors = validatePost(req.body, false);
    if (errors.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { title, content, author, tags } = req.body;
    posts[idx] = {
        ...posts[idx],
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(author !== undefined && { author }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date().toISOString(),
    };

    res.json({ status: 'success', data: sanitize(posts[idx]) });
}));

/**
 * @swagger
 * /posts/{id}/publish:
 *   post:
 *     summary: Publish a draft post (write key required)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Post published
 *       409:
 *         description: Already published
 */
router.post('/:id/publish', writeLimiter, requireWrite, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Post ${id} not found`, 404, 'POST_NOT_FOUND'));

    // 409 — already in the target state
    if (posts[idx].published)
        return next(new AppError('Post is already published', 409, 'ALREADY_PUBLISHED'));

    posts[idx].published = true;
    posts[idx].publishedAt = new Date().toISOString();

    res.json({
        status: 'success',
        message: `"${posts[idx].title}" is now published`,
        data: sanitize(posts[idx]),
    });
}));

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post (write key required)
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete('/:id', writeLimiter, requireWrite, asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = posts.findIndex(p => p.id === id);
    if (idx === -1) return next(new AppError(`Post ${id} not found`, 404, 'POST_NOT_FOUND'));
    posts.splice(idx, 1);
    res.status(204).end();
}));

module.exports = router;