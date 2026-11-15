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

// ── DELETE /api/users/:id — Admin: delete a user ─────────
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `${user.firstName} ${user.lastName} has been deleted.` });
  } catch (err) { next(err); }
});

module.exports = router;
