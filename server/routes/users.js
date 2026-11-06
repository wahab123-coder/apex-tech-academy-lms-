const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUser, setUserRole, toggleActive, updateProfile } = require('../controllers/userController');

router.use(protect); // All user routes require auth

router.get('/',                      authorize('admin'), getAllUsers);
router.get('/:id',                   authorize('admin'), getUserById);
router.put('/profile',               updateProfile);
router.put('/:id',                   authorize('admin'), updateUser);
router.patch('/:id/role',            authorize('admin'), setUserRole);
router.patch('/:id/toggle-active',   authorize('admin'), toggleActive);

module.exports = router;
