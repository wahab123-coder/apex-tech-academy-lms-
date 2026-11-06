const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    tags: [{ type: String, trim: true }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    readTime: {
      type: String, // e.g. "5 min read"
    },
  },
  { timestamps: true }
);

blogPostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  }
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
