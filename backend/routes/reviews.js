const express = require('express');
const rateLimit = require('express-rate-limit');
const r = express.Router();
const c = require('../controllers/reviewController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

const reviewLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: { success: false, message: 'Too many reviews, please try later' } });

r.get('/', protect, authorize('admin'), c.getAllReviews);
r.put('/:id/approval', protect, authorize('admin'), c.setApproval);
r.get('/product/:productId', c.getProductReviews);
r.post('/product/:productId', reviewLimit, optionalAuth, c.createReview);
r.delete('/:id', protect, c.deleteReview);
r.put('/:id/helpful', protect, c.markHelpful);
module.exports = r;
