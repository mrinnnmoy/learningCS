require('dotenv').config();
const express = require('express');
const morgan = require('morgan');

const requestId = require('./middleware/requestId');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Core middleware (order matters!) ──────────────────────────────────────────
app.use(requestId);                              // 1. attach UUID
app.use(express.json());                         // 2. parse JSON bodies
app.use(express.urlencoded({ extended: true })); // 3. parse form bodies
app.use(morgan('dev'));                          // 4. HTTP request log

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        name: 'Tasks API — Week 10 A1',
        requestId: req.requestId,
        endpoints: {
            'GET    /tasks': 'List all tasks (?status, ?priority)',
            'GET    /tasks/:id': 'Get one task',
            'POST   /tasks': 'Create task (title, status required)',
            'PATCH  /tasks/:id': 'Partial update',
            'DELETE /tasks/:id': 'Delete task → 204',
            'GET    /tasks/crash/programmer': 'Trigger TypeError (hidden in prod)',
            'GET    /tasks/crash/operational': 'Trigger AppError (always visible)',
        },
    });
});

app.use('/tasks', tasksRouter);

// ── Error handling (always last) ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Process-level handlers ────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`[A1] Tasks API on http://localhost:${PORT} — NODE_ENV=${process.env.NODE_ENV}`);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION — shutting down');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION — shutting down');
    console.error(reason);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received — closing server');
    server.close(() => process.exit(0));
});