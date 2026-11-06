const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  addWeek,
  updateWeek,
  deleteWeek,
  addTopic,
  deleteTopic,
  deleteCurriculum,
} = require('../controllers/curriculumController');

// ── Public: view curriculum for a course ─────────────────
router.get('/:courseId', getCurriculum);

// ── Admin / Instructor: manage curriculum ─────────────────
router.use(protect);
router.post('/',                                             authorize('admin', 'instructor'), createCurriculum);
router.put('/:courseId',                                    authorize('admin', 'instructor'), updateCurriculum);
router.delete('/:courseId',                                 authorize('admin'),               deleteCurriculum);

// Week management
router.post('/:courseId/weeks',                             authorize('admin', 'instructor'), addWeek);
router.put('/:courseId/weeks/:weekId',                      authorize('admin', 'instructor'), updateWeek);
router.delete('/:courseId/weeks/:weekId',                   authorize('admin'),               deleteWeek);

// Topic management
router.post('/:courseId/weeks/:weekId/topics',              authorize('admin', 'instructor'), addTopic);
router.delete('/:courseId/weeks/:weekId/topics/:topicId',   authorize('admin', 'instructor'), deleteTopic);

module.exports = router;
