const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Event   = require('../models/Event');

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({ isPublished: true }).populate('createdBy', 'firstName lastName').sort({ date: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, event });
  } catch (err) { next(err); }
});

router.put('/:id',    protect, authorize('admin'), async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
});

// Register for event
router.post('/:id/register', protect, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (!event.registrations.includes(req.user.id)) {
      event.registrations.push(req.user.id);
      await event.save();
    }
    res.json({ success: true, message: 'Registered for event.' });
  } catch (err) { next(err); }
});

module.exports = router;
