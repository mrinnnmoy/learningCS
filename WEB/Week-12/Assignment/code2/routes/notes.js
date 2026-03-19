// Notes CRUD routes.

const express = require('express');
const store = require('../config/store');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notes/:id — get a single note by ID.
//
// FIX — IDOR (Insecure Direct Object Reference):
//   The original vulnerable code found the note by ID and returned it
//   with no check on who owned it. Any authenticated user could read
//   any other user's notes by incrementing the ID in the URL.
//
//   Fix: after finding the note, compare note.userId against req.user.userId.
//   req.user.userId comes from the verified JWT — the client cannot forge it.
//   If they don't match, return 403 before any data is sent.
router.get('/:id', auth, (req, res) => {
    const note = store.notes.find(n => n.id === parseInt(req.params.id, 10));

    if (!note) {
        return res.status(404).json({ message: 'Not found' });
    }

    // Ownership check — the requesting user must own this note.
    if (note.userId !== req.user.userId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(note);
});

// POST /api/notes — create a new note.
//
// FIX — Mass Assignment on note creation:
//   The original code spread the entire req.body: { ...req.body }
//   An attacker could send { userId: 1 } to claim ownership of a note
//   as another user, or inject any other field into the stored object.
//
//   Fix: only accept title and body from the request body.
//   userId is always taken from req.user.userId (the verified JWT).
router.post('/', auth, (req, res) => {
    const { title, body } = req.body; // only these two fields are accepted

    if (!title || !body) {
        return res.status(400).json({ message: 'title and body are required' });
    }

    const note = {
        id: store.getNextNoteId(),
        userId: req.user.userId, // always from the verified JWT, never from the body
        title,
        body,
    };
    store.notes.push(note);

    res.status(201).json(note);
});

module.exports = router;