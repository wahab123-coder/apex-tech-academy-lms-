const Admission  = require('../models/Admission');
const Enrollment = require('../models/Enrollment');
const Course     = require('../models/Course');
const { generateAdmissionLetterPDF } = require('../utils/pdf');
const { sendAdmissionApprovalEmail, sendAdmissionRejectionEmail } = require('../utils/email');

// Generate admission number: ATA-YYYY-XXX
const generateAdmissionNumber = async () => {
  const year  = new Date().getFullYear();
  const count = await Admission.countDocuments({ applicationStatus: 'Approved' });
  return `ATA-${year}-${String(count + 1).padStart(3, '0')}`;
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user.id } : {};
    const admissions = await Admission.find(filter)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title');
    res.json({ success: true, count: admissions.length, admissions });
  } catch (err) { next(err); }
};

exports.applyForAdmission = async (req, res, next) => {
  try {
    const { courseId, statement } = req.body;
    const existing = await Admission.findOne({ student: req.user.id, course: courseId });
    if (existing) return res.status(409).json({ success: false, message: 'You have already applied for this course.' });
    const admission = await Admission.create({ student: req.user.id, course: courseId, statement });
    res.status(201).json({ success: true, admission });
  } catch (err) { next(err); }
};

exports.reviewAdmission = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found.' });

    admission.applicationStatus = status;
    admission.reviewedBy = req.user.id;
    admission.reviewedAt = new Date();
    admission.notes      = notes;

    if (status === 'Approved') {
      admission.admissionNumber = await generateAdmissionNumber();
      admission.admissionDate   = new Date();
      // Auto-enroll the student
      await Enrollment.create({ student: admission.student, course: admission.course }).catch(() => {});
      await Course.findByIdAndUpdate(admission.course, { $inc: { totalStudents: 1 } });
    }

    await admission.save();

    // Populate for email
    await admission.populate('student', 'firstName lastName email');
    await admission.populate('course',  'title level duration');

    // Send email notification (non-blocking)
    if (status === 'Approved') {
      sendAdmissionApprovalEmail({
        student:        admission.student,
        course:         admission.course,
        admissionNumber: admission.admissionNumber,
        admissionDate:  admission.admissionDate,
      }).catch(() => {});
    } else if (status === 'Rejected') {
      sendAdmissionRejectionEmail({
        student: admission.student,
        course:  admission.course,
        notes,
      }).catch(() => {});
    }

    res.json({ success: true, admission });
  } catch (err) { next(err); }
};

// ── @GET /api/admissions/:id/letter — student downloads their admission letter PDF
exports.downloadAdmissionLetter = async (req, res, next) => {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('course',  'title level duration');

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission record not found.' });
    }

    // Students can only download their own letter
    if (
      req.user.role === 'student' &&
      admission.student._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Only approved admissions have a letter
    if (admission.applicationStatus !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Admission letter is only available for approved applications.' });
    }

    // Generate PDF buffer
    const pdfBuffer = await generateAdmissionLetterPDF({
      student:         admission.student,
      course:          admission.course,
      admissionNumber: admission.admissionNumber,
      admissionDate:   admission.admissionDate,
    });

    const filename = `Apex-Tech-Admission-Letter-${admission.admissionNumber}.pdf`;

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
