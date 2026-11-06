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
