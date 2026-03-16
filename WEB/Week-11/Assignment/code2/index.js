require('dotenv').config();
const express = require('express');
const { router: authRouter } = require('./routes/auth');
const postsRouter = require('./routes/posts');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/posts', postsRouter);

app.get('/', (req, res) => res.json({ name: 'Auth + RBAC API — Week 11 A2' }));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[A2] API → http://localhost:${PORT}`));