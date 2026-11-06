const mongoose = require('mongoose');

/**
 * Exam — Final examination for a course.
 *
 * Structure per spec:
 *   - 60 MCQs at 1 mark each = 60 marks (objective section)
 *   - Essay questions with additional marks
 *   - Total marks = MCQ marks + essay marks
 *   - Duration: 60 minutes
 *   - Passing score: configurable (default 50%)
 *   - Questions prepared from the course curriculum
 *   - Instructor remarks field on each attempt
 */

const mcqSchema = new mongoose.Schema({
  question:       { type: String, required: true, trim: true },
  options:        [{ type: String, required: true }],
  correctAnswer:  { type: Number, required: true },
  marks:          { type: Number, default: 1 },
  topic:          { type: String, trim: true },
}, { _id: true });

const essaySchema = new mongoose.Schema({
  question:     { type: String, required: true, trim: true },
  marks:        { type: Number, default: 10 },
  topic:        { type: String, trim: true },
  modelAnswer:  { type: String },
}, { _id: true });

const examSchema = new mongoose.Schema(
  {
    course: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true,
      unique:   true,
    },
    title: {
      type:     String,
      required: true,
      default:  'Final Assessment',
      trim:      true,
    },
    description:    { type: String, trim: true },
    durationMinutes:{ type: Number, default: 60 },
    passingScore:   { type: Number, default: 50 },
    totalMCQs:       { type: Number, default: 60 },
    mcqMarksEach:    { type: Number, default: 1 },
    mcqs:            { type: [mcqSchema],  default: [] },
    essays:          { type: [essaySchema], default: [] },
    isPublished:     { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

examSchema.virtual('mcqTotalMarks').get(function () {
  return this.mcqs.length * this.mcqMarksEach;
});

examSchema.virtual('essayTotalMarks').get(function () {
  return this.essays.reduce((sum, e) => sum + (e.marks || 0), 0);
});

examSchema.virtual('totalMarks').get(function () {
  return this.mcqTotalMarks + this.essayTotalMarks;
});

examSchema.virtual('totalQuestions').get(function () {
  return this.mcqs.length + this.essays.length;
});

module.exports = mongoose.model('Exam', examSchema);
