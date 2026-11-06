const mongoose = require('mongoose');
const { APPLICATION_STATUSES } = require('../config/constants');

const admissionSchema = new mongoose.Schema(
  {
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
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true, // null until approved
    },
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Pending',
    },
    // Personal statement / motivation
    statement: {
      type: String,
      maxlength: [2000, 'Statement cannot exceed 2000 characters'],
    },
    // Admin who approved/rejected
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    admissionDate: {
      type: Date,
      default: null,
    },
    // Path to generated admission letter PDF (server-side)
    letterPath: {
      type: String,
      select: false,
      default: null,
    },
    letterGeneratedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String, // Admin internal notes
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
