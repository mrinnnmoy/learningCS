const express = require('express');
const router = express.Router();

// In-memory "database"
let books = [
    { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', genre: 'Tech', year: 1999 },
    { id: 2, title: 'Clean Code', author: 'Robert Martin', genre: 'Tech', year: 2008 },
    { id: 3, title: 'Dune', author: 'Frank Herbert', genre: 'Sci-Fi', year: 1965 },
];
let nextId = 4;

// GET /books — list all, optional ?genre= and ?author= filters
router.get('/', (req, res) => {
    const { genre, author } = req.query;

    let result = [...books];
    if (genre) result = result.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
    if (author) result = result.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));

    res.status(200).json({
        status: 'success',
        count: result.length,
        data: result,
    });
});

// GET /books/:id — get one book
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({
            status: 'fail', statusCode: 404,
            message: `Book with id ${id} not found`,
        });
    }

    res.status(200).json({ status: 'success', data: book });
});

// POST /books — create a new book
router.post('/', (req, res) => {
    const { title, author, genre, year } = req.body;

    // Validation — title and author are required
    if (!title || !author) {
        return res.status(400).json({
            status: 'fail', statusCode: 400,
            message: 'title and author are required fields',
        });
    }

    const newBook = {
        id: nextId++,
        title,
        author,
        genre: genre || 'Unknown',
        year: year || null,
    };
    books.push(newBook);

    // 201 Created + Location header pointing to the new resource
    res.status(201)
        .location(`/books/${newBook.id}`)
        .json({ status: 'success', data: newBook });
});

// PUT /books/:id — replace entire book
router.put('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: 'fail', statusCode: 404,
            message: `Book with id ${id} not found`,
        });
    }

    const { title, author, genre, year } = req.body;
    if (!title || !author) {
        return res.status(400).json({
            status: 'fail', statusCode: 400,
            message: 'title and author are required',
        });
    }

    // Replace the whole record — idempotent
    books[index] = { id, title, author, genre: genre || 'Unknown', year: year || null };
    res.status(200).json({ status: 'success', data: books[index] });
});

// PATCH /books/:id — partial update (only send fields you want to change)
router.patch('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: 'fail', statusCode: 404,
            message: `Book with id ${id} not found`,
        });
    }

    // Spread existing data then overwrite only provided fields
    books[index] = { ...books[index], ...req.body, id };
    res.status(200).json({ status: 'success', data: books[index] });
});

// DELETE /books/:id
router.delete('/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: 'fail', statusCode: 404,
            message: `Book with id ${id} not found`,
        });
    }

    books.splice(index, 1);
    res.status(204).end(); // 204 = success, no body
});

module.exports = router;