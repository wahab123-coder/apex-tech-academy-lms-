const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPayments,
  initiatePayment,
  verifyPayment,
  handleWebhook,
  adminVerifyPayment,
} = require('../controllers/paymentController');

// ── Paystack webhook — must be raw body, no auth ──────────
router.post('/webhook', handleWebhook);

router.use(protect);

// Student
router.get('/',                         getPayments);
router.post('/initiate',                authorize('student'), initiatePayment);
router.get('/verify/:reference',        authorize('student'), verifyPayment);

// Admin
router.patch('/:id/verify',             authorize('admin'),   adminVerifyPayment);

module.exports = router;
