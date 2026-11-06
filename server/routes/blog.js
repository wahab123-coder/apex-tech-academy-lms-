const express   = require('express');
const router    = express.Router();
const { protect, authorize } = require('../middleware/auth');
const BlogPost  = require('../models/BlogPost');

// Public
router.get('/', async (req, res, next) => {
  try {
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const posts = await BlogPost.find(filter).populate('author', 'firstName lastName').sort({ publishedAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'firstName lastName');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
});

// Admin/Instructor
router.post('/', protect, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const post = await BlogPost.create({ ...req.body, author: req.user.id });
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('admin', 'instructor'), async (req, res, next) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, post });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
