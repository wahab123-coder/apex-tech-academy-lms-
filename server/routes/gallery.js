const express     = require('express');
const router      = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadGallery, uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');
const GalleryItem = require('../models/GalleryItem');

// ── GET /api/gallery — public ─────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) { next(err); }
});

// ── GET /api/gallery/all — admin ─────────────────────────
router.get('/all', protect, authorize('admin'), async (req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (err) { next(err); }
});

// ── POST /api/gallery — admin upload to Cloudinary ───────
router.post('/',
  protect,
  authorize('admin'),
  uploadLimiter,
  uploadGallery.single('image'),
  async (req, res, next) => {
    try {
      const { title, category, altText } = req.body;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Image file is required.' });
      }

      // Upload to Cloudinary directly
      const result = await uploadToCloudinary(
        req.file.buffer,
        'apex-tech-academy/gallery',
        'image',
        `gallery-${Date.now()}`
      );

      const item = await GalleryItem.create({
        title:    title || 'Untitled',
        category: category || 'Other',
        altText:  altText || title || '',
        imageUrl: result.url,
        imagePath: result.publicId,
        uploadedBy: req.user.id,
        isPublished: true,
      });

      res.status(201).json({ success: true, item });
    } catch (err) {
      console.error('Gallery upload error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── PATCH /api/gallery/:id — admin update ────────────────
router.patch('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { title, category, altText, isPublished } = req.body;
    const item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { title, category, altText, isPublished },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
});

// ── DELETE /api/gallery/:id — admin ──────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    // Delete from Cloudinary
    if (item.imagePath) {
      await deleteFromCloudinary(item.imagePath, 'image');
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
