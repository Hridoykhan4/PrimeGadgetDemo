const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar').sort('-createdAt');
  res.json({ success: true, count: reviews.length, reviews });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  const existing = await Review.findOne({ product: req.params.productId, user: req.user._id });
  if (existing) return next(new AppError('Already reviewed this product', 400));
  const verifiedOrder = await Order.findOne({ user: req.user._id, 'items.product': req.params.productId, status: 'delivered' });
  const review = await Review.create({
    product: req.params.productId, user: req.user._id,
    rating: req.body.rating, title: req.body.title, body: req.body.body,
    pros: req.body.pros, cons: req.body.cons, isVerifiedPurchase: !!verifiedOrder
  });
  await review.populate('user', 'name avatar');
  res.status(201).json({ success: true, review });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  const idx = review.helpful.indexOf(req.user._id);
  idx === -1 ? review.helpful.push(req.user._id) : review.helpful.splice(idx, 1);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
});
