const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const alice = await prisma.user.upsert({
        where: { email: 'alice@example.com' }, update: {},
        create: { email: 'alice@example.com', name: 'Alice' },
    });
    const bob = await prisma.user.upsert({
        where: { email: 'bob@example.com' }, update: {},
        create: { email: 'bob@example.com', name: 'Bob' },
    });

    const products = [
        { name: 'Laptop', price: 999.99, stock: 10, category: 'electronics', tags: ['tech', 'computers'] },
        { name: 'Phone', price: 599.99, stock: 25, category: 'electronics', tags: ['tech', 'mobile'] },
        { name: 'T-Shirt', price: 29.99, stock: 100, category: 'clothing', tags: ['fashion'] },
        { name: 'JS Book', price: 49.99, stock: 50, category: 'books', tags: ['tech', 'education'] },
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { id: (await prisma.product.findFirst({ where: { name: p.name } }))?.id ?? 0 },
            update: {},
            create: {
                name: p.name,
                price: p.price,
                stock: p.stock,
                category: p.category,
                tags: { connectOrCreate: p.tags.map(t => ({ where: { name: t }, create: { name: t } })) },
            },
        });
    }

    console.log('✅ Seeded users and products');
}

main().catch(console.error).finally(() => prisma.$disconnect());