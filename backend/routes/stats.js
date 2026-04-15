const express = require('express');
const r = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/statsController');
r.get('/', protect, authorize('admin'), getDashboard);
module.exports = r;
