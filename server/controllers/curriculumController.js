 const Curriculum = require('../models/Curriculum');
const Course     = require('../models/Course');

// ── @GET /api/curriculum/:courseId — public ───────────────
exports.getCurriculum = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({ course: req.params.courseId })
      .populate('course', 'title level duration');

    if (!curriculum) {
      return res.status(404).json({ success: false, message: 'Curriculum not found for this course.' });
    }

    res.json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @POST /api/curriculum — Admin: create curriculum ──────
exports.createCurriculum = async (req, res, next) => {
  try {
    const { courseId, overview, totalHours, weeks } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check for existing curriculum
    const existing = await Curriculum.findOne({ course: courseId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A curriculum already exists for this course. Use PUT to update it.',
      });
    }

    const curriculum = await Curriculum.create({
      course:     courseId,
      overview,
      totalHours,
      weeks:      weeks || [],
      createdBy:  req.user.id,
      updatedBy:  req.user.id,
    });

    res.status(201).json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @PUT /api/curriculum/:courseId — Admin: full update ───
exports.updateCurriculum = async (req, res, next) => {
  try {
    const { overview, totalHours, weeks, isPublished } = req.body;

    let curriculum = await Curriculum.findOne({ course: req.params.courseId });

    if (!curriculum) {
      // Auto-create if it doesn't exist yet
      curriculum = await Curriculum.create({
        course:     req.params.courseId,
        overview,
        totalHours,
        weeks:      weeks || [],
        isPublished: isPublished !== undefined ? isPublished : true,
        createdBy:  req.user.id,
        updatedBy:  req.user.id,
      });
      return res.status(201).json({ success: true, curriculum });
    }

    if (overview    !== undefined) curriculum.overview    = overview;
    if (totalHours  !== undefined) curriculum.totalHours  = totalHours;
    if (weeks       !== undefined) curriculum.weeks       = weeks;
    if (isPublished !== undefined) curriculum.isPublished = isPublished;
    curriculum.updatedBy = req.user.id;

    await curriculum.save();
    res.json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @POST /api/curriculum/:courseId/weeks — Admin: add week
exports.addWeek = async (req, res, next) => {
  try {
    const { title, description, weekNumber } = req.body;

    let curriculum = await Curriculum.findOne({ course: req.params.courseId });

    if (!curriculum) {
      // Auto-create curriculum when first week is added
      curriculum = await Curriculum.create({
        course:    req.params.courseId,
        createdBy: req.user.id,
        updatedBy: req.user.id,
      });
    }

    const nextWeekNumber = weekNumber || (curriculum.weeks.length + 1);

    curriculum.weeks.push({
      weekNumber:  nextWeekNumber,
      title,
      description: description || '',
      topics:      [],
    });

    curriculum.updatedBy = req.user.id;
    await curriculum.save();

    res.status(201).json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @PUT /api/curriculum/:courseId/weeks/:weekId — update week
exports.updateWeek = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({ course: req.params.courseId });
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found.' });

    const week = curriculum.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ success: false, message: 'Week not found.' });

    const { title, description, weekNumber, isPublished } = req.body;
    if (title       !== undefined) week.title       = title;
    if (description !== undefined) week.description = description;
    if (weekNumber  !== undefined) week.weekNumber  = weekNumber;
    if (isPublished !== undefined) week.isPublished = isPublished;

    curriculum.updatedBy = req.user.id;
    await curriculum.save();

    res.json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @DELETE /api/curriculum/:courseId/weeks/:weekId ───────
exports.deleteWeek = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({ course: req.params.courseId });
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found.' });

    curriculum.weeks = curriculum.weeks.filter(
      (w) => w._id.toString() !== req.params.weekId
    );

    // Re-number remaining weeks
    curriculum.weeks.forEach((w, i) => { w.weekNumber = i + 1; });
    curriculum.updatedBy = req.user.id;
    await curriculum.save();

    res.json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @POST /api/curriculum/:courseId/weeks/:weekId/topics ──
exports.addTopic = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({ course: req.params.courseId });
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found.' });

    const week = curriculum.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ success: false, message: 'Week not found.' });

    const { title, duration, type } = req.body;
    week.topics.push({ title, duration, type: type || 'lecture' });

    curriculum.updatedBy = req.user.id;
    await curriculum.save();

    res.status(201).json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @DELETE /api/curriculum/:courseId/weeks/:weekId/topics/:topicId
exports.deleteTopic = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({ course: req.params.courseId });
    if (!curriculum) return res.status(404).json({ success: false, message: 'Curriculum not found.' });

    const week = curriculum.weeks.id(req.params.weekId);
    if (!week) return res.status(404).json({ success: false, message: 'Week not found.' });

    week.topics = week.topics.filter(
      (t) => t._id.toString() !== req.params.topicId
    );

    curriculum.updatedBy = req.user.id;
    await curriculum.save();

    res.json({ success: true, curriculum });
  } catch (err) { next(err); }
};

// ── @DELETE /api/curriculum/:courseId — Admin: delete all ─
exports.deleteCurriculum = async (req, res, next) => {
  try {
    await Curriculum.findOneAndDelete({ course: req.params.courseId });
    res.json({ success: true, message: 'Curriculum deleted.' });
  } catch (err) { next(err); }
};
