const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');

router.use(protect);
router.get('/',       getAssignments);
router.post('/',      authorize('admin', 'instructor'), createAssignment);
router.put('/:id',    authorize('admin', 'instructor'), updateAssignment);
router.delete('/:id', authorize('admin'),               deleteAssignment);
module.exports = router;
