const express = require('express');
const r = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
r.use(protect, authorize('admin'));
r.get('/', asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.json({ success: true, count: users.length, users });
}));
r.put('/:id', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role, isActive: req.body.isActive }, { new: true });
  res.json({ success: true, user });
}));
r.delete('/:id', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted' });
}));
module.exports = r;
