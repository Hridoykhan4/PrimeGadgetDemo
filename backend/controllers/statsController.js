// controllers/statsController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Message = require('../models/Message');

// Revenue counts orders that are paid, or COD orders that are not cancelled (money expected on delivery).
const REVENUE_MATCH = { status: { $nin: ['cancelled', 'refunded'] }, $or: [{ isPaid: true }, { paymentMethod: 'cod' }] };

exports.getDashboard = asyncHandler(async (req, res) => {
  const DAY = 24 * 3600 * 1000;
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' });
  const startToday = new Date(`${todayKey}T00:00:00+04:00`);
  const start30 = new Date(Date.now() - 30 * DAY);
  const start14 = new Date(startToday.getTime() - 13 * DAY);

  const [
    totalOrders, totalProducts, totalUsers, pendingOrders, toShip, unreadMessages, totalReviews,
    revenueAll, revenueToday, revenue30, ordersToday, statusBreakdown, daily, paymentSplit,
    topProducts, recentOrders, lowStock, customers,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: { $in: ['confirmed', 'processing'] } }),
    Message.countDocuments({ isRead: false }),
    Review.countDocuments(),
    Order.aggregate([{ $match: REVENUE_MATCH }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { ...REVENUE_MATCH, createdAt: { $gte: startToday } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { ...REVENUE_MATCH, createdAt: { $gte: start30 } } }, { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }]),
    Order.countDocuments({ createdAt: { $gte: startToday } }),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { ...REVENUE_MATCH, createdAt: { $gte: start14 } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Dubai' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $match: { status: { $nin: ['cancelled', 'refunded'] } } }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } }]),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', sold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { sold: -1 } }, { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', image: { $arrayElemAt: ['$product.images.url', 0] }, sold: 1, revenue: 1 } },
    ]),
    Order.find().populate('user', 'name').sort('-createdAt').limit(8),
    Product.find({ isActive: true, stock: { $lte: 5 } }).select('name stock images').sort('stock').limit(8),
    Order.distinct('shippingAddress.phone'),
  ]);

  // Continuous 14-day axis (Dubai time)
  const byDay = Object.fromEntries(daily.map((d) => [d._id, d]));
  const last14 = [];
  for (let i = 0; i < 14; i++) {
    const key = new Date(start14.getTime() + i * DAY + 12 * 3600 * 1000).toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' });
    last14.push({ date: key, revenue: Math.round((byDay[key]?.revenue || 0) * 100) / 100, orders: byDay[key]?.orders || 0 });
  }

  const revCount = revenueAll[0]?.count || 0;
  res.json({
    success: true,
    stats: {
      totalOrders, totalProducts, totalUsers, pendingOrders, toShip, unreadMessages, totalReviews, ordersToday,
      totalCustomers: customers.length,
      totalRevenue: revenueAll[0]?.total || 0,
      revenueToday: revenueToday[0]?.total || 0,
      revenue30: revenue30[0]?.total || 0,
      avgOrderValue: revCount ? revenueAll[0].total / revCount : 0,
      statusBreakdown, last14, paymentSplit, topProducts, recentOrders, lowStock,
    },
  });
});
