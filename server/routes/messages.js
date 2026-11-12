const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Message = require('../models/Message');
const User    = require('../models/User');
const { sendMessageEmail } = require('../utils/email');

router.use(protect);

// ── GET /api/messages — inbox ─────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}                        // Admin sees all messages
      : { $or: [{ from: req.user.id }, { to: req.user.id }] };

    const messages = await Message.find(filter)
      .populate('from', 'firstName lastName role')
      .populate('to',   'firstName lastName role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) { next(err); }
});

// ── POST /api/messages — send a message ───────────────────
router.post('/', async (req, res, next) => {
  try {
    const { to, subject, body } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ success: false, message: 'Message body is required.' });
    }

    const msg = await Message.create({
      from:    req.user.id,
      to:      to || null,
      subject: subject || '',
      body:    body.trim(),
    });

    // Send email notification to recipient (non-blocking)
    if (to) {
      User.findById(to).then((recipient) => {
        if (recipient?.email) {
          sendMessageEmail({
            from: req.user,
            to:   recipient,
            subject,
            body: body.trim(),
          }).catch(() => {});
        }
      }).catch(() => {});
    } else {
      // Message to admin — notify admin email
      sendMessageEmail({
        from: req.user,
        to:   { firstName: 'Admin', email: process.env.EMAIL_USER },
        subject,
        body: body.trim(),
      }).catch(() => {});
    }

    const populated = await Message.findById(msg._id)
      .populate('from', 'firstName lastName role')
      .populate('to',   'firstName lastName role');

    res.status(201).json({ success: true, message: populated });
  } catch (err) { next(err); }
});

// ── PATCH /api/messages/:id/read ─────────────────────────
router.patch('/:id/read', async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, message: msg });
  } catch (err) { next(err); }
});

// ── DELETE /api/messages/:id ──────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
