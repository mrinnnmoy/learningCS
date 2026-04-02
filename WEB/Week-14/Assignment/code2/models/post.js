const pool = require('../db');

const createPost = async ({ authorId, title, body, tags = [] }) => {
    const result = await pool.query(
        `INSERT INTO posts (author_id, title, body, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [authorId, title, body, tags]
    );
    return result.rows[0];
};

const getPosts = async ({ tag, page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;

    // $1::TEXT IS NULL OR $1 = ANY(p.tags)
    // ANY(array) checks if the value exists anywhere in the array column.
    // If no tag filter is given, the IS NULL check makes the condition always true.
    const [countResult, dataResult] = await Promise.all([
        pool.query(
            `SELECT COUNT(*) FROM posts p
       WHERE ($1::TEXT IS NULL OR $1 = ANY(p.tags))`,
            [tag || null]
        ),
        pool.query(
            `SELECT
         p.id, p.title, p.body, p.tags, p.views, p.created_at,
         u.id   AS author_id,
         u.name AS author_name,
         u.email AS author_email,
         COUNT(c.id)::INTEGER AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE ($1::TEXT IS NULL OR $1 = ANY(p.tags))
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
            [tag || null, limit, offset]
        ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    // Shape the author into a nested object for a cleaner API response
    const data = dataResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        body: row.body,
        tags: row.tags,
        views: row.views,
        created_at: row.created_at,
        comment_count: row.comment_count,
        author: {
            id: row.author_id,
            name: row.author_name,
            email: row.author_email,
        },
    }));

    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

const getPostById = async (id) => {
    // We need a client (not pool.query) to run a transaction
    const client = await require('../db').connect();
    try {
        await client.query('BEGIN');

        // Increment views atomically and return the updated post with author
        const postResult = await client.query(
            `UPDATE posts SET views = views + 1 WHERE id = $1
       RETURNING *`,
            [id]
        );

        if (postResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return null;
        }

        // Fetch author details
        const authorResult = await client.query(
            `SELECT id, name, email FROM users WHERE id = $1`,
            [postResult.rows[0].author_id]
        );

        // Fetch all comments with commenter names
        const commentsResult = await client.query(
            `SELECT c.id, c.body, c.created_at, u.name AS commenter_name, u.email AS commenter_email
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
            [id]
        );

        await client.query('COMMIT');

        return {
            ...postResult.rows[0],
            author: authorResult.rows[0],
            comments: commentsResult.rows,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const deletePost = async (id) => {
    const result = await pool.query(
        'DELETE FROM posts WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rowCount > 0;
};

module.exports = { createPost, getPosts, getPostById, deletePost };