const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Setting    = require('../models/Setting');

// ── GET /api/settings — public (returns non-sensitive settings) ──
router.get('/', async (req, res, next) => {
  try {
    const settings = await Setting.find({ category: { $in: ['general', 'security'] } });
    // Convert to key-value object
    const result = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json({ success: true, settings: result });
  } catch (err) { next(err); }
});

// ── GET /api/settings/all — admin (all settings) ────────────
router.get('/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const settings = await Setting.find().sort({ category: 1, key: 1 });
    res.json({ success: true, count: settings.length, settings });
  } catch (err) { next(err); }
});

// ── PUT /api/settings/:key — admin update a setting ─────────
router.put('/:key', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { value, label, description } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      {
        value,
        ...(label       && { label }),
        ...(description && { description }),
        updatedBy: req.user.id,
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, setting });
  } catch (err) { next(err); }
});

module.exports = router;
