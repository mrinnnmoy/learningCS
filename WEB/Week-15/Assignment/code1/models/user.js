const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');

// Fields safe to return to the client — password is always omitted
const safeSelect = {
    id: true,
    email: true,
    name: true,
    createdAt: true,
};

const createUser = async ({ email, name, password }) => {
    const hashed = await bcrypt.hash(password, 12);
    return prisma.user.create({
        data: { email, name, password: hashed },
        select: safeSelect,
    });
};

const getAllUsers = async () => {
    return prisma.user.findMany({
        select: {
            ...safeSelect,
            _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

const getUserById = async (id) => {
    return prisma.user.findUnique({
        where: { id: Number(id) },
        select: {
            ...safeSelect,
            posts: {
                where: { published: true },
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, views: true, createdAt: true },
            },
        },
    });
};

module.exports = { createUser, getAllUsers, getUserById };