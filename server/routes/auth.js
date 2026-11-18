const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const bcrypt   = require('bcryptjs');

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

// Forgot / reset password
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
], validate, forgotPassword);

router.post('/reset-password/:token', authLimiter, [
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], validate, resetPassword);

// ── Universal password reset (admin tool) ─────────────────
// GET /api/auth/reset-user?token=apextech2026admintoken&email=user@email.com&password=NewPass123
router.get('/reset-user', async (req, res) => {
  try {
    const { token, email, password } = req.query;
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return res.status(403).json({ success: false, message: 'Invalid setup token.' });
    }
    if (!email || !password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Email and password (min 8 chars) required.' });
    }
    const User = require('../models/User');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Hash manually and use updateOne to bypass pre-save hook completely
    const hashed = await bcrypt.hash(password, 12);
    await User.updateOne({ _id: user._id }, { $set: { password: hashed } });

    res.json({ success: true, message: `Password reset for ${user.firstName} ${user.lastName}`, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin setup ────────────────────────────────────────────
// GET /api/auth/setup-admin?token=apextech2026admintoken
router.get('/setup-admin', async (req, res) => {
  try {
    const { token } = req.query;
    if (token !== process.env.ADMIN_SETUP_TOKEN) {
      return res.status(403).json({ success: false, message: 'Invalid setup token.' });
    }
    const User = require('../models/User');

    // Hash manually to bypass pre-save hook
    const hashed = await bcrypt.hash('Admin@1234', 12);

    let admin = await User.findOne({ email: 'admin@apextechacademy.com' });
    if (admin) {
      await User.updateOne({ _id: admin._id }, { $set: { password: hashed, role: 'admin', isActive: true, isEmailVerified: true } });
      return res.json({ success: true, message: 'Admin password reset.', email: 'admin@apextechacademy.com', password: 'Admin@1234' });
    }

    await User.create({
      firstName: 'Admin', lastName: 'User',
      email: 'admin@apextechacademy.com',
      phone: '+234 801 000 0001',
      password: hashed,
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      bio: 'Apex Tech Academy Administrator',
    });
    // Since we used create(), pre-save hook will hash again — fix that
    await User.updateOne({ email: 'admin@apextechacademy.com' }, { $set: { password: hashed } });

    res.status(201).json({ success: true, message: 'Admin created.', email: 'admin@apextechacademy.com', password: 'Admin@1234' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
