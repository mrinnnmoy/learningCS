const prisma = require('../lib/prisma');

const placeOrder = async (userId, items) => {
    return prisma.$transaction(async (tx) => {
        const lineItems = [];
        let total = 0;

        for (const item of items) {
            const product = await tx.product.findUnique({
                where: { id: Number(item.productId) },
            });

            if (!product) throw Object.assign(new Error(`Product ${item.productId} not found`), { status: 404 });
            if (product.stock < item.quantity) {
                throw Object.assign(
                    new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`),
                    { status: 400 }
                );
            }

            await tx.product.update({
                where: { id: product.id },
                data: { stock: { decrement: item.quantity } },
            });

            const price = parseFloat(product.price.toString());
            lineItems.push({ productId: product.id, name: product.name, price, quantity: item.quantity });
            total += price * item.quantity;
        }

        return tx.order.create({
            data: {
                userId: Number(userId),
                total: parseFloat(total.toFixed(2)),
                status: 'PENDING',
                items: { create: lineItems },
            },
            include: { items: true },
        });
    });
};

const updateStatus = async (id, status) => {
    return prisma.order.update({
        where: { id: Number(id) },
        data: { status },
    });
};

module.exports = { placeOrder, updateStatus };