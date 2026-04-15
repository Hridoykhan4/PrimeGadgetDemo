const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const { AppError } = require('../middleware/errorHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const totalCount = await Product.countDocuments({ isActive: true });
  const features = new APIFeatures(Product.find({ isActive: true }), req.query)
    .search().filter().sort().paginate(12);
  const products = await features.query;

  res.json({ success: true, count: products.length, total: totalCount, products });
});

exports.getFeatured = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8);
  res.json({ success: true, products });
});

exports.getDeals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isDeal: true, isActive: true, salePrice: { $gt: 0 } }).limit(6);
  res.json({ success: true, products });
});

exports.getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).sort('-createdAt').limit(8);
  res.json({ success: true, products });
});

exports.getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true }).sort('-totalSold').limit(8);
  res.json({ success: true, products });
});

exports.searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });
  const products = await Product.find({
    isActive: true,
    name: { $regex: q, $options: 'i' }
  }).select('name images price salePrice category brand slug').limit(6);
  res.json({ success: true, suggestions: products });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true })
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, product });
});

exports.getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).limit(4);
  res.json({ success: true, products: related });
});

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  if (req.files?.images) {
    const cloudinary = require('../config/cloudinary');
    const imgs = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploaded = await Promise.all(imgs.map(img =>
      cloudinary.v2.uploader.upload(img.tempFilePath, { folder: 'primegadgets/products' })
    ));
    req.body.images = uploaded.map(r => ({ public_id: r.public_id, url: r.secure_url }));
  }
  if (req.body.specifications && typeof req.body.specifications === 'string') req.body.specifications = JSON.parse(req.body.specifications);
  if (req.body.features && typeof req.body.features === 'string') req.body.features = JSON.parse(req.body.features);
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, message: 'Product removed' });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const cats = await Product.distinct('category', { isActive: true });
  const withCount = await Promise.all(cats.map(async cat => ({
    name: cat, count: await Product.countDocuments({ category: cat, isActive: true })
  })));
  res.json({ success: true, categories: withCount });
});
