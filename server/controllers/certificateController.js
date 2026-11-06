const Certificate = require('../models/Certificate');
const Progress    = require('../models/Progress');
const Enrollment  = require('../models/Enrollment');
const Lesson      = require('../models/Lesson');
const { sendCertificateEmail } = require('../utils/email');

// ── @GET /api/certificates ────────────────────────────────
exports.getCertificates = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user.id } : {};
    const certs  = await Certificate.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title');
    res.json({ success: true, count: certs.length, certificates: certs });
  } catch (err) { next(err); }
};

// ── @GET /api/certificates/eligibility/:studentId/:courseId ─
// Check if a student is eligible for a certificate
exports.checkEligibility = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course:  courseId,
      status:  'Active',
    });

    if (!enrollment) {
      return res.json({
        success:  true,
        eligible: false,
        reason:   'Student is not enrolled in this course.',
        progress: 0,
      });
    }

    // Check progress
    const progress = await Progress.findOne({ student: studentId, course: courseId });

    if (!progress) {
      return res.json({
        success:  true,
        eligible: false,
        reason:   'No progress record found. Student has not started the course.',
        progress: 0,
      });
    }

    // Get total published lessons for this course
    const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    const completedLessons = progress.completedLessons?.length || 0;
    const progressPct = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : progress.progressPercentage || 0;

    // Must have completed 100%
    if (!progress.isCompleted || progressPct < 100) {
      return res.json({
        success:       true,
        eligible:      false,
        reason:        `Student has only completed ${progressPct}% of the course. 100% required.`,
        progress:      progressPct,
        completedLessons,
        totalLessons,
      });
    }

    // Check if exam exists and student has passed
    const Exam        = require('../models/Exam');
    const ExamAttempt = require('../models/ExamAttempt');

    const exam = await Exam.findOne({ course: courseId });
    if (exam) {
      const attempt = await ExamAttempt.findOne({ exam: exam._id, student: studentId });
      if (!attempt) {
        return res.json({
          success:  true, eligible: false,
          reason:   'Student has not taken the final examination.',
          progress: 100, examRequired: true, examStatus: 'not-started',
        });
      }
      if (attempt.status !== 'passed') {
        return res.json({
          success:  true, eligible: false,
          reason:   `Student has not passed the final exam (status: ${attempt.status}${attempt.percentage !== null ? `, ${attempt.percentage}%` : ''}).`,
          progress: 100, examRequired: true, examStatus: attempt.status, examScore: attempt.percentage,
        });
      }
    }

    // Check if certificate already issued
    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.json({
        success:     true,
        eligible:    false,
        reason:      'A certificate has already been issued for this student and course.',
        progress:    100,
        alreadyIssued: true,
        certificate: existing,
      });
    }

    // All checks passed
    res.json({
      success:         true,
      eligible:        true,
      reason:          'Student has completed 100% of the course and is eligible for a certificate.',
      progress:        100,
      completedLessons,
      totalLessons,
      completedAt:     progress.completedAt,
    });
  } catch (err) { next(err); }
};

// ── @POST /api/certificates — Admin issues certificate ────
exports.issueCertificate = async (req, res, next) => {
  try {
    const { studentId, courseId, enrollmentId, grade } = req.body;

    // ── Strict completion verification ────────────────────

    // 1. Must be enrolled
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course:  courseId,
    });
    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course.',
      });
    }

    // 2. Must have a progress record
    const progress = await Progress.findOne({ student: studentId, course: courseId });
    if (!progress) {
      return res.status(400).json({
        success: false,
        message: 'No progress record found. Student has not started any lessons.',
      });
    }

    // 3. Must have completed ALL lessons (100%)
    const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    const completedLessons = progress.completedLessons?.length || 0;

    if (totalLessons > 0 && completedLessons < totalLessons) {
      return res.status(400).json({
        success: false,
        message: `Student has only completed ${completedLessons} of ${totalLessons} lessons. All lessons must be completed before a certificate can be issued.`,
        completedLessons,
        totalLessons,
        progressPercentage: Math.round((completedLessons / totalLessons) * 100),
      });
    }

    // 4. isCompleted flag must be true
    if (!progress.isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Course completion has not been confirmed for this student.',
      });
    }

    // 5. Must have passed the final exam (if one exists for this course)
    const Exam        = require('../models/Exam');
    const ExamAttempt = require('../models/ExamAttempt');

    const exam = await Exam.findOne({ course: courseId });
    if (exam) {
      const attempt = await ExamAttempt.findOne({
        exam: exam._id,
        student: studentId,
      });
      if (!attempt) {
        return res.status(400).json({
          success: false,
          message: 'Student has not taken the final examination. Certificate cannot be issued until the exam is passed.',
          examRequired: true,
        });
      }
      if (attempt.status !== 'passed') {
        return res.status(400).json({
          success: false,
          message: `Student has not passed the final examination (status: ${attempt.status}${attempt.percentage !== null ? `, score: ${attempt.percentage}%` : ''}). Certificate cannot be issued until the exam is passed.`,
          examRequired: true,
          examStatus: attempt.status,
          examScore: attempt.percentage,
        });
      }
    }

    // 6. Check for duplicate certificate
    const existing = await Certificate.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A certificate has already been issued for this student and course.',
        certificate: existing,
      });
    }

    // ── All checks passed — issue certificate ─────────────
    const cert = await Certificate.create({
      student:    studentId,
      course:     courseId,
      enrollment: enrollmentId || enrollment._id,
      grade:      grade || 'Pass',
      status:     'Issued',
      issuedAt:   new Date(),
      issuedBy:   req.user.id,
    });

    // Populate for email and response
    const [student, course] = await Promise.all([
      require('../models/User').findById(studentId).select('firstName lastName email'),
      require('../models/Course').findById(courseId).select('title level'),
    ]);

    // Send certificate email with PDF attachment (non-blocking)
    sendCertificateEmail({
      student,
      course,
      certificateId: cert.certificateId,
      grade:         cert.grade,
      issuedAt:      cert.issuedAt,
    }).catch(() => {});

    res.status(201).json({
      success:     true,
      message:     `Certificate successfully issued to ${student.firstName} ${student.lastName}.`,
      certificate: cert,
    });
  } catch (err) { next(err); }
};

// ── @GET /api/certificates/verify/:certId — Public ────────
exports.verifyCertificate = async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({
      certificateId: req.params.certId,
      status:        'Issued',
    })
      .populate('student', 'firstName lastName')
      .populate('course',  'title');

    if (!cert) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid.',
      });
    }

    res.json({ success: true, valid: true, certificate: cert });
  } catch (err) { next(err); }
};

// ── @GET /api/certificates/:id/download — Student/Admin ───
exports.downloadCertificate = async (req, res, next) => {
  try {
    const { generateCertificatePDF } = require('../utils/pdf');

    const cert = await Certificate.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title level');

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    // Students can only download their own certificate
    if (
      req.user.role === 'student' &&
      cert.student._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (cert.status !== 'Issued') {
      return res.status(400).json({ success: false, message: 'Certificate has not been issued yet.' });
    }

    const pdfBuffer = await generateCertificatePDF({
      student:       cert.student,
      course:        cert.course,
      certificateId: cert.certificateId,
      grade:         cert.grade,
      issuedAt:      cert.issuedAt,
    });

    const filename = `Apex-Tech-Certificate-${cert.certificateId}.pdf`;

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) { next(err); }
};
