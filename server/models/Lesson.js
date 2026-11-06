const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
      required: true,
    },
    duration: {
      type: String, // e.g. "45 min"
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Unique order per course
lessonSchema.index({ course: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
