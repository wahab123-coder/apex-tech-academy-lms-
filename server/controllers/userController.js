const User = require('../models/User');

// ── @GET /api/users — Admin: list all users ───────────────
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName:  { $regex: search, $options: 'i' } },
      { email:     { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, total, page: Number(page), users });
  } catch (err) {
    next(err);
  }
};

// ── @GET /api/users/:id ───────────────────────────────────
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/users/:id — Admin: update any user ─────────
exports.updateUser = async (req, res, next) => {
  try {
    // Prevent role escalation through this endpoint
    const { password, role, ...updates } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/users/:id/role — Admin: set role ────────────
exports.setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: `User role updated to ${role}.`, user });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/users/:id/toggle-active — Admin ─────────────
exports.toggleActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: `Account ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    next(err);
  }
};

// ── @PUT /api/users/profile — Authenticated: update own profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { password, role, ...updates } = req.body; // Never allow self-role change
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
