// One-off catalog cleanup:
//  - copies every external product image into our own media storage (GridFS → /media/:id)
//  - replaces marketplace SKUs/tags with PrimeGadgets ones
//  - resets "sold" counters to real PrimeGadgets order quantities
//  - makes the review index allow guest reviews
// Usage: node scripts/cleanupCatalog.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { saveBuffer, publicBase } = require('../utils/media');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || 'primegadgets' });
  const db = mongoose.connection.db;
  const ours = `${publicBase()}/media/`;
  const urlMap = new Map();

  const products = await Product.find({}).select('name slug images sku tags');
  let moved = 0;
  for (const p of products) {
    let changed = false;
    for (const img of p.images) {
      if (!img.url || img.url.startsWith(ours)) continue;
      if (urlMap.has(img.url)) { img.url = urlMap.get(img.url); changed = true; continue; }
      try {
        const r = await fetch(img.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const type = (r.headers.get('content-type') || 'image/webp').split(';')[0];
        const buf = Buffer.from(await r.arrayBuffer());
        const saved = await saveBuffer(buf, { filename: `${p.slug || p._id}`, contentType: type, meta: { product: String(p._id) } });
        urlMap.set(img.url, saved.url);
        img.url = saved.url;
        moved++; changed = true;
      } catch (e) {
        console.log('  ! image failed for', p.name.slice(0, 40), e.message);
      }
    }
    if (p.sku && /^TEMU-/i.test(p.sku)) { p.sku = p.sku.replace(/^TEMU-/i, 'PG-'); changed = true; }
    const tags = (p.tags || []).filter((t) => !/temu/i.test(t));
    if (tags.length !== (p.tags || []).length) { p.tags = tags; changed = true; }
    // updateOne, not save(): Product has an `isNew` field that clashes with Mongoose's document flag
    if (changed) await Product.updateOne({ _id: p._id }, { $set: { images: p.images.map((i) => i.toObject()), sku: p.sku, tags: p.tags } });
  }
  console.log(`images copied: ${moved}`);

  // Real sold counts from our own orders
  const sold = await Order.aggregate([
    { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', qty: { $sum: '$items.quantity' } } },
  ]);
  await Product.updateMany({}, { totalSold: 0 });
  for (const s of sold) await Product.updateOne({ _id: s._id }, { totalSold: s.qty });
  console.log(`sold counters reset (${sold.length} products have real orders)`);

  // Existing orders: point item images at our copies
  for (const o of await Order.find({})) {
    let ch = false;
    for (const it of o.items) if (urlMap.has(it.image)) { it.image = urlMap.get(it.image); ch = true; }
    if (ch) await o.save();
  }

  // Guest reviews: replace the strict unique index
  const idx = await db.collection('reviews').indexes().catch(() => []);
  if (idx.find((i) => i.name === 'product_1_user_1' && !i.partialFilterExpression)) {
    await db.collection('reviews').dropIndex('product_1_user_1');
    console.log('dropped old review index');
  }
  await mongoose.model('Review', require('../models/Review').schema).syncIndexes().catch(() => {});

  console.log('done');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
