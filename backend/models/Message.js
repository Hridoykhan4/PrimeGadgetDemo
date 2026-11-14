const mongoose = require('mongoose');

// Contact-form messages and customer feedback, read in Admin → Messages
const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, trim: true, lowercase: true, maxlength: 120 },
  phone: { type: String, trim: true, maxlength: 30 },
  subject: { type: String, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  type: { type: String, enum: ['contact', 'feedback'], default: 'contact' },
  rating: { type: Number, min: 1, max: 5 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
