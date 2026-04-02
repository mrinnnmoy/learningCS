const pool = require('../db');

// Upsert a daily stock movement log entry.
// ON CONFLICT (product_id, log_date) means: if a row already exists for this
// product on today's date, don't insert — instead, ADD the new quantity to
// the existing one. This accumulates all restocks in a single daily row.
const logStockMovement = async (productId, quantity) => {
    // First update the actual product stock
    const productResult = await pool.query(
        `UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING id, name, stock`,
        [quantity, productId]
    );

    if (productResult.rowCount === 0) return null;

    // Then upsert the daily log entry
    const logResult = await pool.query(
        `INSERT INTO product_stock_log (product_id, quantity, action, log_date)
     VALUES ($1, $2, 'restock', CURRENT_DATE)
     ON CONFLICT (product_id, log_date)
     DO UPDATE SET quantity = product_stock_log.quantity + EXCLUDED.quantity
     RETURNING *`,
        [productId, quantity]
    );

    return {
        product: productResult.rows[0],
        log: logResult.rows[0],
    };
};

module.exports = { logStockMovement };