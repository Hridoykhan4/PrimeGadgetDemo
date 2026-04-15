// controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  if (!items?.length) return next(new AppError('No items in order', 400));

  let itemsTotal = 0;
  for (const item of items) {
    const p = await Product.findById(item.product);
    if (!p) return next(new AppError(`Product not found: ${item.product}`, 404));
    if (p.stock < item.quantity) return next(new AppError(`Insufficient stock: ${p.name}`, 400));
    const price = p.salePrice > 0 ? p.salePrice : p.price;
    item.price = price; item.name = p.name; item.image = p.images[0]?.url;
    itemsTotal += price * item.quantity;
  }

  const shippingFee = itemsTotal >= 200 ? 0 : 15;
  const tax = Math.round(itemsTotal * 0.05 * 100) / 100;
  const total = itemsTotal + shippingFee + tax;

  const order = await Order.create({ user: req.user._id, items, shippingAddress, paymentMethod, itemsTotal, shippingFee, tax, total, couponCode });

  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
  }

  res.status(201).json({ success: true, order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('items.product', 'name images');
  res.json({ success: true, orders });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email').populate('items.product', 'name images');
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  res.json({ success: true, order });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter).populate('user', 'name email').sort('-createdAt').skip((page-1)*limit).limit(limit);
  res.json({ success: true, total, orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, note: req.body.note });
  if (req.body.status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
  await order.save();
  res.json({ success: true, order });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') return next(new AppError('Not authorized', 403));
  if (['shipped', 'delivered'].includes(order.status)) return next(new AppError('Cannot cancel shipped/delivered order', 400));
  order.status = 'cancelled'; order.cancelReason = req.body.reason;
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason });
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
  }
  await order.save();
  res.json({ success: true, order });
});
