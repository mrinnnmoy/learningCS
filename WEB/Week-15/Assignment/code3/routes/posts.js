const express = require('express');
const router = express.Router();
const { createPost, getPosts, changeStatus } = require('../models/post');
const { createComment } = require('../models/comment');

// POST /api/posts — create a post (always starts as DRAFT)
router.post('/', async (req, res, next) => {
    try {
        const { title, body, authorId } = req.body;

        if (!title || !body || !authorId) {
            return res.status(400).json({ message: 'title, body and authorId are required' });
        }

        res.status(201).json(await createPost(title, body, Number(authorId)));
    } catch (err) {
        // 23503 = foreign_key_violation — authorId doesn't exist
        if (err.code === '23503') {
            return res.status(404).json({ message: 'Author not found' });
        }
        next(err);
    }
});

// GET /api/posts — published posts with author name and comment count
router.get('/', async (req, res, next) => {
    try {
        const { authorId, page, limit } = req.query;
        res.json(await getPosts({ authorId, page, limit }));
    } catch (err) { next(err); }
});

// PATCH /api/posts/:id/status — transition post status
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const allowed = ['PUBLISHED', 'ARCHIVED'];

        if (!allowed.includes(status)) {
            return res.status(400).json({ message: `status must be one of: ${allowed.join(', ')}` });
        }

        const post = await changeStatus(Number(req.params.id), status);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        res.json(post);
    } catch (err) {
        if (err.status === 400) return res.status(400).json({ message: err.message });
        next(err);
    }
});

// POST /api/posts/:id/comments — add a comment to a published post
router.post('/:id/comments', async (req, res, next) => {
    try {
        const { userId, body } = req.body;

        if (!userId || !body) {
            return res.status(400).json({ message: 'userId and body are required' });
        }

        res.status(201).json(
            await createComment(Number(req.params.id), Number(userId), body)
        );
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        // 23503 = userId doesn't exist in users table
        if (err.code === '23503') return res.status(404).json({ message: 'User not found' });
        next(err);
    }
});

module.exports = router;