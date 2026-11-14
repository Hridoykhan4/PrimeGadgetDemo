const express = require('express');
const mongoose = require('mongoose');
const { bucket } = require('../utils/media');
const r = express.Router();

// GET /media/:id(.ext) — public, long-cached image delivery
r.get('/:file', async (req, res) => {
  const id = String(req.params.file).split('.')[0];
  if (!mongoose.isValidObjectId(id)) return res.status(404).end();
  try {
    const _id = new mongoose.Types.ObjectId(id);
    const file = await mongoose.connection.db.collection('media.files').findOne({ _id });
    if (!file) return res.status(404).end();
    res.set({
      'Content-Type': file.contentType || file.metadata?.contentType || 'application/octet-stream',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${id}"`,
    });
    if (req.headers['if-none-match'] === `"${id}"`) return res.status(304).end();
    bucket().openDownloadStream(_id).on('error', () => res.status(404).end()).pipe(res);
  } catch {
    res.status(404).end();
  }
});

module.exports = r;
