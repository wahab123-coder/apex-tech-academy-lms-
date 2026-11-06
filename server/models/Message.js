const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = sent to admin inbox
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
