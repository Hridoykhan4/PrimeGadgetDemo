const mongoose = require('mongoose');
const slugify = require('slugify');

const VariantSchema = new mongoose.Schema({
  name: String,
  options: [{ label: String, price: Number, stock: Number }]
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  currency: { type: String, default: 'AED' },
  category: {
    type: String, required: true,
    enum: ['Drones','Smart Watches','AirBuds & Headphones','VR & AR','AI Devices','Cameras','Smart Home','Gaming','Laptops','Accessories','Home & Kitchen','Beauty & Personal Care','Kids & Toys','Tools & Outdoor']
  },
  brand: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, required: true, default: 0, min: 0 },
  images: [{ public_id: String, url: { type: String, required: true }, alt: String }],
  videos: [{ url: String, thumbnail: String }],
  specifications: [{ group: String, key: String, value: String }],
  features: [String],
  inBox: [String],
  variants: [VariantSchema],
  tags: [String],
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isDeal: { type: Boolean, default: false },
  dealEndsAt: Date,
  isActive: { type: Boolean, default: true },
  warranty: { type: String, default: '1 Year' },
  deliveryInfo: { type: String, default: 'Free delivery across UAE' },
  returnPolicy: { type: String, default: '30-day returns' },
  weight: Number,
  dimensions: { length: Number, width: Number, height: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

ProductSchema.virtual('reviews', { ref: 'Review', localField: '_id', foreignField: 'product' });
ProductSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
ProductSchema.index({ category: 1, price: 1, ratings: -1 });
ProductSchema.index({ slug: 1 });

ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  if (this.salePrice > 0) {
    this.discountPercent = Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  next();
});

ProductSchema.statics.calcAvgRating = async function(productId) {
  const res = await this.model('Review').aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  await this.findByIdAndUpdate(productId, {
    ratings: res[0] ? Math.round(res[0].avg * 10) / 10 : 0,
    numReviews: res[0] ? res[0].count : 0
  });
};

module.exports = mongoose.model('Product', ProductSchema);
