const Course     = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ── @GET /api/courses — Public ────────────────────────────
exports.getCourses = async (req, res, next) => {
  try {
    const { level, category, search, published = true } = req.query;
    const filter = {};
    if (published !== 'all') filter.isPublished = published === 'false' ? false : true;
    if (level)    filter.level    = level;
    if (category) filter.category = category;
    if (search)   filter.title    = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).populate('instructor', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/courses/:id — Public ───────────────────────
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'firstName lastName bio');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/courses — Admin or Instructor ─────────────
exports.createCourse = async (req, res, next) => {
  try {
    const data = { ...req.body };
    // Instructors are automatically set as the instructor of the course they create
    if (req.user.role === 'instructor') {
      data.instructor = req.user.id;
    }
    const course = await Course.create(data);
    res.status(201).json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/courses/:id — Admin ────────────────────────
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course });
  } catch (err) {
    next(err);
  }
};

// ── @DELETE /api/courses/:id — Admin ─────────────────────
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course deleted.' });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/courses/instructor/mine — Instructor / Admin ─
exports.getMyCourses = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { instructor: req.user.id };
    const courses = await Course.find(filter).populate('instructor', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
};
