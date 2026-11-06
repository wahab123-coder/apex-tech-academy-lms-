const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
      unique: true,
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
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    // Server-side PDF path
    pdfPath: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Receipt', receiptSchema);
