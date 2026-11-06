const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/examController');

router.use(protect);

// Student routes (before /:id to avoid conflicts)
router.get('/student/available',      authorize('student'), ctrl.getStudentExams);
router.get('/:examId/result',           authorize('student'), ctrl.getExamResult);
router.post('/:examId/save',           authorize('student'), ctrl.saveProgress);
router.post('/:examId/submit',         authorize('student'), ctrl.submitExam);
router.get('/:id/take',                authorize('student'), ctrl.startExam);

// Admin/Instructor: exam CRUD
router.get('/',                        authorize('admin', 'instructor'), ctrl.getExams);
router.post('/',                       authorize('admin', 'instructor'), ctrl.createExam);
router.put('/:id',                     authorize('admin', 'instructor'), ctrl.updateExam);
router.delete('/:id',                  authorize('admin'),               ctrl.deleteExam);

// MCQ management
router.post('/:id/mcqs',              authorize('admin', 'instructor'), ctrl.addMCQ);
router.delete('/:id/mcqs/:mcqId',     authorize('admin'),               ctrl.deleteMCQ);

// Essay management
router.post('/:id/essays',            authorize('admin', 'instructor'), ctrl.addEssay);
router.delete('/:id/essays/:essayId',  authorize('admin'),               ctrl.deleteEssay);

// Grading
router.get('/:id/attempts',            authorize('admin', 'instructor'), ctrl.getExamAttempts);
router.patch('/attempts/:attemptId/grade', authorize('admin', 'instructor'), ctrl.gradeAttempt);

// Get full exam (admin/instructor — includes correct answers)
router.get('/:id',                     authorize('admin', 'instructor'), ctrl.getExamById);

module.exports = router;
