// ============================================================
// controllers/authController.js
// ============================================================
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const sendToken = (user, status, res) => {
  const token = user.getSignedJwtToken();
  user.password = undefined;
  res.status(status).json({ success: true, token, user });
};

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return next(new AppError('Email already registered', 400));
  const user = await User.create({ name, email, password });
  sendToken(user, 201, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) return next(new AppError('Invalid credentials', 401));
  if (!user.isActive) return next(new AppError('Account suspended', 401));
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });
  sendToken(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price salePrice');
  res.json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true, runValidators: true });
  res.json({ success: true, user });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) return next(new AppError('Current password incorrect', 401));
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user with that email', 404));
  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Reset email sent', resetToken: token });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken: hashed, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return next(new AppError('Invalid or expired reset token', 400));
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.indexOf(req.params.productId);
  idx === -1 ? user.wishlist.push(req.params.productId) : user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, addresses: user.addresses });
});
