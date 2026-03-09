require('dotenv').config();
const express = require('express');
const ordersRouter = require('./routes/orders');
const { notFound, errorHandler } = require('./middleware/handlers');
const { globalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/api/', globalLimiter);  // rate-limit all /api/* routes

app.use('/api/v1/orders', ordersRouter);
app.get('/', (req, res) => res.json({ name: 'Orders API', version: 'v1' }));

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => console.log(`Orders API → http://localhost:${PORT}`));