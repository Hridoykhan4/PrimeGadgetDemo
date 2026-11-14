// routes/products.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

r.get('/featured', c.getFeatured);
r.get('/deals', c.getDeals);
r.get('/new-arrivals', c.getNewArrivals);
r.get('/best-sellers', c.getBestSellers);
r.get('/search/suggestions', c.searchSuggestions);
r.get('/categories', c.getCategories);
r.get('/admin/all', protect, authorize('admin'), c.adminList);
r.get('/:id/related', c.getRelated);
r.route('/').get(c.getProducts).post(protect, authorize('admin'), c.createProduct);
r.route('/:id').get(c.getProduct).put(protect, authorize('admin'), c.updateProduct).delete(protect, authorize('admin'), c.deleteProduct);

module.exports = r;
