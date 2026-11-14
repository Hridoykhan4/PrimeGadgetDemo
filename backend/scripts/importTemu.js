// Import NOVA TECH + DigiSouq listings (scraped from their Temu store pages) into Products.
// Usage: node scripts/importTemu.js        (upserts by sku = TEMU-<goodsId>)
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const STORES = [
  { file: 'novatech.json', brand: 'NOVA TECH' },
  { file: 'digisouq.json', brand: 'DigiSouq' },
];

const RULES = [
  ['Kids & Toys', /art set|kids|swim ring|rc airplane|aircraft|toy/i],
  ['Beauty & Personal Care', /hair dryer|straightener|trimmer|makeup|massager|scalp/i],
  ['Tools & Outdoor', /measuring tape|screwdriver|air pump|compressor|bbq|grill/i],
  ['Smart Home', /projector|desk lamp/i],
  ['Home & Kitchen', /kitchen|chopper|grinder|popcorn|coffee|iron|burner|oud|bakhoor|spice|potato|garlic|cutter|food processor|noodle|dish|drying rack/i],
  ['Accessories', /case|wallet|charg|separator|water bottle|fan/i],
];
const categoryFor = (name) => (RULES.find(([, re]) => re.test(name)) || ['Home & Kitchen'])[0];

const aed = (s) => (s ? parseFloat(s.replace(/[^0-9.]/g, '')) : 0);

function toProduct(raw, brand) {
  const lines = raw.lines || [];
  const name =
    lines.find((l) => l.length > 25 && !/^AED|^Original price|Fastest delivery|sold$/i.test(l)) ||
    (raw.alt || '').replace(/^item picture\s*/i, '');
  const price = aed(lines.find((l) => /^AED\d/.test(l)));
  const soldLine = lines.find((l) => /^\d[\d,.kK+]*\s*sold$/i.test(l));
  const sold = soldLine ? parseInt(soldLine.replace(/[^0-9]/g, ''), 10) || 0 : 0;
  const base = (raw.img || '').split('?')[0];
  const img = base ? base + '?imageView2/2/w/800/q/80/format/webp' : '';
  const cleanName = name.replace(/\s+/g, ' ').trim().slice(0, 200);

  return {
    name: cleanName,
    shortDescription: cleanName.split(',')[0].slice(0, 120),
    description: cleanName,
    price,
    salePrice: 0,
    category: categoryFor(cleanName),
    brand,
    sku: `TEMU-${raw.id}`,
    stock: 20,
    images: img ? [{ url: img, alt: cleanName.slice(0, 120) }] : [],
    tags: [brand.toLowerCase(), 'temu-import'],
    totalSold: sold,
    isNew: true,
    isBestSeller: sold >= 100,
    isActive: true,
    deliveryInfo: 'Fast delivery across UAE (1 business day)',
    metaTitle: `${cleanName.split(',')[0].slice(0, 60)} | PrimeGadgets`,
  };
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB_NAME || 'primegadgets' });
  console.log('Connected to db:', mongoose.connection.name);
  let created = 0, updated = 0, skipped = 0;
  for (const { file, brand } of STORES) {
    const rows = require(path.join(__dirname, '..', 'data', 'temu', file));
    for (const raw of rows) {
      const doc = toProduct(raw, brand);
      if (!doc.name || !doc.price || !/^https:/.test(doc.images[0]?.url || '')) { skipped++; console.log('skip', raw.id); continue; }
      const existing = await Product.findOne({ sku: doc.sku });
      if (existing) { Object.assign(existing, doc); await existing.save(); updated++; }
      else { await Product.create(doc); created++; }
    }
  }
  // Feature the 8 best sellers from the imported stores (drives the home hero + featured shelf)
  const top = await Product.find({ tags: 'temu-import' }).sort('-totalSold').limit(8).select('_id');
  await Product.updateMany({ tags: 'temu-import' }, { isFeatured: false });
  await Product.updateMany({ _id: { $in: top.map((t) => t._id) } }, { isFeatured: true });

  const byCat = await Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  console.log({ created, updated, skipped, total: await Product.countDocuments() });
  console.log(byCat);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
