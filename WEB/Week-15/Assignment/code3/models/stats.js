const { db } = require('../lib/db');
const { sql } = require('drizzle-orm');

// db.execute(sql`...`) sends raw SQL to the database.
// Use this when Drizzle's query builder can't express the query cleanly
// — complex aggregations, EXTRACT, subqueries, etc.
// sql`` is a tagged template literal — it safely parameterizes any ${value} interpolations.

const getStats = async () => {
    // 1. Post count grouped by status (includes soft-deleted excluded)
    const postsByStatus = await db.execute(sql`
    SELECT
      status,
      COUNT(*)::int AS count
    FROM posts
    WHERE deleted_at IS NULL
    GROUP BY status
    ORDER BY count DESC
  `);

    // 2. Users registered per month for the current year
    const usersByMonth = await db.execute(sql`
    SELECT
      EXTRACT(MONTH FROM created_at)::int AS month,
      COUNT(*)::int                        AS count
    FROM users
    WHERE deleted_at IS NULL
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
    GROUP BY month
    ORDER BY month
  `);

    // 3. Average number of comments per published post
    // We use a subquery to first count comments per post,
    // then average those counts — a two-level aggregation.
    const avgComments = await db.execute(sql`
    SELECT
      ROUND(AVG(comment_count), 2) AS avg_comments_per_post
    FROM (
      SELECT
        p.id,
        COUNT(c.id) AS comment_count
      FROM posts p
      LEFT JOIN comments c
        ON c.post_id = p.id
        AND c.deleted_at IS NULL
      WHERE p.status    = 'PUBLISHED'
        AND p.deleted_at IS NULL
      GROUP BY p.id
    ) sub
  `);

    return {
        postsByStatus: postsByStatus.rows,
        usersByMonth: usersByMonth.rows,
        avgCommentsPerPost: avgComments.rows[0]?.avg_comments_per_post ?? 0,
    };
};

module.exports = { getStats };