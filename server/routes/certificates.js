const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getCertificates, issueCertificate, verifyCertificate, downloadCertificate, checkEligibility } = require('../controllers/certificateController');

// Public verification (no auth)
router.get('/verify/:certId', verifyCertificate);

router.use(protect);
router.get('/',                          getCertificates);
router.get('/eligibility/:studentId/:courseId', authorize('admin'), checkEligibility);
router.get('/:id/download',              downloadCertificate);
router.post('/',                         authorize('admin'), issueCertificate);
module.exports = router;
