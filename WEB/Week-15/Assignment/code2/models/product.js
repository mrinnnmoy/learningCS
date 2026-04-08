const prisma = require('../lib/prisma');

const createProduct = async ({ name, price, stock, category, tags = [] }) => {
    return prisma.product.create({
        data: {
            name, price, stock: Number(stock), category,
            tags: {
                connectOrCreate: tags.map(t => ({
                    where: { name: t },
                    create: { name: t },
                })),
            },
        },
        include: { tags: true },
    });
};

const getProducts = async ({ category } = {}) => {
    return prisma.product.findMany({
        where: category ? { category } : undefined,
        include: {
            tags: true,
            _count: { select: { orderItems: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
};

module.exports = { createProduct, getProducts };