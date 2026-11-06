const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload, setUploadFolder } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { getSubmissions, submitAssignment, gradeSubmission } = require('../controllers/submissionController');

router.use(protect);
router.get('/',         getSubmissions);
router.post('/',        authorize('student'), uploadLimiter, setUploadFolder('submissions'), upload.single('file'), submitAssignment);
router.patch('/:id/grade', authorize('admin', 'instructor'), gradeSubmission);
module.exports = router;
