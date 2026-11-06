const Enrollment = require('../models/Enrollment');
const Course     = require('../models/Course');

exports.getEnrollments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') filter.student = req.user.id;
    const enrollments = await Enrollment.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title level');
    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (err) { next(err); }
};

exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) return res.status(409).json({ success: false, message: 'Student is already enrolled.' });
    const enrollment = await Enrollment.create({ student: studentId, course: courseId });
    // Increment course student count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1 } });
    res.status(201).json({ success: true, enrollment });
  } catch (err) { next(err); }
};

exports.updateEnrollmentStatus = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true, runValidators: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    res.json({ success: true, enrollment });
  } catch (err) { next(err); }
};
