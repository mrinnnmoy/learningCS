// seed.js — populates the DB with sample data for testing the dashboard
// Run with: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Product, Order } = require('./models');

const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const users = await User.insertMany([
    { name: 'Alice',   email: 'alice@example.com',   role: 'user' },
    { name: 'Bob',     email: 'bob@example.com',     role: 'user' },
    { name: 'Charlie', email: 'charlie@example.com', role: 'admin' },
  ]);
  console.log(`Created ${users.length} users`);

  // Create products
  const products = await Product.insertMany([
    { name: 'Laptop',       price: 999,  category: 'electronics', stock: 50 },
    { name: 'Phone',        price: 599,  category: 'electronics', stock: 100 },
    { name: 'Headphones',   price: 149,  category: 'electronics', stock: 200 },
    { name: 'T-Shirt',      price: 29,   category: 'clothing',    stock: 500 },
    { name: 'Running Shoes',price: 89,   category: 'clothing',    stock: 300 },
    { name: 'JavaScript Book', price: 49, category: 'books',      stock: 150 },
  ]);
  console.log(`Created ${products.length} products`);

  // Create orders spread across months this year
  const year = new Date().getFullYear();
  const orders = [];

  for (let month = 0; month < 6; month++) {
    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length];
      const product1 = products[i % products.length];
      const product2 = products[(i + 1) % products.length];
      const qty1 = Math.ceil(Math.random() * 3);
      const qty2 = Math.ceil(Math.random() * 2);
      const total = product1.price * qty1 + product2.price * qty2;

      orders.push({
        userId: user._id,
        lineItems: [
          { productId: product1._id, name: product1.name, price: product1.price, quantity: qty1 },
          { productId: product2._id, name: product2.name, price: product2.price, quantity: qty2 },
        ],
        total,
        status:    'delivered', // mark as delivered so dashboard queries include them
        createdAt: new Date(year, month, Math.ceil(Math.random() * 28)),
      });
    }
  }

  // Use insertMany with timestamps: false to preserve our custom createdAt dates
  await Order.collection.insertMany(orders);
  console.log(`Created ${orders.length} orders`);

  console.log('\n✅ Seed complete. User IDs for testing:');
  users.forEach(u => console.log(`  ${u.name}: ${u._id}`));
  console.log('\nProduct IDs for testing:');
  products.forEach(p => console.log(`  ${p.name} (stock: ${p.stock}): ${p._id}`));

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
