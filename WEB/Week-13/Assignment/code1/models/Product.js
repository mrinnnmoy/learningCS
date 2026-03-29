const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      enum: {
        values: ['electronics', 'clothing', 'food', 'books'],
        message: '{VALUE} is not a valid category. Choose from: electronics, clothing, food, books',
      },
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
