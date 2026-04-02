const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('PostgreSQL connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ PostgreSQL connected');
    release();
});

module.exports = pool;