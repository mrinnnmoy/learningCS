const pool = require('../db');

// Revenue and order count grouped by month for the current year (delivered orders only)
const revenueByMonth = async () => {
    const result = await pool.query(
        `SELECT
       EXTRACT(MONTH FROM created_at)::INTEGER AS month,
       SUM(total)::NUMERIC(12,2)               AS revenue,
       COUNT(*)::INTEGER                        AS orders
     FROM orders
     WHERE status = 'delivered'
       AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
     GROUP BY EXTRACT(MONTH FROM created_at)
     ORDER BY month`
    );
    return result.rows;
};

// Top 5 products by quantity sold across all delivered orders
const topProducts = async () => {
    const result = await pool.query(
        `SELECT
       p.name,
       SUM(oi.quantity)::INTEGER                    AS total_sold,
       SUM(oi.quantity * oi.price)::NUMERIC(12, 2)  AS total_revenue
     FROM order_items oi
     JOIN orders  o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     WHERE o.status = 'delivered'
     GROUP BY p.id, p.name
     ORDER BY total_sold DESC
     LIMIT 5`
    );
    return result.rows;
};

// Per category: product count, average price, total stock
const categoryStats = async () => {
    const result = await pool.query(
        `SELECT
       c.name                           AS category,
       COUNT(p.id)::INTEGER             AS product_count,
       ROUND(AVG(p.price), 2)           AS avg_price,
       SUM(p.stock)::INTEGER            AS total_stock
     FROM categories c
     JOIN products p ON p.category_id = c.id
     GROUP BY c.id, c.name
     HAVING COUNT(p.id) > 0
     ORDER BY product_count DESC`
    );
    return result.rows;
};

// Top 10 customers by total spend using the RANK() window function
// Window functions compute a value across a set of rows related to the current row
// without collapsing them into a single row the way GROUP BY does.
// RANK() OVER (ORDER BY SUM(total) DESC) assigns a rank number to each customer
// based on their total spend — rank 1 = highest spender.
const topCustomers = async () => {
    const result = await pool.query(
        `SELECT
       RANK() OVER (ORDER BY SUM(o.total) DESC)::INTEGER AS rank,
       u.name,
       u.email,
       COUNT(o.id)::INTEGER                              AS order_count,
       SUM(o.total)::NUMERIC(12, 2)                      AS total_spend
     FROM users u
     JOIN orders o ON o.user_id = u.id
     WHERE o.status = 'delivered'
     GROUP BY u.id, u.name, u.email
     ORDER BY rank
     LIMIT 10`
    );
    return result.rows;
};

module.exports = { revenueByMonth, topProducts, categoryStats, topCustomers };