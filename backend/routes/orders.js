// routes/orders.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
r.use(protect);
r.post('/', c.createOrder);
r.get('/my', c.getMyOrders);
r.get('/', authorize('admin'), c.getAllOrders);
r.get('/:id', c.getOrder);
r.put('/:id/status', authorize('admin'), c.updateOrderStatus);
r.put('/:id/cancel', c.cancelOrder);
module.exports = r;
