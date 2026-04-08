const { db } = require('../lib/db');
const { posts, users, comments } = require('../drizzle/schema');
const { eq, isNull, and, sql, desc } = require('drizzle-orm');

// Valid status transitions — a post can only move forward, never backward
const VALID_TRANSITIONS = {
    DRAFT: 'PUBLISHED',
    PUBLISHED: 'ARCHIVED',
};

const createPost = async (title, body, authorId) => {
    const [post] = await db
        .insert(posts)
        .values({ title, body, authorId })
        // status defaults to DRAFT from the schema
        .returning();

    return post;
};

const getPosts = async ({ authorId, page = 1, limit = 10 } = {}) => {
    const offset = (Number(page) - 1) * Number(limit);

    // Build the where conditions dynamically
    // and() combines multiple conditions with AND
    const conditions = [
        eq(posts.status, 'PUBLISHED'),
        isNull(posts.deletedAt),
    ];

    if (authorId) {
        conditions.push(eq(posts.authorId, Number(authorId)));
    }

    // sql<number>`...` lets us write raw SQL expressions inline.
    // We use COUNT(comments.id) to get the comment count per post via the left join.
    // cast(...as int) converts the BigInt returned by COUNT to a regular JS number.
    const results = await db
        .select({
            id: posts.id,
            title: posts.title,
            status: posts.status,
            createdAt: posts.createdAt,
            authorName: users.name,
            authorEmail: users.email,
            commentCount: sql`cast(count(${comments.id}) as int)`,
        })
        .from(posts)
        // innerJoin: exclude posts whose author is soft-deleted
        .innerJoin(users, and(
            eq(posts.authorId, users.id),
            isNull(users.deletedAt)
        ))
        // leftJoin: include posts with 0 comments too
        .leftJoin(comments, and(
            eq(comments.postId, posts.id),
            isNull(comments.deletedAt)
        ))
        .where(and(...conditions))
        // groupBy is required when mixing selected columns with an aggregate (COUNT)
        .groupBy(posts.id, users.name, users.email)
        .orderBy(desc(posts.createdAt))
        .limit(Number(limit))
        .offset(offset);

    return results;
};

// Used internally to validate a post before status change or comment creation
const getPostById = async (id) => {
    const [post] = await db
        .select()
        .from(posts)
        .where(and(
            eq(posts.id, Number(id)),
            isNull(posts.deletedAt)
        ));

    return post || null;
};

const changeStatus = async (id, newStatus) => {
    const post = await getPostById(id);
    if (!post) return null;

    // Validate the transition is allowed
    if (VALID_TRANSITIONS[post.status] !== newStatus) {
        const err = new Error(`Cannot transition from ${post.status} to ${newStatus}. Expected: ${VALID_TRANSITIONS[post.status] || 'no further transitions'}`);
        err.status = 400;
        throw err;
    }

    const [updated] = await db
        .update(posts)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(posts.id, Number(id)))
        .returning();

    return updated;
};

module.exports = { createPost, getPosts, getPostById, changeStatus };