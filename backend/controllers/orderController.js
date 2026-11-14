// controllers/orderController.js
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

const FREE_SHIPPING_MIN = 200;
const SHIPPING_FEE = 15;
const VAT_RATE = 0.05;
const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];
const round2 = (n) => Math.round(n * 100) / 100;

// Normalises UAE mobile numbers to +9715XXXXXXXX; returns null when invalid.
const normalizeUaePhone = (raw) => {
  let d = String(raw || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('971')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{8}$/.test(d) ? `+971${d}` : null;
};
exports.normalizeUaePhone = normalizeUaePhone;

// Who may see/act on an order: admin, the signed-in owner, or whoever holds the order's access key.
const canAccess = (order, req) => {
  if (req.user?.role === 'admin') return true;
  if (req.user && order.user && String(order.user._id || order.user) === String(req.user._id)) return true;
  const key = req.query.key || req.body?.key || req.headers['x-order-key'];
  return !!(key && order.accessKey && key.length === order.accessKey.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(order.accessKey)));
};
exports.canAccess = canAccess;

const releaseStock = async (order) => {
  if (order.stockReleased) return;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
  }
  order.stockReleased = true;
};
exports.releaseStock = releaseStock;

// POST /orders — works for guests and signed-in customers. Prices always come from the database.
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress = {}, paymentMethod = 'cod', notes } = req.body;
  if (!Array.isArray(items) || !items.length) return next(new AppError('Your cart is empty', 400));
  if (!['cod', 'card'].includes(paymentMethod)) return next(new AppError('Choose Cash on Delivery or Card', 400));

  const fullName = String(shippingAddress.fullName || '').trim();
  const street = String(shippingAddress.street || '').trim();
  const phone = normalizeUaePhone(shippingAddress.phone);
  const email = String(shippingAddress.email || req.user?.email || '').trim().toLowerCase();
  const emirate = EMIRATES.includes(shippingAddress.emirate) ? shippingAddress.emirate : 'Dubai';
  if (fullName.length < 2) return next(new AppError('Please enter your full name', 400));
  if (!phone) return next(new AppError('Please enter a valid UAE mobile number (05X XXX XXXX)', 400));
  if (street.length < 3) return next(new AppError('Please enter your delivery address', 400));
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return next(new AppError('Please enter a valid email', 400));

  // Merge duplicate lines and validate stock/prices
  const merged = new Map();
  for (const it of items) {
    const id = String(it.product || '');
    const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1));
    merged.set(id, (merged.get(id) || 0) + qty);
  }
  const orderItems = [];
  let itemsTotal = 0;
  for (const [id, quantity] of merged) {
    const p = await Product.findOne({ _id: id, isActive: true }).catch(() => null);
    if (!p) return next(new AppError('One of the products in your cart is no longer available', 404));
    if (p.stock < quantity) return next(new AppError(`Only ${p.stock} left of "${p.name.slice(0, 40)}"`, 400));
    const price = p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price;
    orderItems.push({ product: p._id, name: p.name, image: p.images[0]?.url, price, quantity });
    itemsTotal += price * quantity;
  }
  itemsTotal = round2(itemsTotal);
  const shippingFee = itemsTotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const tax = round2(itemsTotal * VAT_RATE);
  const total = round2(itemsTotal + shippingFee + tax);

  // Reserve stock atomically; roll back if any line fails
  const reserved = [];
  for (const it of orderItems) {
    const ok = await Product.findOneAndUpdate(
      { _id: it.product, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity, totalSold: it.quantity } }
    );
    if (!ok) {
      for (const r of reserved) await Product.findByIdAndUpdate(r.product, { $inc: { stock: r.quantity, totalSold: -r.quantity } });
      return next(new AppError(`"${it.name.slice(0, 40)}" just sold out`, 400));
    }
    reserved.push(it);
  }

  const accessKey = crypto.randomBytes(24).toString('hex');
  const order = await Order.create({
    user: req.user?._id,
    isGuest: !req.user,
    accessKey,
    items: orderItems,
    shippingAddress: {
      fullName, phone, email: email || undefined, street,
      area: String(shippingAddress.area || '').trim(),
      landmark: String(shippingAddress.landmark || '').trim(),
      city: emirate, emirate, country: 'UAE',
    },
    paymentMethod, itemsTotal, shippingFee, tax, total,
    notes: notes ? String(notes).slice(0, 500) : undefined,
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 3600 * 1000),
  });

  const out = order.toObject();
  delete out.accessKey;
  res.status(201).json({ success: true, order: out, accessKey });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt').populate('items.product', 'name images');
  res.json({ success: true, orders });
});

// GET /orders/:id  — owner, admin, or ?key=<accessKey>
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).select('+accessKey')
    .populate('user', 'name email').populate('items.product', 'name images slug').catch(() => null);
  if (!order) return next(new AppError('Order not found', 404));
  if (!canAccess(order, req)) return next(new AppError('Order not found', 404));
  const out = order.toObject();
  delete out.accessKey;
  res.json({ success: true, order: out });
});

// POST /orders/track { orderNumber, phone } — guest order lookup
exports.trackOrder = asyncHandler(async (req, res, next) => {
  const orderNumber = String(req.body.orderNumber || '').trim().toUpperCase();
  const phone = normalizeUaePhone(req.body.phone);
  if (!orderNumber || !phone) return next(new AppError('Enter your order number and mobile number', 400));
  const order = await Order.findOne({ orderNumber, 'shippingAddress.phone': phone }).select('+accessKey');
  if (!order) return next(new AppError('No order found with these details', 404));
  res.json({ success: true, orderId: order._id, accessKey: order.accessKey });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.payment === 'paid') filter.isPaid = true;
  if (req.query.payment === 'unpaid') filter.isPaid = false;
  if (req.query.method) filter.paymentMethod = req.query.method;
  if (req.query.q) {
    const q = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { orderNumber: { $regex: q, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: q.replace(/\s/g, ''), $options: 'i' } },
      { 'shippingAddress.email': { $regex: q, $options: 'i' } },
    ];
  }
  const [total, orders] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit),
  ]);
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), orders });
});

exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError('Order not found', 404));
  const { status, note, trackingNumber, isPaid } = req.body;
  if (status && status !== order.status) {
    if (order.status === 'cancelled') return next(new AppError('Cancelled orders cannot be reopened', 400));
    order.status = status;
    order.statusHistory.push({ status, note });
    if (status === 'delivered') {
      order.isDelivered = true; order.deliveredAt = Date.now();
      if (order.paymentMethod === 'cod' && !order.isPaid) { order.isPaid = true; order.paidAt = Date.now(); }
    }
    if (status === 'cancelled' || status === 'refunded') await releaseStock(order);
  }
  if (typeof isPaid === 'boolean' && isPaid !== order.isPaid) {
    order.isPaid = isPaid; order.paidAt = isPaid ? Date.now() : undefined;
    order.statusHistory.push({ status: order.status, note: isPaid ? 'Marked as paid' : 'Marked as unpaid' });
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  await order.save();
  res.json({ success: true, order });
});

exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).select('+accessKey');
  if (!order || !canAccess(order, req)) return next(new AppError('Order not found', 404));
  if (!['pending', 'confirmed'].includes(order.status) && req.user?.role !== 'admin') {
    return next(new AppError('This order is already being prepared. Please contact us on WhatsApp.', 400));
  }
  if (order.status === 'cancelled') return res.json({ success: true, order });
  order.status = 'cancelled';
  order.cancelReason = req.body.reason;
  order.statusHistory.push({ status: 'cancelled', note: req.body.reason || 'Cancelled by customer' });
  await releaseStock(order);
  await order.save();
  const out = order.toObject(); delete out.accessKey;
  res.json({ success: true, order: out });
});

// Card orders that were never paid release their stock after 2 hours.
exports.sweepAbandonedCardOrders = async () => {
  const cutoff = new Date(Date.now() - 2 * 3600 * 1000);
  const stale = await Order.find({ paymentMethod: 'card', isPaid: false, status: 'pending', createdAt: { $lt: cutoff } });
  for (const order of stale) {
    order.status = 'cancelled';
    order.cancelReason = 'Card payment not completed';
    order.statusHistory.push({ status: 'cancelled', note: 'Card payment not completed within 2 hours' });
    await releaseStock(order);
    await order.save();
  }
  return stale.length;
};
