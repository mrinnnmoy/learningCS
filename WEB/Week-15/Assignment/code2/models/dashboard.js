const prisma = require('../lib/prisma');

const getStats = async () => {
    const [revenueResult, ordersByStatus, topProducts] = await prisma.$transaction([
        // Total revenue from delivered orders
        prisma.order.aggregate({
            _sum: { total: true },
            where: { status: 'DELIVERED' },
        }),
        // Order count grouped by status
        prisma.order.groupBy({
            by: ['status'],
            _count: { _all: true },
        }),
        // Top 3 products by units sold
        prisma.orderItem.groupBy({
            by: ['productId', 'name'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 3,
        }),
    ]);

    return {
        totalRevenue: revenueResult._sum.total ?? 0,
        ordersByStatus: ordersByStatus.map(r => ({ status: r.status, count: r._count._all })),
        topProducts: topProducts.map(r => ({ productId: r.productId, name: r.name, totalSold: r._sum.quantity })),
    };
};

module.exports = { getStats };