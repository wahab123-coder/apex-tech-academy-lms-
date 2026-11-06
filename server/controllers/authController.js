const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const User   = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

// ── Helpers ───────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

// ── @POST /api/auth/register ──────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Public registration always creates a Student account.
    // Role must never be accepted from the request body.
    const user = await User.create({ firstName, lastName, email, phone, password, role: 'student' });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    sendWelcomeEmail(user).catch(() => {});

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/login ─────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Select password back in (it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/auth/me ─────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/logout ────────────────────────────────
exports.logout = (req, res) => {
  // JWT is stateless — client drops the token.
  // If using refresh tokens / cookies, clear them here.
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ── @POST /api/auth/change-password ──────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/forgot-password ──────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond success — never reveal if email exists (security)
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }
    // Generate a secure reset token
    const resetToken   = crypto.randomBytes(32).toString('hex');
    const hashedToken  = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken   = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Build reset URL for the frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send the password reset email to the user's registered email address
    const emailResult = await sendPasswordResetEmail({ user, resetUrl });

    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔑  Password Reset Link for ${user.email}:`);
      console.log(`    ${resetUrl}\n`);
      if (emailResult?.success === false) {
        console.warn('⚠️   Email send failed — using dev link above instead');
      }
    }

    res.json({
      success: true,
      message: `A password reset link has been sent to ${user.email}. Please check your inbox.`,
      // In development expose the token so it can be tested without email
      ...(process.env.NODE_ENV === 'development' && { devResetUrl: resetUrl }),
    });
  } catch (err) {
    next(err);
  }
};

// ── @POST /api/auth/reset-password/:token ─────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.',
      });
    }

    // Hash the token from the URL to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken:   hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password — pre-save hook handles hashing
    user.password             = newPassword;
    user.passwordResetToken   = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    next(err);
  }
};
