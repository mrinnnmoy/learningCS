const prisma = require('../lib/prisma');

const authorSelect = { select: { id: true, name: true, email: true } };

const createPost = async ({ title, body, authorId }) => {
    return prisma.post.create({
        data: { title, body, authorId: Number(authorId) },
        include: { author: authorSelect },
    });
};

const getPosts = async ({ search, page = 1, limit = 10 }) => {
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
        published: true,
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [posts, total] = await prisma.$transaction([
        prisma.post.findMany({
            where,
            include: { author: authorSelect },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit),
        }),
        prisma.post.count({ where }),
    ]);

    return { data: posts, page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) };
};

const getPostById = async (id) => {
    // Increment views and return the updated post atomically
    return prisma.$transaction(async (tx) => {
        const post = await tx.post.findUnique({ where: { id: Number(id) } });
        if (!post) return null;
        return tx.post.update({
            where: { id: Number(id) },
            data: { views: { increment: 1 } },
            include: { author: authorSelect },
        });
    });
};

const togglePublish = async (id) => {
    const post = await prisma.post.findUnique({ where: { id: Number(id) } });
    if (!post) return null;
    return prisma.post.update({
        where: { id: Number(id) },
        data: { published: !post.published },
    });
};

const deletePost = async (id) => {
    return prisma.post.delete({ where: { id: Number(id) } });
};

module.exports = { createPost, getPosts, getPostById, togglePublish, deletePost };