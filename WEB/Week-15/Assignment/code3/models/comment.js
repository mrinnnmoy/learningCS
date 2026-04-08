const { db } = require('../lib/db');
const { comments } = require('../drizzle/schema');
const { getPostById } = require('./post');

const createComment = async (postId, userId, body) => {
    // Always validate that the post is accessible and in the right state
    // before inserting — this is a business rule, not just a FK constraint
    const post = await getPostById(postId);

    if (!post) {
        const err = new Error('Post not found');
        err.status = 404;
        throw err;
    }

    if (post.status !== 'PUBLISHED') {
        const err = new Error('Can only comment on published posts');
        err.status = 400;
        throw err;
    }

    const [comment] = await db
        .insert(comments)
        .values({ postId: Number(postId), userId: Number(userId), body })
        .returning();

    return comment;
};

module.exports = { createComment };