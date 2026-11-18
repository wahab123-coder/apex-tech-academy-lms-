const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Progress  = require('../models/Progress');
const Lesson    = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

router.use(protect);

// GET /api/progress?courseId= — own progress
router.get('/', async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = { student: req.user.id };
    if (courseId) filter.course = courseId;
    const progress = await Progress.find(filter).populate('course', 'title').populate('completedLessons', 'title order');
    res.json({ success: true, progress });
  } catch (err) { next(err); }
});

// GET /api/progress/all — Admin/Instructor: all students progress
router.get('/all', authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const { courseId } = req.query;
    const filter = {};
    if (courseId) filter.course = courseId;

    // Instructors only see progress for their own courses
    if (req.user.role === 'instructor') {
      const Course = require('../models/Course');
      const myCourses = await Course.find({ instructor: req.user.id }).select('_id');
      const myCourseIds = myCourses.map(c => c._id);
      filter.course = courseId ? courseId : { $in: myCourseIds };
    }

    const progress = await Progress.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: progress.length, progress });
  } catch (err) { next(err); }
});

// POST /api/progress/complete-lesson — Student marks a lesson complete
router.post('/complete-lesson', authorize('student'), async (req, res, next) => {
  try {
    const { lessonId, courseId } = req.body;

    const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'Active' });
    if (!enrolled) return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });

    let progress = await Progress.findOne({ student: req.user.id, course: courseId });
    if (!progress) progress = await Progress.create({ student: req.user.id, course: courseId });

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    progress.progressPercentage = Math.round((progress.completedLessons.length / totalLessons) * 100);
    progress.isCompleted = progress.progressPercentage >= 100;
    if (progress.isCompleted && !progress.completedAt) progress.completedAt = new Date();

    await progress.save();
    res.json({ success: true, progress });
  } catch (err) { next(err); }
});

module.exports = router;
