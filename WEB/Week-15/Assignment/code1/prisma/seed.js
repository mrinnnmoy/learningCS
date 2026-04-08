const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const alice = await prisma.user.upsert({
        where: { email: 'alice@example.com' },
        update: {},
        create: {
            email: 'alice@example.com',
            name: 'Alice',
            password: await bcrypt.hash('password123', 12),
        },
    });

    const bob = await prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
            email: 'bob@example.com',
            name: 'Bob',
            password: await bcrypt.hash('password123', 12),
        },
    });

    await prisma.post.createMany({
        data: [
            { title: 'Getting started with Prisma', body: 'Prisma makes database access easy...', published: true, authorId: alice.id },
            { title: 'PostgreSQL tips', body: 'Here are some PostgreSQL tips...', published: true, authorId: alice.id },
            { title: 'Draft post', body: 'Work in progress...', published: false, authorId: bob.id },
        ],
        skipDuplicates: true,
    });

    console.log('✅ Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());