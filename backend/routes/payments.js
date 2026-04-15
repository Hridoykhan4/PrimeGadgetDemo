// routes/payments.js
const express = require('express');
const r = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, getPublishableKey } = require('../controllers/paymentController');
r.get('/key', protect, getPublishableKey);
r.post('/intent', protect, createPaymentIntent);
module.exports = r;
