const { PrismaClient } = require('@prisma/client');

const prisma = globalThis.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

module.exports = prisma;