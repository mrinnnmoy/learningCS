require('dotenv').config();
const express = require('express');
const booksRouter = require('./routes/books');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json()); // parse JSON request bodies

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Books API is running',
        version: '1.0',
        endpoints: ['/books'],
    });
});
app.use('/books', booksRouter);

// 404 + error handler (always last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Books API running on http://localhost:${PORT}`);
});