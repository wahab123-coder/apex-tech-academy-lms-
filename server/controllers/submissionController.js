const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');

exports.getSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.query;
    const filter = {};
    if (assignmentId) filter.assignment = assignmentId;
    // Students only see their own
    if (req.user.role === 'student') filter.student = req.user.id;
    const submissions = await Submission.find(filter)
      .populate('student',    'firstName lastName')
      .populate('assignment', 'title');
    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) { next(err); }
};

exports.submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId, notes } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    // Must be enrolled
    const enrolled = await Enrollment.findOne({ student: req.user.id, course: assignment.course, status: 'Active' });
    if (!enrolled) return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });

    const existing = await Submission.findOne({ assignment: assignmentId, student: req.user.id });
    if (existing) return res.status(409).json({ success: false, message: 'You have already submitted this assignment.' });

    const subData = { assignment: assignmentId, student: req.user.id, course: assignment.course, notes };
    if (req.file) { subData.filePath = req.file.path; }

    const submission = await Submission.create(subData);
    res.status(201).json({ success: true, submission });
  } catch (err) { next(err); }
};

exports.gradeSubmission = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { grade, feedback, status: 'Graded', gradedBy: req.user.id, gradedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
    res.json({ success: true, submission });
  } catch (err) { next(err); }
};
