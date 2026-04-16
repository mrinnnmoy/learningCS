const {
    pgTable, serial, text, numeric, integer, timestamp, pgEnum,
} = require('drizzle-orm/pg-core');
const { relations } = require('drizzle-orm');

const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
const orderStatusEnum = pgEnum('order_status', ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: roleEnum('role').default('USER').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    category: text('category').notNull(),
    stock: integer('stock').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').notNull().references(() => users.id),
    total: numeric('total', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    name: text('name').notNull(),
});

const usersRelations = relations(users, ({ many }) => ({ orders: many(orders) }));
const ordersRelations = relations(orders, ({ one, many }) => ({ user: one(users, { fields: [orders.userId], references: [users.id] }), items: many(orderItems) }));
const orderItemRelations = relations(orderItems, ({ one }) => ({ order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }), product: one(products, { fields: [orderItems.productId], references: [products.id] }) }));

module.exports = { roleEnum, orderStatusEnum, users, products, orders, orderItems, usersRelations, ordersRelations, orderItemRelations };