const mongoose = require('mongoose');
const { COURSE_LEVELS } = require('../config/constants');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor is required'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    level: {
      type: String,
      enum: COURSE_LEVELS,
      default: 'Beginner',
    },
    category: {
      type: String,
      trim: true,
    },
    duration: {
      type: String, // e.g. "6 months"
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String, trim: true }],
    totalStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
