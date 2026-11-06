const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const crypto  = require('crypto');
const https   = require('https');
const { sendPaymentReceiptEmail } = require('../utils/email');

// ── Helper: generate receipt number ───────────────────────
const generateReceiptNumber = async () => {
  const count = await Receipt.countDocuments();
  return `RCP-${String(count + 1).padStart(4, '0')}`;
};

// ── Helper: verify payment with Paystack API ───────────────
const verifyWithPaystack = (reference) =>
  new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port:     443,
      path:     `/transaction/verify/${encodeURIComponent(reference)}`,
      method:   'GET',
      headers:  {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.end();
  });

// ── Helper: issue receipt and send email ──────────────────
const issueReceiptAndEmail = async (payment) => {
  try {
    const existing = await Receipt.findOne({ payment: payment._id });
    if (existing) return existing;

    const receipt = await Receipt.create({
      payment:       payment._id,
      student:       payment.student,
      course:        payment.course,
      receiptNumber: await generateReceiptNumber(),
      amount:        payment.amount,
      currency:      payment.currency,
      issuedAt:      new Date(),
    });

    const User   = require('../models/User');
    const Course = require('../models/Course');
    const [student, course] = await Promise.all([
      User.findById(payment.student).select('firstName lastName email'),
      Course.findById(payment.course).select('title'),
    ]);
    sendPaymentReceiptEmail({ student, receipt, course }).catch(() => {});
    return receipt;
  } catch (err) {
    console.error('Receipt generation error:', err.message);
  }
};

// ══════════════════════════════════════════════════════════
//  GET /api/payments
// ══════════════════════════════════════════════════════════
exports.getPayments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user.id } : {};
    const payments = await Payment.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  POST /api/payments/initiate — Student initiates Paystack payment
// ══════════════════════════════════════════════════════════
exports.initiatePayment = async (req, res, next) => {
  try {
    const { courseId, amount, currency = 'NGN' } = req.body;

    if (!courseId || !amount) {
      return res.status(400).json({ success: false, message: 'courseId and amount are required.' });
    }

    const User   = require('../models/User');
    const Course = require('../models/Course');

    const [student, course] = await Promise.all([
      User.findById(req.user.id).select('firstName lastName email'),
      Course.findById(courseId).select('title price'),
    ]);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Create pending payment record first
    const payment = await Payment.create({
      student:      req.user.id,
      course:       courseId,
      amount,
      currency,
      paymentMethod: 'Paystack',
      status:        'Pending',
      description:   `Course fee — ${course.title}`,
    });

    // Initialize Paystack transaction
    const paystackData = JSON.stringify({
      email:     student.email,
      amount:    amount * 100,               // Paystack uses kobo (multiply by 100)
      currency,
      reference: `ATA-${payment._id}`,       // Use our payment ID as reference
      callback_url: `${process.env.CLIENT_URL}/student/payments`,
      metadata: {
        payment_id:  payment._id.toString(),
        student_id:  req.user.id,
        course_id:   courseId,
        course_name: course.title,
        student_name: `${student.firstName} ${student.lastName}`,
      },
    });

    const paystackResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.paystack.co',
        port:     443,
        path:     '/transaction/initialize',
        method:   'POST',
        headers:  {
          Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(paystackData),
        },
      };

      const pReq = https.request(options, (pRes) => {
        let data = '';
        pRes.on('data', (chunk) => { data += chunk; });
        pRes.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      });
      pReq.on('error', reject);
      pReq.write(paystackData);
      pReq.end();
    });

    if (!paystackResponse.status) {
      // Paystack initialization failed — delete pending payment
      await payment.deleteOne();
      return res.status(400).json({
        success: false,
        message: paystackResponse.message || 'Failed to initialize payment.',
      });
    }

    // Save the Paystack reference
    payment.providerReference = `ATA-${payment._id}`;
    await payment.save();

    res.status(201).json({
      success:        true,
      payment,
      authorization_url: paystackResponse.data.authorization_url,
      access_code:       paystackResponse.data.access_code,
      reference:         paystackResponse.data.reference,
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  POST /api/payments/verify/:reference — Student verifies after redirect
// IMPORTANT: We verify with Paystack directly — never trust client claim of success
// ══════════════════════════════════════════════════════════
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    // Verify directly with Paystack
    const paystackResult = await verifyWithPaystack(reference);

    if (!paystackResult.status || paystackResult.data?.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: `Payment not successful. Status: ${paystackResult.data?.status || 'unknown'}`,
      });
    }

    // Find our payment record by reference
    const payment = await Payment.findOne({ providerReference: reference });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Ensure the authenticated student owns this payment
    if (payment.student.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (payment.status === 'Verified') {
      return res.json({ success: true, message: 'Payment already verified.', payment });
    }

    // Mark as verified
    payment.status       = 'Verified';
    payment.verifiedAt   = new Date();
    payment.verifiedBy   = 'paystack';
    payment.providerData = paystackResult.data;
    await payment.save();

    // Issue receipt and send email
    await issueReceiptAndEmail(payment);

    res.json({
      success: true,
      message: 'Payment verified successfully. Receipt has been generated.',
      payment,
    });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  POST /api/payments/webhook — Paystack webhook (server-to-server)
// ══════════════════════════════════════════════════════════
exports.handleWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      const payment = await Payment.findOne({ providerReference: reference });

      if (payment && payment.status !== 'Verified') {
        payment.status      = 'Verified';
        payment.verifiedAt  = new Date();
        payment.verifiedBy  = 'paystack-webhook';
        payment.providerData = event.data;
        await payment.save();
        await issueReceiptAndEmail(payment);
      }
    }

    // Always respond 200 to Paystack webhooks
    res.json({ success: true });
  } catch (err) { next(err); }
};

// ══════════════════════════════════════════════════════════
//  PATCH /api/payments/:id/verify — Admin manual verify
// ══════════════════════════════════════════════════════════
exports.adminVerifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });

    payment.status     = 'Verified';
    payment.verifiedAt = new Date();
    payment.verifiedBy = req.user.id.toString();
    await payment.save();

    await issueReceiptAndEmail(payment);

    res.json({ success: true, payment });
  } catch (err) { next(err); }
};
