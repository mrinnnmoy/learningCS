require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const requestId = require('./middleware/requestId');
const requestLogger = require('./middleware/requestLogger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3002;

// ─── Middleware stack (order matters!) ────────────────────────────────
app.use(requestId);                              // 1. attach UUID to every req
app.use(express.json());                         // 2. parse JSON bodies
app.use(express.urlencoded({ extended: true })); // 3. parse form data
app.use(morgan(process.env.LOG_LEVEL || 'dev')); // 4. morgan HTTP logger
app.use(requestLogger);                          // 5. custom colored logger

// ─── Routes ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        message: 'Users API',
        requestId: req.requestId,
        endpoints: [
            'GET /users', 'GET /users/:id',
            'POST /users', 'PATCH /users/:id', 'DELETE /users/:id',
            'GET /users/crash/now  ← test error handler',
        ],
    });
});
app.use('/users', usersRouter);

// ─── 404 + error handler (always last) ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`\nUsers API on http://localhost:${PORT}`);
    console.log('Stack: requestId → json → urlencoded → morgan → requestLogger\n');
});