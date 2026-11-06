const express      = require('express');
const router       = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Announcement = require('../models/Announcement');

// GET — public-ish; authenticated users see relevant announcements
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.user.role === 'student')    filter.$or = [{ audience: 'all' }, { audience: 'students' }];
    if (req.user.role === 'instructor') filter.$or = [{ audience: 'all' }, { audience: 'instructors' }];
    const announcements = await Announcement.find(filter).populate('createdBy', 'firstName lastName').sort({ createdAt: -1 });
    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const ann = await Announcement.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, announcement: ann });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
