const mongoose = require('mongoose');
const { MATERIAL_TYPES } = require('../config/constants');

const materialSchema = new mongoose.Schema(
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: MATERIAL_TYPES,
      required: true,
    },
    // For files: server-side path (not publicly accessible directly)
    filePath: {
      type: String,
      select: false, // Only sent when generating a signed URL
    },
    // Public URL or signed URL (generated on demand, not stored long-term)
    fileUrl: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number, // bytes
    },
    mimeType: {
      type: String,
    },
    // Video duration in seconds (populated from Cloudinary response)
    duration: {
      type: Number,
      default: null,
    },
    // For link-type materials
    externalUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
