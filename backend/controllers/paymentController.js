const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'aed' } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { userId: req.user._id.toString() },
    automatic_payment_methods: { enabled: true }
  });
  res.json({ success: true, clientSecret: paymentIntent.client_secret, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

exports.getPublishableKey = asyncHandler(async (req, res) => {
  res.json({ success: true, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});
