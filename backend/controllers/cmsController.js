// controllers/cmsController.js — storefront content (settings, banners, home sections, categories)
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { Setting, Banner, Section, Category } = require('../models/Cms');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

const CARD_FIELDS = 'name images price salePrice stock category brand isBestSeller isNew isFeatured ratings numReviews slug';

// ── Settings (cached; used by checkout/orders too) ─────────
let cache = { at: 0, doc: null };
async function getSiteSettings(force = false) {
  if (!force && cache.doc && Date.now() - cache.at < 30000) return cache.doc;
  let doc = await Setting.findOne({ key: 'site' }).lean();
  if (!doc) doc = (await Setting.create({ key: 'site' })).toObject();
  cache = { at: Date.now(), doc };
  return doc;
}
exports.getSiteSettings = getSiteSettings;
const bust = () => { cache = { at: 0, doc: null }; };

exports.commerceOf = async () => {
  const s = await getSiteSettings();
  return {
    freeShippingMin: s.commerce?.freeShippingMin ?? 200,
    shippingFee: s.commerce?.shippingFee ?? 15,
    vatRate: (s.commerce?.vatRate ?? 5) / 100,
    codEnabled: s.commerce?.codEnabled !== false,
    cardEnabled: s.commerce?.cardEnabled !== false,
  };
};

// ── Section product resolution ─────────────────────────────
async function productsFor(section) {
  const src = section.source || {};
  const limit = section.limit || 12;
  const base = { isActive: true };
  switch (src.mode) {
    case 'manual': {
      const ids = (src.productIds || []).map(String);
      if (!ids.length) return [];
      const list = await Product.find({ ...base, _id: { $in: ids } }).select(CARD_FIELDS).lean();
      return ids.map((id) => list.find((p) => String(p._id) === id)).filter(Boolean).slice(0, limit);
    }
    case 'category':
      return Product.find({ ...base, category: src.category }).sort('-isBestSeller -createdAt').limit(limit).select(CARD_FIELDS).lean();
    case 'newest':
      return Product.find(base).sort('-createdAt').limit(limit).select(CARD_FIELDS).lean();
    case 'price':
      return Product.find({ ...base, price: { $lte: src.maxPrice || 50 } }).sort('price').limit(limit).select(CARD_FIELDS).lean();
    case 'sale':
      return Product.find({ ...base, salePrice: { $gt: 0 } }).sort('-discountPercent').limit(limit).select(CARD_FIELDS).lean();
    case 'flag':
    default:
      return Product.find({ ...base, [src.flag || 'isBestSeller']: true }).sort('-createdAt').limit(limit).select(CARD_FIELDS).lean();
  }
}

async function categoriesWithCounts({ includeHidden = false } = {}) {
  const [cats, counts] = await Promise.all([
    Category.find(includeHidden ? {} : { isVisible: true }).sort('order name').lean(),
    Product.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);
  const byName = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  return cats.map((c) => ({ ...c, count: byName[c.name] || 0 }));
}
exports.categoriesWithCounts = categoriesWithCounts;

// GET /storefront — everything the home page + header/footer need, in one request
exports.getStorefront = asyncHandler(async (req, res) => {
  const now = new Date();
  const timeOk = { $and: [
    { $or: [{ startsAt: null }, { startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
    { $or: [{ endsAt: null }, { endsAt: { $exists: false } }, { endsAt: { $gte: now } }] },
  ] };
  const [settings, banners, sections, categories] = await Promise.all([
    getSiteSettings(),
    Banner.find({ isActive: true, ...timeOk }).sort('placement order').populate('product', CARD_FIELDS).lean(),
    Section.find({ isActive: true }).sort('order').lean(),
    categoriesWithCounts(),
  ]);
  const resolved = await Promise.all(sections.map(async (s) => (
    s.type === 'products' ? { ...s, products: await productsFor(s) } : s
  )));
  const usable = banners.filter((b) => b.kind === 'custom' || (b.product && b.product.stock !== undefined));
  res.set('Cache-Control', 'public, max-age=30');
  res.json({
    success: true,
    settings,
    banners: { hero: usable.filter((b) => b.placement === 'hero'), side: usable.filter((b) => b.placement === 'side') },
    sections: resolved,
    categories: categories.filter((c) => c.count > 0),
  });
});

// GET /storefront/section/:id/products?maxPrice= — used by price tabs
exports.sectionProducts = asyncHandler(async (req, res) => {
  const s = await Section.findById(req.params.id).lean().catch(() => null);
  if (!s) return res.json({ success: true, products: [] });
  const max = Number(req.query.maxPrice) || s.priceTabs?.[0] || 50;
  const products = await productsFor({ ...s, source: { mode: 'price', maxPrice: max }, limit: s.limit || 14 });
  res.json({ success: true, products });
});

// ── Admin: settings ────────────────────────────────────────
exports.adminGetSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, settings: await getSiteSettings(true) });
});
exports.adminUpdateSettings = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  ['_id', 'key', 'createdAt', 'updatedAt', '__v'].forEach((k) => delete body[k]);
  // Flatten to dotted paths so a partial update never wipes other fields in the same group
  const flat = {};
  const walk = (obj, prefix) => Object.entries(obj || {}).forEach(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, path); else flat[path] = v;
  });
  walk(body, '');
  const doc = await Setting.findOneAndUpdate({ key: 'site' }, { $set: flat }, { new: true, upsert: true, runValidators: true });
  bust();
  res.json({ success: true, settings: doc });
});

// ── Admin: generic CRUD + reorder for banners/sections/categories ──
const MODELS = { banners: Banner, sections: Section, categories: Category };
const modelOf = (req, next) => {
  const M = MODELS[req.params.collection];
  if (!M) next(new AppError('Unknown collection', 404));
  return M;
};
const clean = (b) => { const x = { ...b }; ['_id', 'createdAt', 'updatedAt', '__v', 'products', 'count'].forEach((k) => delete x[k]); return x; };

exports.adminList = asyncHandler(async (req, res, next) => {
  const M = modelOf(req, next); if (!M) return;
  if (M === Category) return res.json({ success: true, items: await categoriesWithCounts({ includeHidden: true }) });
  let q = M.find().sort(M === Banner ? 'placement order' : 'order');
  if (M === Banner) q = q.populate('product', 'name images price salePrice stock');
  if (M === Section) q = q.populate('source.productIds', 'name images price');
  res.json({ success: true, items: await q.lean() });
});

exports.adminCreate = asyncHandler(async (req, res, next) => {
  const M = modelOf(req, next); if (!M) return;
  const body = clean(req.body);
  if (body.order === undefined) {
    const filter = M === Banner ? { placement: body.placement || 'hero' } : {};
    const last = await M.findOne(filter).sort('-order').lean();
    body.order = (last?.order ?? -1) + 1;
  }
  const item = await M.create(body);
  res.status(201).json({ success: true, item });
});

exports.adminUpdate = asyncHandler(async (req, res, next) => {
  const M = modelOf(req, next); if (!M) return;
  const body = clean(req.body);
  if (M === Category && body.name) {
    const old = await Category.findById(req.params.id).lean();
    if (old && old.name !== body.name) {
      await Product.updateMany({ category: old.name }, { category: body.name });
      await Section.updateMany({ 'source.category': old.name }, { 'source.category': body.name });
    }
  }
  const item = await M.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!item) return next(new AppError('Not found', 404));
  res.json({ success: true, item });
});

exports.adminDelete = asyncHandler(async (req, res, next) => {
  const M = modelOf(req, next); if (!M) return;
  if (M === Category) {
    const c = await Category.findById(req.params.id).lean();
    const used = c ? await Product.countDocuments({ category: c.name }) : 0;
    if (used) return next(new AppError(`${used} products still use this category. Move them first or hide the category.`, 400));
  }
  await M.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// PUT /cms/:collection/reorder { ids: [...] } — saves the order shown in the dashboard
exports.adminReorder = asyncHandler(async (req, res, next) => {
  const M = modelOf(req, next); if (!M) return;
  const ids = (req.body.ids || []).filter((id) => mongoose.isValidObjectId(id));
  await M.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { order: i } } })));
  res.json({ success: true });
});

// ── First-run defaults: mirrors the current home page so nothing changes visually ──
exports.ensureDefaults = async () => {
  await getSiteSettings(true);

  if (!(await Category.countDocuments())) {
    const ICON = { 'Home & Kitchen': 'coffee', 'Beauty & Personal Care': 'scissors', 'Kids & Toys': 'gift', 'Tools & Outdoor': 'tool', Accessories: 'smartphone', 'Smart Home': 'home', Drones: 'send', 'Smart Watches': 'watch', 'AirBuds & Headphones': 'headphones', 'VR & AR': 'eye', Cameras: 'camera', Gaming: 'target', 'AI Devices': 'cpu', Laptops: 'monitor' };
    const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const names = counts.map((c) => c._id).filter(Boolean);
    await Category.insertMany(names.map((name, i) => ({ name, icon: ICON[name] || 'grid', order: i })));
  }

  if (!(await Banner.countDocuments())) {
    const top = await Product.find({ isActive: true, isBestSeller: true }).sort('-createdAt').limit(5).select('_id').lean();
    const picks = top.length ? top : await Product.find({ isActive: true }).sort('-createdAt').limit(5).select('_id').lean();
    await Banner.insertMany([
      ...picks.map((p, i) => ({ placement: 'hero', kind: 'product', product: p._id, kicker: 'Top pick', order: i })),
      { placement: 'side', kind: 'custom', theme: 'orange', kicker: 'Everyday low prices', title: 'Under AED 20', ctaLabel: 'Shop now', ctaLink: '/products?price[lte]=20&sort=price', order: 0 },
      { placement: 'side', kind: 'custom', theme: 'blue', kicker: 'Free delivery', title: 'On orders over AED 200', ctaLabel: 'Start shopping', ctaLink: '/products', order: 1 },
    ]);
  }

  if (!(await Section.countDocuments())) {
    const cats = await Category.find().sort('order').limit(4).lean();
    const shelves = [];
    for (const c of cats) {
      if ((await Product.countDocuments({ isActive: true, category: c.name })) >= 3) {
        shelves.push({ type: 'products', title: c.name, eyebrow: 'Popular picks', icon: c.icon, layout: 'rail', limit: 14, source: { mode: 'category', category: c.name }, link: `/products?category=${encodeURIComponent(c.name)}` });
      }
    }
    const list = [
      { type: 'trust', items: [
        { icon: 'truck', title: 'Fast UAE delivery', text: 'Shipped from local stock' },
        { icon: 'dollar', title: 'Cash on delivery', text: 'Pay when it arrives' },
        { icon: 'card', title: 'Secure card payment', text: 'Visa, Mastercard, Apple Pay via Stripe' },
        { icon: 'message', title: 'WhatsApp support', text: 'Real people, quick replies' },
      ] },
      { type: 'categories', title: 'Shop by category' },
      { type: 'products', title: 'Top picks for you', eyebrow: 'Customer favourites', icon: 'trending', layout: 'grid', limit: 10, source: { mode: 'flag', flag: 'isBestSeller' }, link: '/products' },
      { type: 'priceTabs', title: 'Great finds for less', eyebrow: 'Low prices, every day', icon: 'zap', priceTabs: [20, 35, 60], limit: 14 },
      ...shelves.slice(0, 3),
      { type: 'products', title: 'New arrivals', eyebrow: 'Just added', layout: 'grid', limit: 5, source: { mode: 'newest' }, link: '/products?sort=-createdAt' },
      { type: 'recent', title: 'Recently viewed', eyebrow: 'Pick up where you left off' },
      { type: 'promise', title: 'Shopping made simple', items: [
        { icon: 'shield', title: 'See the price you pay', text: 'VAT and delivery are shown before you place your order.' },
        { icon: 'truck', title: 'Shipped from inside the UAE', text: 'No international waiting. Free delivery over AED 200.' },
        { icon: 'zap', title: 'No account needed', text: 'Check out as a guest in under a minute and track your order with your mobile number.' },
        { icon: 'card', title: 'Pay your way', text: 'Cash on delivery, or card / Apple Pay / Google Pay through Stripe.' },
      ] },
    ];
    await Section.insertMany(list.map((s, i) => ({ ...s, order: i })));
  }
};
