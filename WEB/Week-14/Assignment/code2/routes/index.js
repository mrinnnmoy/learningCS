const express = require('express');
const router = express.Router();
const { createUser } = require('../models/user');
const { createPost, getPosts, getPostById, deletePost } = require('../models/post');
const { createComment } = require('../models/comment');

// ── Users ─────────────────────────────────────────────────────────────────────

router.post('/users', async (req, res, next) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ message: 'email and name are required' });
        }
        const user = await createUser({ email, name });
        res.status(201).json(user);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email already in use' });
        }
        next(err);
    }
});

// ── Posts ─────────────────────────────────────────────────────────────────────

router.post('/posts', async (req, res, next) => {
    try {
        const { authorId, title, body, tags } = req.body;
        if (!authorId || !title || !body) {
            return res.status(400).json({ message: 'authorId, title, and body are required' });
        }
        const post = await createPost({ authorId, title, body, tags });
        res.status(201).json(post);
    } catch (err) {
        // 23503 = foreign_key_violation — authorId doesn't exist in users
        if (err.code === '23503') {
            return res.status(404).json({ message: 'Author not found' });
        }
        next(err);
    }
});

router.get('/posts', async (req, res, next) => {
    try {
        const { tag, page, limit } = req.query;
        const result = await getPosts({ tag, page, limit });
        res.json(result);
    } catch (err) {
        next(err);
    }
});

router.get('/posts/:id', async (req, res, next) => {
    try {
        const post = await getPostById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) {
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

router.delete('/posts/:id', async (req, res, next) => {
    try {
        const deleted = await deletePost(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted' });
    } catch (err) {
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

// ── Comments ──────────────────────────────────────────────────────────────────

router.post('/posts/:id/comments', async (req, res, next) => {
    try {
        const { userId, body } = req.body;
        if (!userId || !body) {
            return res.status(400).json({ message: 'userId and body are required' });
        }
        const comment = await createComment({ postId: req.params.id, userId, body });
        res.status(201).json(comment);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(404).json({ message: 'Post or user not found' });
        }
        if (err.code === '22P02') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        next(err);
    }
});

module.exports = router;