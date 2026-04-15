// controllers/statsController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments(), Product.countDocuments({ isActive: true }), User.countDocuments({ role: 'user' })
  ]);
  const revenueRes = await Order.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    { $group: { _id: null, total: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueRes[0]?.total || 0;
  const statusBreakdown = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const last6Months = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 3600 * 1000) }, status: { $ne: 'cancelled' } } },
    { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, revenue: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { '_id.y': 1, '_id.m': 1 } }
  ]);
  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { sold: -1 } }, { $limit: 5 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { name: '$product.name', image: { $arrayElemAt: ['$product.images.url', 0] }, sold: 1, revenue: 1 } }
  ]);
  const recentOrders = await Order.find().populate('user', 'name').sort('-createdAt').limit(5);
  res.json({ success: true, stats: { totalOrders, totalProducts, totalUsers, totalRevenue, statusBreakdown, last6Months, topProducts, recentOrders } });
});
