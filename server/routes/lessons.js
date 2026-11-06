const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getLessons, createLesson, updateLesson, deleteLesson } = require('../controllers/lessonController');

router.use(protect);

router.get('/',      getLessons);
router.post('/',     authorize('admin', 'instructor'), createLesson);
router.put('/:id',   authorize('admin', 'instructor'), updateLesson);
router.delete('/:id', authorize('admin'),              deleteLesson);

module.exports = router;
