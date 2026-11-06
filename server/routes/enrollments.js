const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getEnrollments, enrollStudent, updateEnrollmentStatus } = require('../controllers/enrollmentController');

router.use(protect);
router.get('/',       getEnrollments);
router.post('/',      authorize('admin'), enrollStudent);
router.patch('/:id',  authorize('admin'), updateEnrollmentStatus);
module.exports = router;
