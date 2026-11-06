const express    = require('express');
const router     = express.Router();
const { body }   = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate   = require('../middleware/validate');
const TeamMember = require('../models/TeamMember');

// ── GET /api/team — public ────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const members = await TeamMember.find({ isVisible: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: members.length, members });
  } catch (err) { next(err); }
});

// ── GET /api/team/all — admin (includes hidden) ────────────
router.get('/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, count: members.length, members });
  } catch (err) { next(err); }
});

// ── POST /api/team — admin ────────────────────────────────
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('role').trim().notEmpty().withMessage('Role is required.'),
    body('bio').optional().trim(),
    body('order').optional().isNumeric().withMessage('Order must be a number.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, role, bio, order, photo } = req.body;
      const member = await TeamMember.create({ name, role, bio, order: order || 0, photo });
      res.status(201).json({ success: true, member });
    } catch (err) { next(err); }
  }
);

// ── PUT /api/team/:id — admin update ──────────────────────
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });
    res.json({ success: true, member });
  } catch (err) { next(err); }
});

// ── PATCH /api/team/:id/visibility — admin toggle ─────────
router.patch('/:id/visibility', protect, authorize('admin'), async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });
    member.isVisible = !member.isVisible;
    await member.save();
    res.json({ success: true, member });
  } catch (err) { next(err); }
});

// ── DELETE /api/team/:id — admin ──────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Team member not found.' });
    res.json({ success: true, message: 'Team member deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
