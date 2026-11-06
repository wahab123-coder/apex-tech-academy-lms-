const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
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
    tags: [{ type: String, trim: true }],
    thumbnail: {
      type: String,
      default: null,
    },
    repoUrl: {
      type: String,
      default: null,
    },
    liveUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Review', 'Published', 'Rejected'],
      default: 'Review',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
