// Central in-memory data store shared across all route files.
// Alice is pre-seeded so login can be tested without registering first.
// Her password is "password123".

const users = [
    {
        id: 1,
        email: 'alice@shop.com',
        // bcrypt hash of "password123" with 10 salt rounds
        password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        role: 'user',
    },
];

const products = [
    { id: 1, name: 'Laptop', price: 999, stock: 5 },
    { id: 2, name: 'Phone', price: 599, stock: 10 },
];

const orders = [];

let nextOrderId = 1;

module.exports = {
    users,
    products,
    orders,
    getNextOrderId: () => nextOrderId++,
};