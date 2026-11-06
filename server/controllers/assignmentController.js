const Assignment = require('../models/Assignment');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getAssignments = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;
    // Students only see assignments of enrolled courses
    if (req.user.role === 'student' && courseId) {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'Active' });
      if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled.' });
    }
    // Instructors only see their courses' assignments
    if (req.user.role === 'instructor') {
      const myCourses = await Course.find({ instructor: req.user.id }).select('_id');
      filter.course = { $in: myCourses.map((c) => c._id) };
    }
    const assignments = await Assignment.find(filter).populate('lesson', 'title').populate('course', 'title');
    res.json({ success: true, count: assignments.length, assignments });
  } catch (err) { next(err); }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, assignment });
  } catch (err) { next(err); }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    res.json({ success: true, assignment });
  } catch (err) { next(err); }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment deleted.' });
  } catch (err) { next(err); }
};
