const pool = require('../db');

const placeOrder = async (userId, items) => {
    // We need a single client for the entire transaction.
    // pool.query() could use a different connection for each call,
    // which would break transaction state.
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const lineItems = [];
        let total = 0;

        for (const item of items) {
            // SELECT ... FOR UPDATE locks this row for the duration of the transaction.
            // If two requests try to buy the last unit simultaneously, one waits
            // for the other's lock to release before proceeding — prevents overselling.
            const { rows } = await client.query(
                `SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE`,
                [item.productId]
            );

            if (rows.length === 0) {
                await client.query('ROLLBACK');
                throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 404 });
            }

            const product = rows[0];

            if (product.stock < item.quantity) {
                await client.query('ROLLBACK');
                throw Object.assign(
                    new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`),
                    { status: 400 }
                );
            }

            // Decrement stock
            await client.query(
                `UPDATE products SET stock = stock - $1 WHERE id = $2`,
                [item.quantity, item.productId]
            );

            lineItems.push({
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                quantity: item.quantity,
            });

            total += parseFloat(product.price) * item.quantity;
        }

        // Create the order
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total) VALUES ($1, $2) RETURNING *`,
            [userId, total.toFixed(2)]
        );
        const order = orderResult.rows[0];

        // Insert all line items
        for (const item of lineItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
                [order.id, item.productId, item.quantity, item.price]
            );
        }

        await client.query('COMMIT');

        return { ...order, lineItems };
    } catch (err) {
        // ROLLBACK is idempotent — safe to call even if already rolled back above
        await client.query('ROLLBACK').catch(() => { });
        throw err;
    } finally {
        client.release();
    }
};

const updateOrderStatus = async (id, status) => {
    const result = await pool.query(
        `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
    );
    return result.rows[0] || null;
};

module.exports = { placeOrder, updateOrderStatus };