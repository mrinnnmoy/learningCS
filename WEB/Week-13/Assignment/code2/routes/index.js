const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── User Routes ───────────────────────────────────────────────────────────────

// POST /api/users — Create a user
router.post('/users', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    // Duplicate email — MongoDB error code 11000
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    next(err);
  }
});

// ── Post Routes ───────────────────────────────────────────────────────────────

// POST /api/posts — Create a post
router.post('/posts', async (req, res, next) => {
  try {
    const { title, body, authorId, tags } = req.body;

    if (!isValidId(authorId)) {
      return res.status(400).json({ message: 'Invalid authorId format' });
    }

    // Verify the author exists before creating the post
    const authorExists = await User.exists({ _id: authorId });
    if (!authorExists) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const post = await Post.create({ title, body, authorId, tags });

    // Populate the author's name and email into the response
    // select('name email -_id') means: include name and email, exclude _id
    await post.populate('authorId', 'name email -_id');

    // Rename authorId to author in the response for cleaner output
    const response = post.toObject();
    response.author = response.authorId;
    delete response.authorId;

    res.status(201).json(response);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// GET /api/posts — Get all posts with pagination, tag filter, and sorting
router.get('/posts', async (req, res, next) => {
  try {
    // Parse query parameters — provide safe defaults
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip  = (page - 1) * limit;

    // Only allow sorting by known fields to prevent injection
    const allowedSorts = ['views', 'createdAt'];
    const sortField = allowedSorts.includes(req.query.sort) ? req.query.sort : 'createdAt';
    const sortOrder = -1; // always descending (newest/most viewed first)

    // Build filter object
    const filter = {};
    if (req.query.tag) {
      // $in matches if the tags array contains the requested tag
      filter.tags = { $in: [req.query.tag] };
    }

    // Run the count and the paginated query in parallel for performance
    const [total, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .populate('authorId', 'name email')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .select('-__v'), // exclude Mongoose internal version field
    ]);

    res.json({
      data:       posts,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id — Get one post (and increment views)
router.get('/posts/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // findByIdAndUpdate + $inc + { new: true } in a single atomic operation
    // This is safer than: find, modify views in JS, then save — which has a race condition
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // atomically increment views by 1
      { new: true }           // return the document AFTER the update
    ).populate('authorId', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id — Delete a post
router.delete('/posts/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
