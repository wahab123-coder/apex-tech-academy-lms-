const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getMyCourses } = require('../controllers/courseController');

// Public
router.get('/', getCourses);

// Instructor — MUST be before /:id to avoid "instructor" being treated as an id
router.get('/instructor/mine', protect, authorize('instructor', 'admin'), getMyCourses);

// Admin or Instructor can create courses
router.post('/', protect, authorize('admin', 'instructor'), createCourse);

// Admin only — update / delete
router.put('/:id',    protect, authorize('admin', 'instructor'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

// Public — by id (after all static paths)
router.get('/:id', getCourseById);

module.exports = router;
