const { db } = require('../lib/db');
const { users, posts, comments } = require('../drizzle/schema');
const { eq, isNull } = require('drizzle-orm');
const bcrypt = require('bcrypt');

// Fields safe to return to the client — passwordHash is always excluded
const safeFields = {
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    createdAt: users.createdAt,
};

const createUser = async (email, name, password) => {
    const passwordHash = await bcrypt.hash(password, 12);

    // .returning() specifies which columns to return after insert
    // We use safeFields so the passwordHash is never returned
    const [user] = await db
        .insert(users)
        .values({ email, name, passwordHash, role: 'USER' })
        .returning(safeFields);

    return user;
};

const getAllUsers = async () => {
    // isNull() generates: WHERE deleted_at IS NULL
    return db
        .select(safeFields)
        .from(users)
        .where(isNull(users.deletedAt))
        .orderBy(users.createdAt);
};

const softDeleteUser = async (id) => {
    const now = new Date();

    // Soft delete cascades: user → their posts → their comments
    // We do all three updates. Order matters — if a post's authorId is gone,
    // we still want to mark the post deleted too.
    await db
        .update(users)
        .set({ deletedAt: now })
        .where(eq(users.id, id));

    await db
        .update(posts)
        .set({ deletedAt: now })
        .where(eq(posts.authorId, id));

    await db
        .update(comments)
        .set({ deletedAt: now })
        .where(eq(comments.userId, id));

    return { message: 'User and all related content soft deleted' };
};

module.exports = { createUser, getAllUsers, softDeleteUser };