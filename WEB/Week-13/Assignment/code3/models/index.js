const mongoose = require('mongoose');

// ── User ──────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String },
    role:         { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// ── Product ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    price:    { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    stock:    { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true }
);

// ── Order ─────────────────────────────────────────────────────────────────────
const lineItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:      String,   // denormalised snapshot
    price:     Number,   // price at time of purchase
    quantity:  Number,
  },
  { _id: false } // sub-documents in an array don't need their own _id
);

const orderSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lineItems: [lineItemSchema],
    total:     { type: Number, required: true },
    status:    {
      type:    String,
      enum:    ['pending', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// ── PasswordResetToken ────────────────────────────────────────────────────────
// The TTL index on createdAt tells MongoDB to delete this document
// automatically after 600 seconds (10 minutes).
const passwordResetTokenSchema = new mongoose.Schema({
  email:     { type: String, required: true, index: true },
  token:     { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // expires in 600 seconds
});

module.exports = {
  User:               mongoose.model('User', userSchema),
  Product:            mongoose.model('Product', productSchema),
  Order:              mongoose.model('Order', orderSchema),
  PasswordResetToken: mongoose.model('PasswordResetToken', passwordResetTokenSchema),
};
