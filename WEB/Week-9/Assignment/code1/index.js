require('dotenv').config();
const express = require('express');
const productsRouter = require('./routes/products');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

app.use('/api/v1/products', productsRouter);
app.get('/', (req, res) => res.json({ name: 'Products API', version: 'v1' }));

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => console.log(`Products API → http://localhost:${PORT}`));