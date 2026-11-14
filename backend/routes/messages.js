const express = require('express');
const rateLimit = require('express-rate-limit');
const r = express.Router();
const c = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const sendLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 6, message: { success: false, message: 'Too many messages, please try later' } });
r.post('/', sendLimit, c.createMessage);
r.get('/', protect, authorize('admin'), c.getMessages);
r.put('/:id', protect, authorize('admin'), c.updateMessage);
r.delete('/:id', protect, authorize('admin'), c.deleteMessage);
module.exports = r;
