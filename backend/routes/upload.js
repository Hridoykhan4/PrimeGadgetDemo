const express = require('express');
const r = express.Router();
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

r.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  if (!req.files?.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const result = await cloudinary.v2.uploader.upload(req.files.file.tempFilePath, { folder: 'primegadgets' });
  res.json({ success: true, url: result.secure_url, public_id: result.public_id });
}));

module.exports = r;
