const pool = require('../db');

// CREATE
const createProduct = async ({ name, price, category, stock }) => {
    const result = await pool.query(
        `INSERT INTO products (name, price, category, stock)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [name, price, category || null, stock ?? 0]
    );
    return result.rows[0];
};

// READ ALL — optional category filter
const getAllProducts = async (category) => {
    const result = await pool.query(
        `SELECT * FROM products
     WHERE ($1::TEXT IS NULL OR category = $1)
     ORDER BY created_at DESC`,
        [category || null]
    );
    return result.rows;
};

// READ ONE
const getProductById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

// UPDATE
const updateProduct = async (id, { name, price, category, stock }) => {
    const result = await pool.query(
        `UPDATE products
     SET
       name     = COALESCE($1, name),
       price    = COALESCE($2, price),
       category = COALESCE($3, category),
       stock    = COALESCE($4, stock)
     WHERE id = $5
     RETURNING *`,
        [name, price, category, stock, id]
        // COALESCE returns the first non-null value.
        // If $1 is null (not provided), the column keeps its existing value.
        // This gives us a true partial update without separate logic.
    );
    return result.rows[0] || null;
};

// DELETE
const deleteProduct = async (id) => {
    const result = await pool.query(
        'DELETE FROM products WHERE id = $1 RETURNING id',
        [id]
    );
    return result.rowCount > 0;
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };