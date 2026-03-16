// Zod v4 — trim/toLowerCase MUST come before .email()
const { z } = require('zod');

const registerSchema = z.object({
    name: z
        .string({ required_error: 'name is required' })
        .trim()
        .min(2, 'name must be at least 2 characters')
        .max(50, 'name must be at most 50 characters'),

    email: z
        .string({ required_error: 'email is required' })
        .trim()
        .toLowerCase()
        .email('must be a valid email address'),

    password: z
        .string({ required_error: 'password is required' })
        .min(8, 'password must be at least 8 characters')
        .regex(/[A-Z]/, 'must contain at least one uppercase letter')
        .regex(/[0-9]/, 'must contain at least one number'),

    role: z
        .enum(['user', 'editor', 'admin'])
        .default('user'),
});

const loginSchema = z.object({
    email: z.string({ required_error: 'email is required' })
        .trim().toLowerCase().email('must be a valid email'),
    password: z.string({ required_error: 'password is required' })
        .min(1, 'password is required'),
});

const refreshSchema = z.object({
    refreshToken: z.string({ required_error: 'refreshToken is required' })
        .min(1, 'refreshToken cannot be empty'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };