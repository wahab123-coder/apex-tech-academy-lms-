const rateLimit = require('express-rate-limit');

/**
 * Rate limiters tuned for 100–500 concurrent users.
 *
 * Auth: strict to prevent brute-force
 * API:  generous for normal usage
 * Upload: reasonable to prevent abuse
 * Contact: prevent spam
 */

// Auth endpoints — login, register, password reset
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                   // 15 attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful logins
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

// File uploads — materials, gallery, submissions
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                  // 100 uploads per IP per hour (increased for instructors uploading multiple videos)
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
  },
});

// Contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many contact requests. Please try again later.',
  },
});

// API general — applied to all /api routes
// 500 requests per 15 min per IP is generous for real users
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => {
    // Don't rate-limit health checks or webhooks
    return req.path === '/api/health' || req.path === '/api/payments/webhook';
  },
});

module.exports = { authLimiter, uploadLimiter, contactLimiter, apiLimiter };
