const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { register, login, getMe, logout, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect }      = require('../middleware/auth');
const validate         = require('../middleware/validate');
const { authLimiter }  = require('../middleware/rateLimiter');

// Validation rules
const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login',    authLimiter, loginRules,    validate, login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);
router.post('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
], validate, changePassword);

module.exports = router;

// Forgot / reset password
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
], validate, forgotPassword);

router.post('/reset-password/:token', authLimiter, [
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], validate, resetPassword);

// ── One-time admin setup route ────────────────────────────
// Call: POST /api/auth/setup-admin  with { "token": "apextech2026admintoken" }
// Delete this route after first use in production
router.post('/setup-admin', async (req, res) => {
  try {
    const { token } = req.body;
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return res.status(403).json({ success: false, message: 'Invalid setup token.' });
    }

    const bcrypt = require('bcryptjs');
    const User   = require('../models/User');

    let admin = await User.findOne({ email: 'admin@apextechacademy.com' });
    if (admin) {
      admin.password        = await bcrypt.hash('Admin@1234', 12);
      admin.role            = 'admin';
      admin.isActive        = true;
      admin.isEmailVerified = true;
      await admin.save();
      return res.json({ success: true, message: 'Admin password reset.', email: 'admin@apextechacademy.com', password: 'Admin@1234' });
    }

    const hash = await bcrypt.hash('Admin@1234', 12);
    await User.create({
      firstName: 'Admin', lastName: 'User',
      email: 'admin@apextechacademy.com',
      phone: '+234 801 000 0001',
      password: hash,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      bio: 'Apex Tech Academy Administrator',
    });

    res.status(201).json({ success: true, message: 'Admin created.', email: 'admin@apextechacademy.com', password: 'Admin@1234' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
