// ===== routes/auth.js =====
const express = require('express');
const r = express.Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');

r.post('/register', c.register);
r.post('/login', c.login);
r.post('/forgotpassword', c.forgotPassword);
r.put('/resetpassword/:token', c.resetPassword);
r.get('/me', protect, c.getMe);
r.put('/updateprofile', protect, c.updateProfile);
r.put('/updatepassword', protect, c.updatePassword);
r.put('/wishlist/:productId', protect, c.toggleWishlist);
r.post('/address', protect, c.addAddress);

module.exports = r;
