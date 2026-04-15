const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  body: { type: String, required: true, maxlength: 2000 },
  pros: [String],
  cons: [String],
  images: [{ url: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isApproved: { type: Boolean, default: true }
}, { timestamps: true });

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.post('save', function() { this.constructor.model('Product').calcAvgRating(this.product); });
ReviewSchema.post('deleteOne', { document: true }, function() { this.constructor.model('Product').calcAvgRating(this.product); });

module.exports = mongoose.model('Review', ReviewSchema);
