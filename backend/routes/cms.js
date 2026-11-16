const express = require('express');
const r = express.Router();
const c = require('../controllers/cmsController');
const { protect, authorize } = require('../middleware/auth');

// Public
r.get('/storefront', c.getStorefront);
r.get('/storefront/section/:id/products', c.sectionProducts);

// Admin
r.get('/cms/settings', protect, authorize('admin'), c.adminGetSettings);
r.put('/cms/settings', protect, authorize('admin'), c.adminUpdateSettings);
r.get('/cms/:collection', protect, authorize('admin'), c.adminList);
r.post('/cms/:collection', protect, authorize('admin'), c.adminCreate);
r.put('/cms/:collection/reorder', protect, authorize('admin'), c.adminReorder);
r.put('/cms/:collection/:id', protect, authorize('admin'), c.adminUpdate);
r.delete('/cms/:collection/:id', protect, authorize('admin'), c.adminDelete);

module.exports = r;
