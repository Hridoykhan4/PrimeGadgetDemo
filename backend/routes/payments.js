// routes/payments.js
const express = require('express');
const r = express.Router();
const { optionalAuth } = require('../middleware/auth');
const { createCheckoutSession, verifyCheckoutSession, getPublishableKey } = require('../controllers/paymentController');

r.get('/key', getPublishableKey);
r.post('/checkout-session', optionalAuth, createCheckoutSession);
r.get('/verify/:orderId', optionalAuth, verifyCheckoutSession);
module.exports = r;
