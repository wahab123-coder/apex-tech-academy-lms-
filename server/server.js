/**
 * Apex Tech Academy — Express Server Entry Point
 */
const express       = require('express');
const mongoose      = require('mongoose');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const compression   = require('compression');
const cookieParser  = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit     = require('express-rate-limit');
require('dotenv').config();

const errorHandler  = require('./middleware/errorHandler');
const { connectDB } = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// ── Route imports ──────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const courseRoutes       = require('./routes/courses');
const lessonRoutes       = require('./routes/lessons');
const materialRoutes     = require('./routes/materials');
const enrollmentRoutes   = require('./routes/enrollments');
const assignmentRoutes   = require('./routes/assignments');
const submissionRoutes   = require('./routes/submissions');
const progressRoutes     = require('./routes/progress');
const admissionRoutes    = require('./routes/admissions');
const paymentRoutes      = require('./routes/payments');
const receiptRoutes      = require('./routes/receipts');
const certificateRoutes  = require('./routes/certificates');
const announcementRoutes = require('./routes/announcements');
const blogRoutes         = require('./routes/blog');
const eventRoutes        = require('./routes/events');
const galleryRoutes      = require('./routes/gallery');
const projectRoutes      = require('./routes/projects');
const messageRoutes      = require('./routes/messages');
const contactRoutes      = require('./routes/contact');
const teamRoutes         = require('./routes/team');
const curriculumRoutes   = require('./routes/curriculum');
const examRoutes         = require('./routes/exams');
const settingsRoutes     = require('./routes/settings');

const app = express();

// ── Trust Render's proxy (required for rate limiting behind reverse proxy) ──
app.set('trust proxy', 1);

// ── Security Middleware ────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'https://apex-tech-academy-lms.vercel.app',
      process.env.CLIENT_URL,
    ].filter(Boolean).map((u) => u.replace(/\/$/, '')); // remove trailing slashes

    if (!origin || allowed.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api', globalLimiter);
// ── General Middleware ─────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Extended timeout for file upload routes ───────────────
// Large video uploads can take several minutes — increase timeout to 30 min
app.use('/api/materials', (req, res, next) => {
  if (req.method === 'POST') {
    req.setTimeout(30 * 60 * 1000);   // 30 min request parse timeout
    res.setTimeout(30 * 60 * 1000);   // 30 min response timeout
  }
  next();
});
app.use('/api/gallery', (req, res, next) => {
  if (req.method === 'POST') {
    req.setTimeout(5 * 60 * 1000);
    res.setTimeout(5 * 60 * 1000);
  }
  next();
});

// ── Static file serving ────────────────────────────────────
// Gallery images are public — served at /uploads/gallery/*
const path = require('path');
app.use(
  '/uploads/gallery',
  express.static(path.join(__dirname, 'uploads', 'gallery'), {
    maxAge: '7d',
    etag: true,
  })
);

// Learning materials and submissions are PROTECTED — served via API
// (do NOT add static middleware for materials or submissions here)

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/lessons',       lessonRoutes);
app.use('/api/materials',     materialRoutes);
app.use('/api/enrollments',   enrollmentRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/submissions',   submissionRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/admissions',    admissionRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/receipts',      receiptRoutes);
app.use('/api/certificates',  certificateRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/blog',          blogRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/gallery',       galleryRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/contact',       contactRoutes);
app.use('/api/team',          teamRoutes);
app.use('/api/curriculum',    curriculumRoutes);
app.use('/api/exams',         examRoutes);
app.use('/api/settings',      settingsRoutes);

// ── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Apex Tech Academy API is running', env: process.env.NODE_ENV });
});

// ── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();

module.exports = app;
