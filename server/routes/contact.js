const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const validate        = require('../middleware/validate');
const { contactLimiter } = require('../middleware/rateLimiter');
const { sendContactNotification, sendContactAutoReply } = require('../utils/email');

router.post(
  '/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('subject').trim().notEmpty().withMessage('Subject is required.'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters.'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, subject, message } = req.body;

      // Send notification to academy admin + auto-reply to sender (in parallel)
      await Promise.all([
        sendContactNotification({ name, email, subject, message }),
        sendContactAutoReply({ name, email, subject }),
      ]);

      res.json({
        success: true,
        message: 'Message received. We will get back to you within 24 hours.',
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
