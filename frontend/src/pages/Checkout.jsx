import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiMapPin, FiCreditCard, FiPackage, FiChevronRight, FiLock, FiDollarSign, FiShield, FiTruck } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store/index.js';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];

const UAE_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, shipping, tax, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const leaving = useRef(false);

  const [ship, setShip] = useState({
    fullName: user?.name || '', phone: user?.phone || '',
    street: '', area: '', city: 'Dubai', emirate: 'Dubai', country: 'UAE'
  });
  const [payment, setPayment] = useState('card');

  const s = (k) => (e) => setShip(p => ({ ...p, [k]: e.target.value }));

  const validateShipping = () => {
    if (!ship.fullName.trim()) { toast.error('Full name required'); return false; }
    if (!ship.phone.trim()) { toast.error('Phone number required'); return false; }
    if (!ship.street.trim()) { toast.error('Street address required'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({
        product: i._id, name: i.name, image: i.image, price: i.price, quantity: i.qty
      }));
      const { data } = await api.post('/orders', {
        items: orderItems,
        shippingAddress: ship,
        paymentMethod: payment,
        itemsTotal: subtotal,
        shippingFee: shipping,
        tax,
        total
      });
      if (payment === 'card') {
        try {
          const { data: pay } = await api.post('/payments/checkout-session', { orderId: data.order._id });
          toast.loading('Redirecting to secure payment…');
          leaving.current = true;
          clearCart();
          window.location.assign(pay.url);
          return;
        } catch (e) {
          leaving.current = true;
          clearCart();
          toast.error(e.response?.data?.message || 'Could not start card payment. You can retry from your order.');
          navigate(`/orders/${data.order._id}`);
          return;
        }
      }
      leaving.current = true;
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order/success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (items.length === 0) {
    if (!leaving.current) navigate('/cart');
    return leaving.current ? <div className="loading-screen"><div className="spinner" /></div> : null;
  }

  return (
    <>
      <Helmet><title>Checkout — PrimeGadgets</title></Helmet>
      <div className="page checkout-page">
        <div className="container">
          <h1 className="display-md" style={{ marginBottom: 32 }}>Checkout</h1>

          {/* Step indicator */}
          <div className="checkout-steps">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`checkout-step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                  <div className="step-circle">
                    {i < step ? <FiCheck size={14} /> : i + 1}
                  </div>
                  <span>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="checkout-layout">
            {/* Main panel */}
            <div className="checkout-main">
              <AnimatePresence mode="wait">
                {/* Step 0: Shipping */}
                {step === 0 && (
                  <motion.div key="ship" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="checkout-card">
                    <h2><FiMapPin /> Shipping Address</h2>
                    <div className="checkout-form-grid">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="input" value={ship.fullName} onChange={s('fullName')} placeholder="Ahmed Al Mansouri" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input className="input" value={ship.phone} onChange={s('phone')} placeholder="+971 5X XXX XXXX" />
                      </div>
                      <div className="form-group" style={{ gridColumn: '1/-1' }}>
                        <label className="form-label">Street Address *</label>
                        <input className="input" value={ship.street} onChange={s('street')} placeholder="Villa 12, Al Wasl Road" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Area / Community</label>
                        <input className="input" value={ship.area} onChange={s('area')} placeholder="Jumeirah" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emirate</label>
                        <select className="input" value={ship.emirate} onChange={s('emirate')}>
                          {UAE_EMIRATES.map(e => <option key={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={() => validateShipping() && setStep(1)}>
                      Continue to Payment <FiChevronRight />
                    </button>
                  </motion.div>
                )}

                {/* Step 1: Payment */}
                {step === 1 && (
                  <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="checkout-card">
                    <h2><FiCreditCard /> Payment Method</h2>
                    <div className="payment-options">
                      {[
                        { id: 'card', label: 'Card, Apple Pay or Google Pay', sub: 'Visa · Mastercard · Amex — secure checkout by Stripe', icon: <FiCreditCard /> },
                        { id: 'cod', label: 'Cash on Delivery', sub: 'Pay in cash or card when your order arrives', icon: <FiDollarSign /> },
                      ].map(opt => (
                        <label key={opt.id} className={`payment-option ${payment === opt.id ? 'selected' : ''}`}>
                          <input type="radio" name="payment" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} />
                          <span className="payment-icon">{opt.icon}</span>
                          <div className="payment-info">
                            <strong>{opt.label}</strong>
                            <span>{opt.sub}</span>
                          </div>
                          <div className={`payment-check ${payment === opt.id ? 'visible' : ''}`}><FiCheck size={12} /></div>
                        </label>
                      ))}
                    </div>
                    {payment === 'card' && (
                      <div className="card-form-placeholder">
                        <div className="stripe-badge"><FiLock size={13} /> Secured by Stripe</div>
                        <p className="body-sm text-muted">After you place the order you'll be taken to Stripe's secure payment page. PrimeGadgets never sees or stores your card details.</p>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                      <button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Review Order <FiChevronRight /></button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Review */}
                {step === 2 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="checkout-card">
                    <h2><FiPackage /> Review Order</h2>
                    <div className="review-blocks">
                      <div className="review-block">
                        <div className="review-block-header"><FiMapPin size={14} /><span>Shipping to</span><button className="edit-link" onClick={() => setStep(0)}>Edit</button></div>
                        <p>{ship.fullName} · {ship.phone}</p>
                        <p>{ship.street}{ship.area ? `, ${ship.area}` : ''}, {ship.emirate}, {ship.country}</p>
                      </div>
                      <div className="review-block">
                        <div className="review-block-header"><FiCreditCard size={14} /><span>Payment</span><button className="edit-link" onClick={() => setStep(1)}>Edit</button></div>
                        <p>{payment === 'cod' ? 'Cash on Delivery' : 'Card / Apple Pay / Google Pay (Stripe)'}</p>
                      </div>
                    </div>
                    <div className="review-items">
                      {items.map(item => (
                        <div key={item.key} className="review-item">
                          <img src={item.image} alt={item.name} />
                          <div className="review-item-info">
                            <span className="review-item-name line-clamp-2">{item.name}</span>
                            <span className="text-muted body-sm">Qty: {item.qty}</span>
                          </div>
                          <span className="review-item-price">AED {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                      <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={placing} style={{ flex: 1, justifyContent: 'center', minWidth: 200 }}>
                        {placing ? <><div className="spinner spinner-sm" /> Placing...</> : payment === 'card' ? `Pay Securely · AED ${total.toFixed(2)}` : `Place Order · AED ${total.toFixed(2)}`}
                      </button>
                    </div>
                    <p className="secure-note"><FiLock size={12} /> {payment === 'card' ? 'Card details are entered on Stripe, never on our site' : 'Pay when your order arrives'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary sidebar */}
            <div className="checkout-sidebar">
              <div className="order-summary-card">
                <h3>Order Summary</h3>
                <div className="os-items">
                  {items.map(item => (
                    <div key={item.key} className="os-item">
                      <div className="os-item-img"><img src={item.image} alt={item.name} /><span className="os-qty">{item.qty}</span></div>
                      <span className="os-name line-clamp-2">{item.name}</span>
                      <span className="os-price">AED {(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="os-rows">
                  <div className="os-row"><span>Subtotal</span><span>AED {subtotal.toLocaleString()}</span></div>
                  <div className="os-row"><span>Shipping</span><span className={shipping === 0 ? 'text-green' : ''}>{shipping === 0 ? 'Free' : `AED ${shipping}`}</span></div>
                  <div className="os-row"><span>VAT (5%)</span><span>AED {tax.toFixed(2)}</span></div>
                </div>
                <div className="os-total"><span>Total</span><strong>AED {total.toFixed(2)}</strong></div>
                <div className="os-badges">
                  <span><FiLock size={11} /> Secure checkout</span>
                  <span><FiShield size={11} /> Local UAE stock</span>
                  <span><FiTruck size={11} /> 1-day delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page { padding-top: calc(var(--nav-h) + 40px); padding-bottom: 80px; }
        .checkout-steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:40px; }
        .checkout-step { display:flex; align-items:center; gap:8px; font-size:.875rem; font-weight:600; color:var(--text-3); }
        .checkout-step.active { color:var(--blue); }
        .checkout-step.done { color:var(--green); }
        .step-circle { width:32px; height:32px; border-radius:50%; border:2px solid currentColor; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:700; background:transparent; transition:all var(--t); }
        .checkout-step.active .step-circle, .checkout-step.done .step-circle { background:currentColor; color:#fff; }
        .step-line { width:60px; height:2px; background:var(--border-strong); margin:0 8px; transition:background var(--t); }
        .step-line.done { background:var(--green); }
        .checkout-layout { display:grid; grid-template-columns:1fr 360px; gap:32px; align-items:start; }
        .checkout-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-xl); padding:32px; }
        .checkout-card h2 { display:flex; align-items:center; gap:10px; font-family:var(--font-display); font-size:1.2rem; font-weight:700; margin-bottom:24px; }
        .checkout-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
        .payment-options { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
        .payment-option { display:flex; align-items:center; gap:14px; padding:16px 20px; border:1.5px solid var(--border-strong); border-radius:var(--r-lg); cursor:pointer; transition:all var(--t-fast); }
        .payment-option:hover { border-color:var(--blue); background:rgba(0,102,255,.04); }
        .payment-option.selected { border-color:var(--blue); background:rgba(0,102,255,.06); }
        .payment-option input { display:none; }
        .payment-icon { font-size:1.35rem; flex-shrink:0; width:44px; height:44px; border-radius:12px; background:rgba(0,102,255,.08); color:var(--blue); display:flex; align-items:center; justify-content:center; }
        .payment-info { flex:1; display:flex; flex-direction:column; gap:2px; }
        .payment-info strong { font-size:.9rem; font-weight:600; color:var(--text); }
        .payment-info span { font-size:.78rem; color:var(--text-3); }
        .payment-check { width:22px; height:22px; border-radius:50%; background:var(--blue); color:#fff; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity var(--t-fast); flex-shrink:0; }
        .payment-check.visible { opacity:1; }
        .card-form-placeholder { background:var(--surface-2); border-radius:var(--r-lg); padding:20px; margin-bottom:20px; }
        .stripe-badge { display:flex; align-items:center; gap:6px; font-size:.78rem; color:var(--text-3); margin-bottom:16px; font-weight:500; }
        .review-blocks { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:24px; }
        .review-block { padding:16px; background:var(--surface-2); border-radius:var(--r-lg); }
        .review-block-header { display:flex; align-items:center; gap:6px; margin-bottom:8px; font-size:.78rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--text-3); }
        .edit-link { margin-left:auto; background:none; border:none; color:var(--blue); font-size:.78rem; font-weight:600; cursor:pointer; }
        .review-block p { font-size:.875rem; color:var(--text-2); line-height:1.5; }
        .review-items { display:flex; flex-direction:column; gap:10px; margin-bottom:24px; }
        .review-item { display:flex; align-items:center; gap:12px; padding:12px; background:var(--surface-2); border-radius:var(--r-lg); }
        .review-item img { width:48px; height:48px; border-radius:var(--r); object-fit:cover; flex-shrink:0; }
        .review-item-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:3px; }
        .review-item-name { font-size:.875rem; font-weight:500; }
        .review-item-price { font-weight:700; font-family:var(--font-display); white-space:nowrap; color:var(--blue); }
        .secure-note { display:flex; align-items:center; gap:6px; font-size:.78rem; color:var(--text-3); margin-top:16px; justify-content:center; }
        .order-summary-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r-xl); padding:24px; position:sticky; top:calc(var(--nav-h)+24px); }
        .order-summary-card h3 { font-family:var(--font-display); font-size:1.1rem; font-weight:700; margin-bottom:20px; }
        .os-items { display:flex; flex-direction:column; gap:10px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .os-item { display:flex; align-items:center; gap:10px; }
        .os-item-img { position:relative; flex-shrink:0; }
        .os-item-img img { width:44px; height:44px; border-radius:var(--r-sm); object-fit:cover; }
        .os-qty { position:absolute; top:-6px; right:-6px; min-width:18px; height:18px; background:var(--text); color:var(--bg); border-radius:50%; font-size:.65rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
        .os-name { flex:1; font-size:.8rem; color:var(--text-2); }
        .os-price { font-size:.85rem; font-weight:700; white-space:nowrap; }
        .os-rows { display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
        .os-row { display:flex; justify-content:space-between; font-size:.875rem; color:var(--text-2); }
        .os-total { display:flex; justify-content:space-between; font-size:1.05rem; font-weight:700; padding-top:12px; border-top:1px solid var(--border); margin-bottom:20px; }
        .os-badges { display:flex; gap:8px; flex-wrap:wrap; }
        .os-badges span { display:inline-flex; align-items:center; gap:5px;  font-size:.72rem; color:var(--text-3); background:var(--surface-2); padding:4px 10px; border-radius:var(--r-full); }
        @media(max-width:900px){ .checkout-layout{grid-template-columns:1fr;} .checkout-sidebar{order:-1;} .order-summary-card{position:static;} }
        @media(max-width:600px){ .checkout-form-grid,.review-blocks{grid-template-columns:1fr;} .checkout-steps span{display:none;} }
      `}</style>
    </>
  );
}
