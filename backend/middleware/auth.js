const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  if (!token) return next(new AppError('Please login to access this resource', 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  if (!req.user || !req.user.isActive) return next(new AppError('Account not found or deactivated', 401));
  next();
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new AppError(`Access denied for role: ${req.user.role}`, 403));
  next();
};

// Attaches req.user when a valid token is sent, but never blocks the request (guest checkout, guest reviews).
exports.optionalAuth = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (h?.startsWith('Bearer ')) {
      const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    }
  } catch { /* invalid/expired token → treat as guest */ }
  next();
};
