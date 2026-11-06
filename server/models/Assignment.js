const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    instructions: {
      type: String,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
