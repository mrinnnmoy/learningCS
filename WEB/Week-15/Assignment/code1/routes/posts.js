const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPostById, togglePublish, deletePost } = require('../models/post');

router.post('/', async (req, res, next) => {
    try {
        const { title, body, authorId } = req.body;
        if (!title || !body || !authorId) {
            return res.status(400).json({ message: 'title, body and authorId are required' });
        }
        const post = await createPost({ title, body, authorId });
        res.status(201).json(post);
    } catch (err) {
        if (err.code === 'P2003') return res.status(404).json({ message: 'Author not found' });
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        res.json(await getPosts(req.query));
    } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
    try {
        const post = await getPostById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) { next(err); }
});

router.patch('/:id/publish', async (req, res, next) => {
    try {
        const post = await togglePublish(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await deletePost(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ message: 'Post not found' });
        next(err);
    }
});

module.exports = router;