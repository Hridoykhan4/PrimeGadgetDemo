const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String, image: String, price: Number, quantity: { type: Number, default: 1 },
    variant: { name: String, label: String }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    area: String, city: { type: String, default: 'Dubai' },
    emirate: { type: String, default: 'Dubai' },
    country: { type: String, default: 'UAE' }
  },
  paymentMethod: { type: String, enum: ['card', 'cod', 'apple_pay', 'google_pay'], default: 'cod' },
  paymentResult: { id: String, status: String, update_time: String, email: String },
  itemsTotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{ status: String, note: String, date: { type: Date, default: Date.now } }],
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  estimatedDelivery: Date,
  trackingNumber: String,
  notes: String,
  cancelReason: String,
}, { timestamps: true });

OrderSchema.pre('save', function(next) {
  if (this.isNew) {
    this.orderNumber = 'PG-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
    this.statusHistory.push({ status: 'pending', note: 'Order placed' });
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
