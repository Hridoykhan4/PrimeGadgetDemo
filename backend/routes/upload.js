const express = require('express');
const fs = require('fs');
const r = express.Router();
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/auth');
const { saveBuffer, EXT } = require('../utils/media');

// POST /upload  (admin) — stores the image in our own media storage
r.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const f = req.files?.file;
  if (!f) return res.status(400).json({ success: false, message: 'No file uploaded' });
  if (!EXT[f.mimetype]) return res.status(400).json({ success: false, message: 'Only JPG, PNG, WEBP, GIF or AVIF images' });
  if (f.size > 5 * 1024 * 1024) return res.status(400).json({ success: false, message: 'Image must be under 5 MB' });
  const buf = f.tempFilePath ? fs.readFileSync(f.tempFilePath) : f.data;
  const saved = await saveBuffer(buf, { filename: f.name, contentType: f.mimetype, meta: { uploadedBy: String(req.user._id) } });
  if (f.tempFilePath) fs.unlink(f.tempFilePath, () => {});
  res.json({ success: true, url: saved.url, public_id: saved.id });
}));

module.exports = r;
