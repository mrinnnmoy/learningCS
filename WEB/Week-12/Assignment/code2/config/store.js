// Central in-memory data store for users and notes.
// Pre-seeded notes belong to users with id 1 and 2 (created after registration).

const users = [];

const notes = [
    { id: 1, userId: 1, title: 'Alice secret plan', body: 'Launch on Monday' },
    { id: 2, userId: 2, title: 'Bob private note', body: 'Password is hunter2' },
    { id: 3, userId: 1, title: 'Alice shopping', body: 'Milk, eggs, bread' },
];

let nextNoteId = 4;

module.exports = {
    users,
    notes,
    getNextNoteId: () => nextNoteId++,
};