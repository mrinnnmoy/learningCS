require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/products');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Database Connection ───────────────────────────────────────────────────────
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('FATAL: MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Week 13 — Assignment 1: Products API' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must have 4 parameters — Express identifies error handlers by arity
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
