const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdmissions, applyForAdmission, reviewAdmission, downloadAdmissionLetter } = require('../controllers/admissionController');

router.use(protect);
router.get('/',             getAdmissions);
router.post('/',            authorize('student'), applyForAdmission);
router.patch('/:id/review', authorize('admin'),   reviewAdmission);
router.get('/:id/letter',   downloadAdmissionLetter);
module.exports = router;
