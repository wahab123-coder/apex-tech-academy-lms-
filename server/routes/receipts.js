const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Receipt  = require('../models/Receipt');

router.use(protect);

// GET /api/receipts — student gets own; admin gets all
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user.id } : {};
    const receipts = await Receipt.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: receipts.length, receipts });
  } catch (err) { next(err); }
});

// GET /api/receipts/:id — own receipt or admin
router.get('/:id', async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title');
    if (!receipt) return res.status(404).json({ success: false, message: 'Receipt not found.' });
    // Ownership check
    if (req.user.role === 'student' && receipt.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, receipt });
  } catch (err) { next(err); }
});

module.exports = router;
