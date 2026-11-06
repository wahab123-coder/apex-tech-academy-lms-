const Exam        = require('../models/Exam');
const ExamAttempt = require('../models/ExamAttempt');
const Course      = require('../models/Course');
const Enrollment  = require('../models/Enrollment');

// ── Helper: strip correct answers before sending to student ──
function stripAnswers(exam) {
  const obj = exam.toObject();
  obj.mcqs = obj.mcqs.map((m) => ({
    _id: m._id, question: m.question, options: m.options, marks: m.marks, topic: m.topic,
  }));
  return obj;
}

// ── Helper: auto-submit when time expires ──
async function autoSubmitAttempt(attempt, exam) {
  attempt.submittedAt  = new Date();
  attempt.status       = 'submitted';
  attempt.autoSubmitted = true;

  let mcqScore = 0, correct = 0;
  exam.mcqs.forEach((mcq, i) => {
    if (attempt.mcqAnswers[i] === mcq.correctAnswer) {
      mcqScore += mcq.marks || exam.mcqMarksEach;
      correct++;
    }
  });
  attempt.mcqScore   = mcqScore;
  attempt.mcqCorrect = correct;

  if (exam.essays.length === 0) {
    attempt.essayScore = 0;
    attempt.totalScore = mcqScore;
    attempt.percentage  = Math.round((mcqScore / exam.totalMarks) * 100);
    attempt.status      = attempt.percentage >= exam.passingScore ? 'passed' : 'failed';
    attempt.gradedAt   = new Date();
  }
  await attempt.save();
}

// ══════════════════════════════════════════════════════════
//  ADMIN / INSTRUCTOR — Exam Management
// ══════════════════════════════════════════════════════════

exports.getExams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.course = req.query.courseId;
    if (req.user.role === 'instructor') {
      const myCourses = await Course.find({ instructor: req.user.id }).select('_id');
      filter.course = { $in: myCourses.map((c) => c._id) };
    }
    const exams = await Exam.find(filter).populate('course', 'title level').sort({ createdAt: -1 });
    res.json({ success: true, count: exams.length, exams });
  } catch (err) { next(err); }
};

exports.getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'title');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    res.json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.createExam = async (req, res, next) => {
  try {
    const { courseId, title, description, durationMinutes, passingScore } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    const existing = await Exam.findOne({ course: courseId });
    if (existing) return res.status(409).json({ success: false, message: 'Exam already exists for this course.' });
    const exam = await Exam.create({
      course: courseId, title: title || 'Final Assessment', description,
      durationMinutes: durationMinutes || 60, passingScore: passingScore || 50, createdBy: req.user.id,
    });
    res.status(201).json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    const { title, description, durationMinutes, passingScore, isPublished } = req.body;
    if (title !== undefined) exam.title = title;
    if (description !== undefined) exam.description = description;
    if (durationMinutes !== undefined) exam.durationMinutes = durationMinutes;
    if (passingScore !== undefined) exam.passingScore = passingScore;
    if (isPublished !== undefined) exam.isPublished = isPublished;
    await exam.save();
    res.json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.addMCQ = async (req, res, next) => {
  try {
    const { question, options, correctAnswer, marks, topic } = req.body;
    if (!question || !options || options.length < 2 || correctAnswer === undefined) {
      return res.status(400).json({ success: false, message: 'Question, options, and correct answer are required.' });
    }
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    exam.mcqs.push({ question, options, correctAnswer, marks: marks || exam.mcqMarksEach, topic: topic || '' });
    exam.totalMCQs = exam.mcqs.length;
    await exam.save();
    res.status(201).json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.deleteMCQ = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    exam.mcqs = exam.mcqs.filter((m) => m._id.toString() !== req.params.mcqId);
    exam.totalMCQs = exam.mcqs.length;
    await exam.save();
    res.json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.addEssay = async (req, res, next) => {
  try {
    const { question, marks, topic, modelAnswer } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Essay question required.' });
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    exam.essays.push({ question, marks: marks || 10, topic: topic || '', modelAnswer: modelAnswer || '' });
    await exam.save();
    res.status(201).json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.deleteEssay = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    exam.essays = exam.essays.filter((e) => e._id.toString() !== req.params.essayId);
    await exam.save();
    res.json({ success: true, exam });
  } catch (err) { next(err); }
};

exports.deleteExam = async (req, res, next) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    await ExamAttempt.deleteMany({ exam: req.params.id });
    res.json({ success: true, message: 'Exam and all attempts deleted.' });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  STUDENT — Take Exam
// ══════════════════════════════════════════════════════════

exports.getStudentExams = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id, status: 'Active' });
    const courseIds = enrollments.map((e) => e.course);
    const exams = await Exam.find({ course: { $in: courseIds }, isPublished: true })
      .populate('course', 'title level')
      .select('-mcqs.correctAnswer');

    const examsWithStatus = await Promise.all(
      exams.map(async (exam) => {
        const attempt = await ExamAttempt.findOne({ exam: exam._id, student: req.user.id });
        return {
          ...exam.toObject(),
          attemptStatus: attempt ? attempt.status : 'not-started',
          attemptId: attempt?._id || null,
          score: attempt?.percentage || null,
        };
      })
    );
    res.json({ success: true, count: examsWithStatus.length, exams: examsWithStatus });
  } catch (err) { next(err); }
};

exports.startExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'title');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });
    if (!exam.isPublished) return res.status(403).json({ success: false, message: 'Exam not yet available.' });

    const enrolled = await Enrollment.findOne({ student: req.user.id, course: exam.course._id, status: 'Active' });
    if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });

    let attempt = await ExamAttempt.findOne({ exam: exam._id, student: req.user.id });

    if (attempt && ['submitted', 'graded', 'passed', 'failed'].includes(attempt.status)) {
      return res.status(409).json({
        success: false, message: 'You have already completed this exam.',
        attemptId: attempt._id, status: attempt.status, score: attempt.percentage,
      });
    }

    if (attempt && attempt.status === 'in-progress') {
      const elapsed = Date.now() - new Date(attempt.startedAt).getTime();
      if (elapsed > exam.durationMinutes * 60 * 1000) {
        await autoSubmitAttempt(attempt, exam);
        return res.status(409).json({
          success: false, message: 'Exam time expired. Answers auto-submitted.',
          attemptId: attempt._id, status: attempt.status,
        });
      }
      return res.json({
        success: true, attemptId: attempt._id, exam: stripAnswers(exam),
        startedAt: attempt.startedAt, durationMinutes: exam.durationMinutes,
        mcqAnswers: attempt.mcqAnswers, essayAnswers: attempt.essayAnswers,
      });
    }

    attempt = await ExamAttempt.create({
      exam: exam._id, student: req.user.id, course: exam.course._id,
      status: 'in-progress', totalMarks: exam.totalMarks,
      mcqAnswers: new Array(exam.mcqs.length).fill(-1),
    });

    res.status(201).json({
      success: true, attemptId: attempt._id, exam: stripAnswers(exam),
      startedAt: attempt.startedAt, durationMinutes: exam.durationMinutes,
      mcqAnswers: attempt.mcqAnswers, essayAnswers: attempt.essayAnswers,
    });
  } catch (err) { next(err); }
};

// Auto-save (student saves progress without submitting)
exports.saveProgress = async (req, res, next) => {
  try {
    const { mcqAnswers, essayAnswers } = req.body;
    const attempt = await ExamAttempt.findOne({ exam: req.params.examId, student: req.user.id });
    if (!attempt || attempt.status !== 'in-progress') {
      return res.status(400).json({ success: false, message: 'No active attempt found.' });
    }
    if (mcqAnswers) attempt.mcqAnswers = mcqAnswers;
    if (essayAnswers) attempt.essayAnswers = essayAnswers;
    await attempt.save();
    res.json({ success: true, message: 'Progress saved.' });
  } catch (err) { next(err); }
};

exports.submitExam = async (req, res, next) => {
  try {
    const { mcqAnswers, essayAnswers } = req.body;
    const attempt = await ExamAttempt.findOne({ exam: req.params.examId, student: req.user.id });
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    if (['submitted', 'graded', 'passed', 'failed'].includes(attempt.status)) {
      return res.status(409).json({ success: false, message: 'Already submitted.' });
    }

    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    attempt.mcqAnswers = mcqAnswers || attempt.mcqAnswers;
    attempt.essayAnswers = essayAnswers || attempt.essayAnswers;
    attempt.submittedAt = new Date();
    attempt.status = 'submitted';

    let mcqScore = 0, correct = 0;
    exam.mcqs.forEach((mcq, i) => {
      if (attempt.mcqAnswers[i] === mcq.correctAnswer) {
        mcqScore += mcq.marks || exam.mcqMarksEach;
        correct++;
      }
    });
    attempt.mcqScore = mcqScore;
    attempt.mcqCorrect = correct;

    if (exam.essays.length === 0) {
      attempt.essayScore = 0;
      attempt.totalScore = mcqScore;
      attempt.percentage = Math.round((mcqScore / exam.totalMarks) * 100);
      attempt.status = attempt.percentage >= exam.passingScore ? 'passed' : 'failed';
      attempt.gradedAt = new Date();
    }

    await attempt.save();

    res.json({
      success: true,
      message: exam.essays.length > 0
        ? 'Exam submitted. MCQs auto-graded. Essays pending instructor grading.'
        : `Exam graded. Score: ${attempt.percentage}% — ${attempt.status === 'passed' ? 'PASSED' : 'FAILED'}.`,
      attemptId: attempt._id, status: attempt.status,
      mcqScore: attempt.mcqScore, mcqCorrect: attempt.mcqCorrect,
      totalScore: attempt.totalScore, percentage: attempt.percentage,
    });
  } catch (err) { next(err); }
};

exports.getExamResult = async (req, res, next) => {
  try {
    const attempt = await ExamAttempt.findOne({ exam: req.params.examId, student: req.user.id })
      .populate('exam', 'title mcqs essays passingScore totalMarks')
      .populate('course', 'title');
    if (!attempt) return res.status(404).json({ success: false, message: 'No attempt found.' });

    const result = {
      attemptId: attempt._id, status: attempt.status,
      startedAt: attempt.startedAt, submittedAt: attempt.submittedAt,
      mcqScore: attempt.mcqScore, mcqCorrect: attempt.mcqCorrect,
      essayScore: attempt.essayScore, totalScore: attempt.totalScore,
      percentage: attempt.percentage, passingScore: attempt.exam.passingScore,
      totalMarks: attempt.exam.totalMarks, mcqCount: attempt.exam.mcqs.length,
      essayCount: attempt.exam.essays.length, autoSubmitted: attempt.autoSubmitted,
      remarks: attempt.remarks,
    };

    if (['graded', 'passed', 'failed'].includes(attempt.status)) {
      result.mcqReview = attempt.exam.mcqs.map((mcq, i) => ({
        question: mcq.question, yourAnswer: attempt.mcqAnswers[i],
        correctAnswer: mcq.correctAnswer, isCorrect: attempt.mcqAnswers[i] === mcq.correctAnswer,
        options: mcq.options,
      }));
      if (attempt.essayAnswers.length > 0) {
        result.essayReview = attempt.essayAnswers.map((ea, i) => ({
          question: attempt.exam.essays[i]?.question,
          yourAnswer: ea.answer, marks: ea.marks, feedback: ea.feedback,
          maxMarks: attempt.exam.essays[i]?.marks,
        }));
      }
    }
    res.json({ success: true, result });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  INSTRUCTOR — Grading
// ══════════════════════════════════════════════════════════

exports.getExamAttempts = async (req, res, next) => {
  try {
    const attempts = await ExamAttempt.find({ exam: req.params.id })
      .populate('student', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ submittedAt: -1 });
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) { next(err); }
};

exports.gradeAttempt = async (req, res, next) => {
  try {
    const { essayGrades, remarks } = req.body;
    const attempt = await ExamAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });

    const exam = await Exam.findById(attempt.exam);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found.' });

    let essayTotal = 0;
    if (essayGrades) {
      essayGrades.forEach((eg) => {
        const ea = attempt.essayAnswers.find((a) => a.questionId?.toString() === eg.questionId);
        if (ea) {
          ea.marks = eg.marks;
          ea.feedback = eg.feedback || '';
          essayTotal += eg.marks || 0;
        }
      });
    }

    attempt.essayScore = essayTotal;
    attempt.totalScore = attempt.mcqScore + essayTotal;
    attempt.percentage = Math.round((attempt.totalScore / exam.totalMarks) * 100);
    attempt.status = attempt.percentage >= exam.passingScore ? 'passed' : 'failed';
    attempt.gradedAt = new Date();
    attempt.gradedBy = req.user.id;
    if (remarks !== undefined) attempt.remarks = remarks;

    await attempt.save();

    res.json({
      success: true,
      message: `Graded: ${attempt.percentage}% — ${attempt.status.toUpperCase()}.`,
      attempt,
    });
  } catch (err) { next(err); }
};
