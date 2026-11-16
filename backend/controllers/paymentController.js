const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');
const { canAccess } = require('./orderController');

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

const SITE_ORIGINS = [
  'https://primegadgets.ae',
  'https://www.primegadgets.ae',
  'http://localhost:5173',
  'http://localhost:3000',
];
const siteBase = (req) => {
  const origin = req.get('origin');
  if (origin && SITE_ORIGINS.includes(origin)) return origin;
  return process.env.PUBLIC_SITE_URL || 'https://primegadgets.ae';
};
const toFils = (aed) => Math.round(Number(aed) * 100);

async function markPaid(order, session) {
  if (order.isPaid) return order;
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = {
    id: session.payment_intent || session.id,
    status: session.payment_status,
    update_time: new Date().toISOString(),
    email: session.customer_details?.email,
  };
  if (!order.shippingAddress.email && session.customer_details?.email) {
    order.shippingAddress.email = session.customer_details.email;
  }
  if (order.status === 'pending') {
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', note: 'Card payment received' });
  }
  await order.save();
  return order;
}

// POST /payments/checkout-session { orderId, key? } — guest (with key) or signed-in owner.
// Amounts are built from the stored order, never from the browser.
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  if (!stripe) return next(new AppError('Card payments are not available right now. Please choose Cash on Delivery.', 503));
  const order = await Order.findById(req.body.orderId).select('+accessKey').catch(() => null);
  if (!order || !canAccess(order, req)) return next(new AppError('Order not found', 404));
  if (order.isPaid) return next(new AppError('This order is already paid', 400));
  if (order.status === 'cancelled') return next(new AppError('This order was cancelled', 400));

  const line_items = order.items.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: 'aed',
      unit_amount: toFils(i.price),
      product_data: {
        name: (i.name || 'Product').slice(0, 250),
        ...(i.image && /^https:/.test(i.image) ? { images: [i.image] } : {}),
      },
    },
  }));
  if (order.shippingFee > 0) {
    line_items.push({ quantity: 1, price_data: { currency: 'aed', unit_amount: toFils(order.shippingFee), product_data: { name: 'Delivery' } } });
  }
  if (order.tax > 0) {
    line_items.push({ quantity: 1, price_data: { currency: 'aed', unit_amount: toFils(order.tax), product_data: { name: 'VAT' } } });
  }

  const base = siteBase(req);
  const keyQ = `key=${order.accessKey}`;
  const email = order.shippingAddress?.email || req.user?.email;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items,
    ...(email ? { customer_email: email } : {}),
    client_reference_id: order._id.toString(),
    metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
    payment_intent_data: {
      metadata: { orderId: order._id.toString(), orderNumber: order.orderNumber },
      description: `PrimeGadgets order ${order.orderNumber}`,
    },
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    locale: 'auto',
    success_url: `${base}/order/success/${order._id}?${keyQ}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/order/${order._id}?${keyQ}&payment=cancelled`,
  });

  order.paymentResult = { id: session.id, status: 'open', update_time: new Date().toISOString() };
  await order.save();
  res.json({ success: true, url: session.url, sessionId: session.id });
});

// GET /payments/verify/:orderId?session_id=cs_...&key=...
exports.verifyCheckoutSession = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).select('+accessKey').catch(() => null);
  if (!order || !canAccess(order, req)) return next(new AppError('Order not found', 404));
  const strip = (o) => { const x = o.toObject(); delete x.accessKey; return x; };
  if (order.isPaid || !stripe) return res.json({ success: true, paid: order.isPaid, order: strip(order) });

  const sessionId = req.query.session_id || (order.paymentResult?.id?.startsWith('cs_') ? order.paymentResult.id : null);
  if (!sessionId) return res.json({ success: true, paid: false, order: strip(order) });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.orderId !== order._id.toString()) return next(new AppError('Payment does not match this order', 400));
  if (session.payment_status === 'paid') await markPaid(order, session);
  res.json({ success: true, paid: order.isPaid, order: strip(order) });
});

// POST /payments/webhook (raw body; mounted before express.json in server.js)
exports.webhook = async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_') ||
      process.env.STRIPE_WEBHOOK_SECRET.includes('your')) {
    return res.status(503).send('not configured');
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object;
      const order = await Order.findById(session.metadata?.orderId);
      if (order && session.payment_status === 'paid') await markPaid(order, session);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handling failed:', err.message);
    res.status(500).send('handler error');
  }
};

exports.getPublishableKey = asyncHandler(async (req, res) => {
  const { cardEnabled } = await require('./cmsController').commerceOf();
  res.json({ success: true, enabled: !!stripe && cardEnabled, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});
