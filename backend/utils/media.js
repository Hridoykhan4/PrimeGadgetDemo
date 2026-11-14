// Product images stored in MongoDB GridFS and served by this API (/media/:id).
// Keeps images on our own domain with no third-party image host needed.
const mongoose = require('mongoose');

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
const publicBase = () => (process.env.API_PUBLIC_URL || 'https://api.primegadgets.ae').replace(/\/$/, '');
const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif' };

function saveBuffer(buffer, { filename = 'image', contentType = 'image/webp', meta = {} } = {}) {
  return new Promise((resolve, reject) => {
    const up = bucket().openUploadStream(filename, { contentType, metadata: { ...meta, contentType } });
    up.on('error', reject);
    up.on('finish', () => resolve({
      id: up.id.toString(),
      url: `${publicBase()}/media/${up.id}.${EXT[contentType] || 'img'}`,
    }));
    up.end(buffer);
  });
}

module.exports = { bucket, saveBuffer, publicBase, EXT };
