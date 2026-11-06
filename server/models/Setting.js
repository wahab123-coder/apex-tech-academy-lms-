const mongoose = require('mongoose');

/**
 * Setting — key-value store for configurable academy settings.
 * Used for session timeout, passing score defaults, etc.
 */
const settingSchema = new mongoose.Schema(
  {
    key: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    value: {
      type:     String,
      required: true,
    },
    label:       { type: String, trim: true },
    description: { type: String, trim: true },
    category:    { type: String, default: 'general', trim: true },
    updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
