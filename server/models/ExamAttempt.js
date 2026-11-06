const mongoose = require('mongoose');

/**
 * ExamAttempt — a student's attempt at a final exam.
 * Stores MCQ answers (auto-graded), essay answers (instructor-graded),
 * overall score, pass/fail status, and instructor remarks.
 */

const essayAnswerSchema = new mongoose.Schema({
  questionId:  { type: mongoose.Schema.Types.ObjectId },
  answer:      { type: String, default: '' },
  marks:       { type: Number, default: null },
  feedback:    { type: String },
}, { _id: true });

const examAttemptSchema = new mongoose.Schema(
  {
    exam: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Exam',
      required: true,
    },
    student: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    course: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true,
    },
    mcqAnswers:     [{ type: Number, default: -1 }],
    essayAnswers:   { type: [essayAnswerSchema], default: [] },
    mcqScore:       { type: Number, default: 0 },
    mcqCorrect:     { type: Number, default: 0 },
    essayScore:     { type: Number, default: null },
    totalScore:     { type: Number, default: null },
    totalMarks:     { type: Number, default: 0 },
    percentage:     { type: Number, default: null },
    status: {
      type:     String,
      enum:     ['in-progress', 'submitted', 'graded', 'passed', 'failed'],
      default:  'in-progress',
    },
    // Instructor remarks on the overall attempt
    remarks:        { type: String, default: '' },
    startedAt:       { type: Date, default: Date.now },
    submittedAt:    { type: Date, default: null },
    gradedAt:       { type: Date, default: null },
    gradedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    autoSubmitted:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
