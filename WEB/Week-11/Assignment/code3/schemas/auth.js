const { z } = require('zod');

const registerSchema = z.object({
    name: z.string({ required_error: 'name is required' }).trim().min(2).max(50),
    email: z.string({ required_error: 'email is required' }).trim().toLowerCase().email('must be a valid email'),
    password: z.string({ required_error: 'password is required' }).min(8).regex(/[A-Z]/, 'needs uppercase').regex(/[0-9]/, 'needs number'),
    role: z.enum(['user', 'editor', 'admin']).default('user'),
});

const loginSchema = z.object({
    email: z.string({ required_error: 'email is required' }).trim().toLowerCase().email('must be a valid email'),
    password: z.string({ required_error: 'password is required' }).min(1),
});

const refreshSchema = z.object({
    refreshToken: z.string({ required_error: 'refreshToken is required' }).min(1),
});

const changePasswordSchema = z.object({
    currentPassword: z.string({ required_error: 'currentPassword is required' }).min(1),
    newPassword: z.string({ required_error: 'newPassword is required' }).min(8)
        .regex(/[A-Z]/, 'needs uppercase').regex(/[0-9]/, 'needs number'),
});

module.exports = { registerSchema, loginSchema, refreshSchema, changePasswordSchema };