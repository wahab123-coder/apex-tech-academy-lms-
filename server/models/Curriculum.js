const mongoose = require('mongoose');

/**
 * Curriculum — structured course outline per course.
 * Each course has one Curriculum document containing an array of weeks.
 * Each week has a title and an array of topics.
 *
 * Structure:
 *   Curriculum
 *     └── course (ref)
 *     └── weeks[]
 *           ├── weekNumber
 *           ├── title        e.g. "Week 1: Introduction to HTML"
 *           ├── description  (optional overview)
 *           └── topics[]
 *                 ├── title       e.g. "HTML Document Structure"
 *                 ├── duration    e.g. "2 hours"
 *                 └── type        lecture | practical | assignment | quiz
 */

const topicSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  duration: { type: String, trim: true },
  type: {
    type:    String,
    enum:    ['lecture', 'practical', 'assignment', 'quiz', 'project'],
    default: 'lecture',
  },
  isPublished: { type: Boolean, default: true },
}, { _id: true });

const weekSchema = new mongoose.Schema({
  weekNumber:  { type: Number, required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  topics:      { type: [topicSchema], default: [] },
  isPublished: { type: Boolean, default: true },
}, { _id: true });

const curriculumSchema = new mongoose.Schema(
  {
    course: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true,
      unique:   true, // one curriculum per course
    },
    overview: {
      type:      String,
      trim:      true,
      maxlength: [2000, 'Overview cannot exceed 2000 characters'],
    },
    totalWeeks:  { type: Number, default: 0 },
    totalHours:  { type: String, trim: true },
    weeks:       { type: [weekSchema], default: [] },
    isPublished: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-update totalWeeks count before save
curriculumSchema.pre('save', function (next) {
  this.totalWeeks = this.weeks.length;
  next();
});

module.exports = mongoose.model('Curriculum', curriculumSchema);
