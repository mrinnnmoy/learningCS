const express = require('express');
const router = express.Router();
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ── In-memory store ───────────────────────────────────────────────────────────
let tasks = [
    { id: 1, title: 'Learn Express', status: 'done', priority: 'high' },
    { id: 2, title: 'Build a REST API', status: 'in-progress', priority: 'high' },
    { id: 3, title: 'Write unit tests', status: 'todo', priority: 'medium' },
    { id: 4, title: 'Deploy to Railway', status: 'todo', priority: 'low' },
];
let nextId = 5;

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// ── Field-level validator ─────────────────────────────────────────────────────
function validateTask(body, requireAll = true) {
    const details = [];

    if (requireAll || body.title !== undefined) {
        if (!body.title || body.title.trim() === '')
            details.push({ field: 'title', message: 'title is required' });
        else if (body.title.trim().length < 3)
            details.push({ field: 'title', message: 'title must be at least 3 characters' });
    }

    if (requireAll || body.status !== undefined) {
        if (!body.status)
            details.push({ field: 'status', message: 'status is required' });
        else if (!VALID_STATUSES.includes(body.status))
            details.push({ field: 'status', message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority))
        details.push({ field: 'priority', message: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });

    return details;
}

// ── GET /tasks ────────────────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const { status, priority } = req.query;

    let result = [...tasks];
    if (status) result = result.filter(t => t.status === status);
    if (priority) result = result.filter(t => t.priority === priority);

    res.json({ status: 'success', count: result.length, data: result });
}));

// ── GET /tasks/:id ────────────────────────────────────────────────────────────
// Demonstrates: sync throw for non-numeric ID, next(AppError) for not-found
router.get('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);

    // Synchronous validation — Express (via asyncHandler) catches sync throws
    if (isNaN(id) || id <= 0) {
        throw new AppError('Task ID must be a positive number', 400, 'INVALID_ID');
    }

    const task = tasks.find(t => t.id === id);
    if (!task) return next(new AppError(`Task ${id} not found`, 404, 'TASK_NOT_FOUND'));

    res.json({ status: 'success', data: task });
}));

// ── POST /tasks ───────────────────────────────────────────────────────────────
// Demonstrates: field-level validation errors, 409 Conflict for duplicate title
router.post('/', asyncHandler(async (req, res, next) => {
    const errors = validateTask(req.body, true);
    if (errors.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { title, status, priority } = req.body;

    // 409 — duplicate title (case-insensitive)
    const duplicate = tasks.find(
        t => t.title.toLowerCase() === title.trim().toLowerCase()
    );
    if (duplicate) {
        return next(new AppError(`A task titled "${title}" already exists`, 409, 'DUPLICATE_TASK'));
    }

    const task = {
        id: nextId++,
        title: title.trim(),
        status,
        priority: priority || 'medium',
    };
    tasks.push(task);

    res.status(201)
        .location(`/tasks/${task.id}`)
        .json({ status: 'success', data: task });
}));

// ── PATCH /tasks/:id ──────────────────────────────────────────────────────────
router.patch('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return next(new AppError(`Task ${id} not found`, 404, 'TASK_NOT_FOUND'));

    const errors = validateTask(req.body, false);
    if (errors.length > 0) {
        const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        err.details = errors;
        return next(err);
    }

    const { title, status, priority } = req.body;
    tasks[idx] = {
        ...tasks[idx],
        ...(title !== undefined && { title: title.trim() }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
    };

    res.json({ status: 'success', data: tasks[idx] });
}));

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res, next) => {
    const id = Number(req.params.id);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return next(new AppError(`Task ${id} not found`, 404, 'TASK_NOT_FOUND'));

    tasks.splice(idx, 1);
    res.status(204).end();
}));

// ── GET /tasks/crash/programmer ───────────────────────────────────────────────
// Deliberately triggers a TypeError (non-operational programmer error).
// Development → full stack trace in response.
// Production  → generic "Something went wrong" (internals hidden).
router.get('/crash/programmer', asyncHandler(async (req, res) => {
    const obj = null;
    return obj.id; // TypeError: Cannot read properties of null (reading 'id')
}));

// ── GET /tasks/crash/operational ─────────────────────────────────────────────
// Deliberately throws an AppError (operational).
// Both dev AND prod → client always sees the message.
router.get('/crash/operational', asyncHandler(async (req, res) => {
    throw new AppError(
        'This is an intentional operational error — safe to show to client',
        503,
        'SERVICE_UNAVAILABLE'
    );
}));

module.exports = router;