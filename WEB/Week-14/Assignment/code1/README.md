# How to Build.

```
Step 1 — Initialise the project
  mkdir code1 && cd code1
  npm init -y
  npm install express pg dotenv
  npm install --save-dev nodemon

Step 2 — Create the database
  psql -U postgres
  CREATE DATABASE week14_easy;
  CREATE USER week14user WITH PASSWORD 'yourpassword';
  GRANT ALL PRIVILEGES ON DATABASE week14_easy TO week14user;
  \q

Step 3 — Write schema.sql
  Create the file with your CREATE TABLE statement.
  Run it:  psql -U week14user -d week14_easy -f schema.sql

Step 4 — Create .env
  DATABASE_URL=postgresql://week14user:yourpassword@localhost:5432/week14_easy
  PORT=3000

Step 5 — Create db.js
  Set up a Pool using process.env.DATABASE_URL. Export the pool.

Step 6 — Create models/product.js
  Write async functions: createProduct, getAllProducts, getProductById,
  updateProduct, deleteProduct. Each uses pool.query() with parameterized SQL.

Step 7 — Create routes/products.js
  Wire up the 5 Express routes. Each calls the model function and handles errors.

Step 8 — Create server.js
  require dotenv, require express, mount the router on /api/products.
  Start listening after testing the DB connection.

Step 9 — Test in Postman
  POST, GET all, GET one, PUT, DELETE. Verify 404 on missing IDs.
  Try creating a product with a duplicate name (if unique) and verify error handling.
```