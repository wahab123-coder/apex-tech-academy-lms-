const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Message = require('../models/Message');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? { to: null }  // Admin inbox: messages sent without a 'to'
      : { from: req.user.id };
    const messages = await Message.find(filter)
      .populate('from', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const msg = await Message.create({ ...req.body, from: req.user.id });
    res.status(201).json({ success: true, message: msg });
  } catch (err) { next(err); }
});

router.patch('/:id/read', authorize('admin'), async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ success: true, message: msg });
  } catch (err) { next(err); }
});

module.exports = router;
