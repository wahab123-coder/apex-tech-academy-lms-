const mongoose = require('mongoose');
const { SUBMISSION_STATUSES } = require('../config/constants');

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // File stored server-side, never directly accessible
    filePath: {
      type: String,
      select: false,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: 'Pending',
    },
    grade: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    feedback: {
      type: String,
      maxlength: [2000, 'Feedback cannot exceed 2000 characters'],
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// A student can only submit once per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
