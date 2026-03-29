require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const orderRoutes     = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes      = require('./routes/auth');

const app = express();
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is not set in .env');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    process.exit(1);
  }
};

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders',    orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth',      authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Week 13 — Assignment 3: E-Commerce Dashboard',
    routes: [
      'POST   /api/orders',
      'PUT    /api/orders/:id/status',
      'GET    /api/dashboard/revenue',
      'GET    /api/dashboard/top-products',
      'GET    /api/dashboard/users',
      'POST   /api/auth/forgot-password',
      'POST   /api/auth/verify-otp',
    ],
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Run 'npm run seed' to populate test data`);
  });
});
