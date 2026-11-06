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
