// routes/orders.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const r = express.Router();
const c = require('../controllers/orderController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const placeLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, message: { success: false, message: 'Too many orders, please wait a few minutes' } });
const trackLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts, please wait' } });

r.post('/', placeLimit, optionalAuth, c.createOrder);
r.post('/track', trackLimit, c.trackOrder);
r.get('/my', protect, c.getMyOrders);
r.get('/', protect, authorize('admin'), c.getAllOrders);
r.get('/:id', optionalAuth, c.getOrder);
r.put('/:id/status', protect, authorize('admin'), c.updateOrderStatus);
r.put('/:id/cancel', optionalAuth, c.cancelOrder);
module.exports = r;
