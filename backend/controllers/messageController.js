const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const { AppError } = require('../middleware/errorHandler');

exports.createMessage = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message, type, rating } = req.body;
  if (!name || String(name).trim().length < 2) return next(new AppError('Please enter your name', 400));
  if (!message || String(message).trim().length < 5) return next(new AppError('Please write your message', 400));
  if (!email && !phone) return next(new AppError('Please add an email or phone so we can reply', 400));
  await Message.create({
    name, email, phone, subject, message,
    type: type === 'feedback' ? 'feedback' : 'contact',
    rating: rating ? Math.max(1, Math.min(5, parseInt(rating, 10))) : undefined,
  });
  res.status(201).json({ success: true, message: 'Thanks! We received your message.' });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const filter = req.query.unread ? { isRead: false } : {};
  const messages = await Message.find(filter).sort('-createdAt').limit(300);
  res.json({ success: true, messages });
});

exports.updateMessage = asyncHandler(async (req, res, next) => {
  const m = await Message.findByIdAndUpdate(req.params.id, { isRead: !!req.body.isRead }, { new: true });
  if (!m) return next(new AppError('Message not found', 404));
  res.json({ success: true, message: m });
});

exports.deleteMessage = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
