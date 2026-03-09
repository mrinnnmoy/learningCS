require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const postsRouter = require('./routes/posts');
const { notFound, errorHandler, apiKeyAuth, globalLimiter } = require('./middleware/index');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use('/api/', globalLimiter);

// Swagger UI — no auth required
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Protected routes
app.use('/api/v1', apiKeyAuth);
app.use('/api/v1/posts', postsRouter);

app.get('/', (req, res) => res.json({
    name: 'Blog API', docs: `http://localhost:${PORT}/api/docs`,
    testKeys: { readOnly: 'key-read-only-abc123', write: 'key-write-xyz789' },
}));

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Blog API → http://localhost:${PORT}`);
    console.log(`Swagger UI → http://localhost:${PORT}/api/docs`);
});