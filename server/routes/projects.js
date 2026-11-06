const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Project = require('../models/Project');

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ status: 'Published' })
      .populate('student', 'firstName lastName')
      .populate('course',  'title')
      .sort({ publishedAt: -1 });
    res.json({ success: true, count: projects.length, projects });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('student'), async (req, res, next) => {
  try {
    const project = await Project.create({ ...req.body, student: req.user.id });
    res.status(201).json({ success: true, project });
  } catch (err) { next(err); }
});

router.patch('/:id/publish', protect, authorize('admin'), async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'Published', publishedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, project });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
