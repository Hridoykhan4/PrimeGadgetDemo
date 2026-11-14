const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

const shape = (r) => {
  const o = r.toObject ? r.toObject() : r;
  return { ...o, displayName: o.user?.name || o.name || 'Customer', helpfulCount: o.helpful?.length || 0, helpful: undefined, email: undefined };
};

// GET /reviews/product/:productId — approved reviews + rating breakdown
exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name').sort('-createdAt').limit(100);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  const avg = reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0;
  res.json({ success: true, count: reviews.length, average: avg, breakdown, reviews: reviews.map(shape) });
});

// POST /reviews/product/:productId — signed-in customers or guests (name required)
exports.createReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId).catch(() => null);
  if (!product) return next(new AppError('Product not found', 404));
  const rating = parseInt(req.body.rating, 10);
  const body = String(req.body.body || '').trim();
  const name = String(req.body.name || req.user?.name || '').trim();
  if (!(rating >= 1 && rating <= 5)) return next(new AppError('Please choose a star rating', 400));
  if (body.length < 5) return next(new AppError('Please write a few words about the product', 400));
  if (!req.user && name.length < 2) return next(new AppError('Please enter your name', 400));

  let isVerifiedPurchase = false;
  if (req.user) {
    const existing = await Review.findOne({ product: product._id, user: req.user._id });
    if (existing) return next(new AppError('You have already reviewed this product', 400));
    isVerifiedPurchase = !!(await Order.exists({ user: req.user._id, 'items.product': product._id, status: 'delivered' }));
  }
  const review = await Review.create({
    product: product._id,
    user: req.user?._id,
    name: name.slice(0, 60),
    email: req.body.email ? String(req.body.email).slice(0, 120) : undefined,
    rating,
    title: String(req.body.title || '').trim().slice(0, 100),
    body: body.slice(0, 2000),
    isVerifiedPurchase,
  });
  await review.populate('user', 'name');
  res.status(201).json({ success: true, review: shape(review) });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  if (String(review.user) !== String(req.user._id) && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted' });
});

exports.markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));
  const idx = review.helpful.findIndex((u) => String(u) === String(req.user._id));
  idx === -1 ? review.helpful.push(req.user._id) : review.helpful.splice(idx, 1);
  await review.save();
  res.json({ success: true, helpfulCount: review.helpful.length });
});

// Admin
exports.getAllReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'hidden') filter.isApproved = false;
  if (req.query.status === 'visible') filter.isApproved = true;
  const reviews = await Review.find(filter).select('+email').populate('user', 'name email')
    .populate('product', 'name images').sort('-createdAt').limit(300);
  res.json({ success: true, reviews: reviews.map((r) => ({ ...r.toObject(), displayName: r.user?.name || r.name || 'Customer' })) });
});

exports.setApproval = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: !!req.body.isApproved }, { new: true });
  if (!review) return next(new AppError('Review not found', 404));
  res.json({ success: true, review });
});
