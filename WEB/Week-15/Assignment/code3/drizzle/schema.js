const {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    integer,
    pgEnum,
} = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

// ── Enums ─────────────────────────────────────────────────────────────────────
// pgEnum creates a real PostgreSQL ENUM type in the database.
// The first argument is the type name in the DB, the second is the allowed values.
const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
const statusEnum = pgEnum('post_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

// ── Tables ────────────────────────────────────────────────────────────────────
const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').default('USER').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    // deletedAt is nullable — NULL means the user is active, a date means soft-deleted
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

const posts = pgTable('posts', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    status: statusEnum('status').default('DRAFT').notNull(),
    authorId: integer('author_id').notNull().references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

const comments = pgTable('comments', {
    id: serial('id').primaryKey(),
    postId: integer('post_id').notNull().references(() => posts.id),
    userId: integer('user_id').notNull().references(() => users.id),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// ── Relations ─────────────────────────────────────────────────────────────────
// Relations are not stored in the DB — they tell Drizzle's query builder
// how to join tables when you use db.query.* (relational API).
const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    comments: many(comments),
}));

const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, { fields: [posts.authorId], references: [users.id] }),
    comments: many(comments),
}));

const commentsRelations = relations(comments, ({ one }) => ({
    post: one(posts, { fields: [comments.postId], references: [posts.id] }),
    user: one(users, { fields: [comments.userId], references: [users.id] }),
}));

module.exports = {
    roleEnum,
    statusEnum,
    users,
    posts,
    comments,
    usersRelations,
    postsRelations,
    commentsRelations,
};