const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { CERTIFICATE_STATUSES } = require('../config/constants');

const certificateSchema = new mongoose.Schema(
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
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    // Globally unique certificate ID for public verification
    certificateId: {
      type: String,
      unique: true,
      default: () => `CERT-ATA-${uuidv4().split('-')[0].toUpperCase()}`,
    },
    status: {
      type: String,
      enum: CERTIFICATE_STATUSES,
      default: 'Pending',
    },
    grade: {
      type: String, // e.g. 'Distinction', 'Merit', 'Pass'
    },
    issuedAt: {
      type: Date,
      default: null,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Server-side PDF path — never exposed directly
    pdfPath: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// One certificate per student per course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
