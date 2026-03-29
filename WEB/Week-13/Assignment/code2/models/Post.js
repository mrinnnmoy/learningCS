const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
    },
    // Reference to the User who authored this post
    // Mongoose uses this ref to know which model to use during .populate()
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
      index: true, // index because we will query by authorId
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index on tags for fast tag filtering
postSchema.index({ tags: 1 });

// Index on createdAt for fast sorting
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
