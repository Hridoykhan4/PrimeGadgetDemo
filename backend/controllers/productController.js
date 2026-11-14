const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const { AppError } = require('../middleware/errorHandler');

exports.getProducts = asyncHandler(async (req, res) => {
  const countQuery = new APIFeatures(Product.find({ isActive: true }), req.query).search().filter();
  const totalCount = await Product.countDocuments(countQuery.query.getFilter());
  const features = new APIFeatures(Product.find({ isActive: true }), req.query)
    .search().filter().sort().paginate(12);
  const products = await features.query;

  res.json({ success: true, count: products.length, total: totalCount, products });
});

// GET /products/admin/all — admin list incl. hidden products, with search + status filter
exports.adminList = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'hidden') filter.isActive = false;
  if (req.query.status === 'low') { filter.isActive = true; filter.stock = { $lte: 5 }; }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    const q = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ name: { $regex: q, $options: 'i' } }, { sku: { $regex: q, $options: 'i' } }, { brand: { $regex: q, $options: 'i' } }];
  }
  const products = await Product.find(filter).sort('-createdAt').limit(500)
    .select('name images price salePrice stock category brand sku isActive isFeatured isBestSeller ratings numReviews totalSold createdAt');
  res.json({ success: true, total: products.length, products });
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
  const products = await Product.find({ isActive: true }).sort('-createdAt').limit(10);
  res.json({ success: true, products });
});

exports.getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isBestSeller: true, isActive: true }).sort('-totalSold').limit(8);
  res.json({ success: true, products });
});

exports.searchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json({ success: true, suggestions: [] });
  const safe = String(q).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const words = safe.split(/\s+/).filter(Boolean);
  const filter = { isActive: true, $and: words.map((w) => ({ $or: [{ name: { $regex: w, $options: 'i' } }, { category: { $regex: w, $options: 'i' } }, { tags: { $regex: w, $options: 'i' } }] })) };
  const [products, cats] = await Promise.all([
    Product.find(filter).select('name images price salePrice category brand slug').sort('-totalSold').limit(6),
    Product.aggregate([{ $match: filter }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 4 }]),
  ]);
  res.json({ success: true, suggestions: products, categories: cats.map((c) => ({ name: c._id, count: c.count })) });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true })
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' } });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, product });
});

exports.getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.json({ success: true, products: [] });
  const related = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).sort('-isBestSeller,-createdAt').limit(12);
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
  const body = { ...req.body };
  ['_id', 'createdAt', 'updatedAt', 'slug', 'reviews', 'id', 'ratings', 'numReviews'].forEach((k) => delete body[k]);
  if (body.salePrice !== undefined && body.price !== undefined) {
    body.discountPercent = body.salePrice > 0 && body.salePrice < body.price ? Math.round(((body.price - body.salePrice) / body.price) * 100) : 0;
  }
  const product = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return next(new AppError('Product not found', 404));
  res.json({ success: true, message: 'Product removed' });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const rows = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ success: true, categories: rows.map((r) => ({ name: r._id, count: r.count })) });
});
