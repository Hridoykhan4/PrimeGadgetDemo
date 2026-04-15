const express = require('express');
const r = express.Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
r.get('/product/:productId', c.getProductReviews);
r.post('/product/:productId', protect, c.createReview);
r.delete('/:id', protect, c.deleteReview);
r.put('/:id/helpful', protect, c.markHelpful);
module.exports = r;
