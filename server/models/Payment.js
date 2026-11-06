const mongoose = require('mongoose');
const { PAYMENT_STATUSES } = require('../config/constants');

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    // Provider reference — used for backend verification
    providerReference: {
      type: String,
      trim: true,
    },
    // Provider webhook data (stored for audit)
    providerData: {
      type: mongoose.Schema.Types.Mixed,
      select: false,
    },
    paymentMethod: {
      type: String,
      trim: true, // e.g. 'card', 'bank_transfer'
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'Pending',
    },
    // IMPORTANT: status is only set to Verified by server after webhook/server confirmation
    verifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String, // 'webhook' | admin user id
      default: null,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
