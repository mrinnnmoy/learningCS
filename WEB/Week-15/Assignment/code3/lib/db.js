require('dotenv').config();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('../drizzle/schema');

if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL is not set in .env');
    process.exit(1);
}

// postgres() creates a connection pool automatically
const connection = postgres(process.env.DATABASE_URL);

// drizzle() wraps the connection with the query builder
// Passing { schema } enables the relational query API (db.query.*)
const db = drizzle(connection, { schema });

module.exports = { db };