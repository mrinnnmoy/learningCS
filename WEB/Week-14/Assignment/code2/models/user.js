const pool = require('../db');

const createUser = async ({ email, name }) => {
    const result = await pool.query(
        `INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *`,
        [email, name]
    );
    return result.rows[0];
};

module.exports = { createUser };