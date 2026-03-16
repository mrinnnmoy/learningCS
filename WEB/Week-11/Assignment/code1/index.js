require('dotenv').config();
const express = require('express');
const { router: authRouter } = require('./routes/auth');
const usersRouter = require('./routes/users');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => res.json({ name: 'Auth API — Week 11 A1' }));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`[A1] Auth API → http://localhost:${PORT}`));