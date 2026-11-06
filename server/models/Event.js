const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ['Bootcamp', 'Workshop', 'Ceremony', 'Open Day', 'Career Event', 'Other'],
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String, // e.g. "9:00 AM"
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: null,
    },
    capacity: {
      type: Number,
      default: null,
    },
    registrations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    thumbnail: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
