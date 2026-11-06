const Lesson     = require('../models/Lesson');
const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ── Verify instructor owns the course ─────────────────────
const verifyInstructorOwnership = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Course not found.', status: 404 };
  if (course.instructor.toString() !== instructorId.toString()) {
    return { error: 'You are not authorized to manage this course.', status: 403 };
  }
  return { course };
};

// ── @GET /api/lessons?courseId= — Authenticated enrolled students & instructor/admin
exports.getLessons = async (req, res, next) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required.' });

    // Students can only view lessons of their enrolled courses
    if (req.user.role === 'student') {
      const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId, status: 'Active' });
      if (!enrolled) return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
    res.json({ success: true, count: lessons.length, lessons });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/lessons — Instructor / Admin ───────────────
exports.createLesson = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (req.user.role === 'instructor') {
      const check = await verifyInstructorOwnership(courseId, req.user.id);
      if (check.error) return res.status(check.status).json({ success: false, message: check.error });
    }
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, lesson });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/lessons/:id — Instructor / Admin ───────────
exports.updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found.' });

    if (req.user.role === 'instructor') {
      const check = await verifyInstructorOwnership(lesson.course, req.user.id);
      if (check.error) return res.status(check.status).json({ success: false, message: check.error });
    }

    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, lesson: updated });
  } catch (err) {
    next(err);
  }
};

// ── @DELETE /api/lessons/:id — Admin ─────────────────────
exports.deleteLesson = async (req, res, next) => {
  try {
    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lesson deleted.' });
  } catch (err) {
    next(err);
  }
};
