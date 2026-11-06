const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Gallery item title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Classes', 'Events', 'Ceremonies', 'Workshops', 'Other'],
      default: 'Other',
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    // Server-side storage path
    imagePath: {
      type: String,
      select: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    altText: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
