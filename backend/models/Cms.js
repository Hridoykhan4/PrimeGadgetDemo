// Storefront content managed from the admin dashboard (no code changes needed).
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Site settings (single document, key = 'site') ───────────
const SettingSchema = new Schema({
  key: { type: String, default: 'site', unique: true },
  brand: {
    name: { type: String, default: 'PrimeGadgets' },
    tagline: { type: String, default: 'Everyday essentials at low prices, delivered fast in the UAE' },
    logoUrl: String,          // shown in header/footer (light mode)
    logoDarkUrl: String,      // optional logo for dark mode
    faviconUrl: String,
    primaryColor: { type: String, default: '#0066ff' },
  },
  contact: {
    whatsapp: { type: String, default: '971581234567' },
    email: { type: String, default: 'support@primegadgets.ae' },
    phone: String,
    address: { type: String, default: 'Delivering across the UAE' },
    hours: String,
  },
  social: { instagram: String, facebook: String, tiktok: String, youtube: String, x: String },
  promo: {
    enabled: { type: Boolean, default: true },
    items: { type: [String], default: ['Free delivery over AED 200', 'Cash on delivery across the UAE'] },
    showTrackLink: { type: Boolean, default: true },
  },
  commerce: {
    currency: { type: String, default: 'AED' },
    freeShippingMin: { type: Number, default: 200, min: 0 },
    shippingFee: { type: Number, default: 15, min: 0 },
    vatRate: { type: Number, default: 5, min: 0, max: 100 }, // percent
    codEnabled: { type: Boolean, default: true },
    cardEnabled: { type: Boolean, default: true },
  },
  seo: {
    title: { type: String, default: 'PrimeGadgets — Everyday essentials at low prices, delivered fast in the UAE' },
    description: { type: String, default: 'Shop kitchen, beauty, toys and more at low prices in Dubai and across the UAE. Fast delivery, cash on delivery or secure card payment.' },
  },
  footer: {
    about: { type: String, default: 'Everyday essentials, home and kitchen gear, beauty tools and toys at low prices — shipped from UAE stock to all 7 emirates.' },
  },
}, { timestamps: true });

// ── Banners (hero slides + side tiles) ─────────────────────
const BannerSchema = new Schema({
  placement: { type: String, enum: ['hero', 'side'], default: 'hero' },
  kind: { type: String, enum: ['product', 'custom'], default: 'product' },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  kicker: { type: String, maxlength: 60 },
  title: { type: String, maxlength: 120 },
  subtitle: { type: String, maxlength: 240 },
  image: String,
  ctaLabel: { type: String, maxlength: 40 },
  ctaLink: { type: String, maxlength: 300 },
  theme: { type: String, enum: ['light', 'dark', 'blue', 'orange', 'green', 'purple', 'red'], default: 'light' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startsAt: Date,
  endsAt: Date,
}, { timestamps: true });

// ── Home page sections (order + content) ───────────────────
const SectionSchema = new Schema({
  type: { type: String, enum: ['trust', 'categories', 'products', 'priceTabs', 'recent', 'promise'], required: true },
  title: { type: String, maxlength: 120 },
  eyebrow: { type: String, maxlength: 60 },
  icon: String,
  layout: { type: String, enum: ['grid', 'rail'], default: 'rail' },
  limit: { type: Number, default: 12, min: 1, max: 40 },
  source: {
    mode: { type: String, enum: ['flag', 'category', 'manual', 'newest', 'price', 'sale'], default: 'flag' },
    flag: { type: String, enum: ['isBestSeller', 'isFeatured', 'isNew', 'isDeal'], default: 'isBestSeller' },
    category: String,
    maxPrice: Number,
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  priceTabs: { type: [Number], default: [20, 35, 60] },
  items: [{ icon: String, title: String, text: String }],
  link: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ── Categories (display order, icon, visibility) ───────────
const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true, maxlength: 60 },
  icon: { type: String, default: 'grid' },
  image: String,
  description: { type: String, maxlength: 200 },
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = {
  Setting: mongoose.models.Setting || mongoose.model('Setting', SettingSchema),
  Banner: mongoose.models.Banner || mongoose.model('Banner', BannerSchema),
  Section: mongoose.models.Section || mongoose.model('Section', SectionSchema),
  Category: mongoose.models.Category || mongoose.model('Category', CategorySchema),
};
