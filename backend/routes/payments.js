// routes/payments.js
const express = require('express');
const r = express.Router();
const { protect } = require('../middleware/auth');
const { createCheckoutSession, verifyCheckoutSession, getPublishableKey } = require('../controllers/paymentController');

r.get('/key', getPublishableKey);
r.post('/checkout-session', protect, createCheckoutSession);
r.get('/verify/:orderId', protect, verifyCheckoutSession);
module.exports = r;
