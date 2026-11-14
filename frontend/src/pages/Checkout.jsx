import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiLock, FiCreditCard, FiDollarSign, FiCheck, FiMapPin, FiUser, FiChevronLeft, FiShield, FiTruck, FiAlertCircle,
} from 'react-icons/fi';
import {
  useCartStore, useCartTotals, useAuthStore, useGuestOrdersStore, useCheckoutProfileStore, fmtAED,
} from '../store/index.js';
import { FreeShippingMeter } from '../components/cart/CartDrawer.jsx';
import { SafeImage } from '../components/product/ProductCard.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import './Checkout.css';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

// Accepts 05X…, 5X…, +9715X…, 009715X… → returns 9 digits "5XXXXXXXX" or null
export const uaeMobileDigits = (raw) => {
  let d = String(raw || '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('971')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return /^5\d{8}$/.test(d) ? d : null;
};
const prettyMobile = (d) => (d ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}` : '');

export default function Checkout() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { subtotal, shipping, tax, total, toFreeShipping, count } = useCartTotals();
  const { user } = useAuthStore();
  const addGuestOrder = useGuestOrdersStore((s) => s.add);
  const { profile, save: saveProfile } = useCheckoutProfileStore();

  const [form, setForm] = useState(() => ({
    fullName: profile?.fullName || user?.name || '',
    phone: profile?.phone || (user?.phone ? prettyMobile(uaeMobileDigits(user.phone)) : ''),
    email: profile?.email || user?.email || '',
    emirate: profile?.emirate || 'Dubai',
    area: profile?.area || '',
    street: profile?.street || '',
    landmark: profile?.landmark || '',
  }));
  const [remember, setRemember] = useState(true);
  const [payment, setPayment] = useState('cod');
  const [cardEnabled, setCardEnabled] = useState(true);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState('');
  const leaving = useRef(false);
  const refs = { fullName: useRef(null), phone: useRef(null), email: useRef(null), street: useRef(null) };

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    api.get('/payments/key').then(({ data }) => {
      setCardEnabled(!!data.enabled);
      if (data.enabled) setPayment('card');
    }).catch(() => setCardEnabled(false));
  }, []);
  useEffect(() => { if (!items.length && !leaving.current) navigate('/cart', { replace: true }); }, [items.length, navigate]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.fullName.trim().length < 2) er.fullName = 'Please enter your full name';
    if (!uaeMobileDigits(form.phone)) er.phone = 'Enter a UAE mobile number, e.g. 50 123 4567';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) er.email = 'This email doesn\'t look right';
    if (form.street.trim().length < 3) er.street = 'Please enter your building / villa and street';
    setErrors(er);
    const first = ['fullName', 'phone', 'email', 'street'].find((k) => er[k]);
    if (first) refs[first].current?.focus();
    return !first;
  };

  const placeOrder = async (e) => {
    e?.preventDefault();
    setServerError('');
    if (!validate() || placing) return;
    setPlacing(true);
    const digits = uaeMobileDigits(form.phone);
    const shippingAddress = { ...form, phone: `+971${digits}`, fullName: form.fullName.trim(), email: form.email.trim() };
    if (remember) saveProfile({ ...form, phone: prettyMobile(digits) }); else saveProfile(null);

    try {
      const { data } = await api.post('/orders', {
        items: items.map((i) => ({ product: i._id, quantity: i.qty })),
        shippingAddress,
        paymentMethod: payment,
      });
      const order = data.order;
      const key = data.accessKey;
      addGuestOrder({ id: order._id, key, orderNumber: order.orderNumber, total: order.total, createdAt: order.createdAt });

      if (payment === 'card') {
        try {
          const { data: pay } = await api.post('/payments/checkout-session', { orderId: order._id, key });
          leaving.current = true;
          clearCart();
          window.location.assign(pay.url);
          return;
        } catch (err) {
          leaving.current = true;
          clearCart();
          toast.error(err.response?.data?.message || 'Card payment could not start. Your order is saved — you can pay from the order page.');
          navigate(`/order/${order._id}?key=${key}`);
          return;
        }
      }
      leaving.current = true;
      clearCart();
      navigate(`/order/success/${order._id}?key=${key}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not place your order. Please check your connection and try again.';
      setServerError(msg);
      toast.error(msg);
      setPlacing(false);
    }
  };

  if (!items.length) return <div className="loading-screen"><div className="spinner" /></div>;

  const payLabel = payment === 'card' ? `Pay AED ${fmtAED(total)}` : `Place order · AED ${fmtAED(total)}`;

  return (
    <>
      <Helmet><title>Checkout — PrimeGadgets</title></Helmet>
      <div className="co-page">
        <div className="container co-container">
          <div className="co-top">
            <Link to="/cart" className="co-back"><FiChevronLeft /> Back to cart</Link>
            <h1 className="co-title">Checkout</h1>
            <p className="co-secure"><FiLock aria-hidden="true" /> Secure checkout · No account needed</p>
          </div>

          <form className="co-grid" onSubmit={placeOrder} noValidate>
            <div className="co-main">
              {/* 1. Contact & delivery */}
              <section className="co-card" aria-labelledby="co-ship">
                <h2 id="co-ship" className="co-h"><span className="co-num">1</span> Delivery details</h2>

                <div className="co-fields">
                  <div className={`co-field ${errors.fullName ? 'err' : ''}`}>
                    <label htmlFor="fullName">Full name</label>
                    <div className="co-input-wrap"><FiUser aria-hidden="true" />
                      <input id="fullName" ref={refs.fullName} value={form.fullName} onChange={set('fullName')} autoComplete="name" placeholder="e.g. Ahmed Al Mansouri" aria-invalid={!!errors.fullName} aria-describedby="fullName-err" />
                    </div>
                    {errors.fullName && <p className="co-err" id="fullName-err"><FiAlertCircle /> {errors.fullName}</p>}
                  </div>

                  <div className={`co-field ${errors.phone ? 'err' : ''}`}>
                    <label htmlFor="phone">Mobile number</label>
                    <div className="co-input-wrap co-phone">
                      <span className="co-prefix" aria-hidden="true">+971</span>
                      <input id="phone" ref={refs.phone} value={form.phone} onChange={set('phone')} onBlur={() => { const d = uaeMobileDigits(form.phone); if (d) setForm((f) => ({ ...f, phone: prettyMobile(d) })); }} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="50 123 4567" aria-invalid={!!errors.phone} aria-describedby="phone-hint" />
                    </div>
                    {errors.phone ? <p className="co-err" id="phone-hint"><FiAlertCircle /> {errors.phone}</p> : <p className="co-hint" id="phone-hint">Our courier will call this number before delivery</p>}
                  </div>

                  <div className={`co-field co-full ${errors.email ? 'err' : ''}`}>
                    <label htmlFor="email">Email <span className="co-opt">(optional, for your receipt)</span></label>
                    <input id="email" ref={refs.email} className="co-input" value={form.email} onChange={set('email')} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} />
                    {errors.email && <p className="co-err"><FiAlertCircle /> {errors.email}</p>}
                  </div>

                  <div className="co-field co-full">
                    <span className="co-label">Emirate</span>
                    <div className="co-chips" role="radiogroup" aria-label="Emirate">
                      {EMIRATES.map((em) => (
                        <button type="button" key={em} role="radio" aria-checked={form.emirate === em} className={`co-chip ${form.emirate === em ? 'on' : ''}`} onClick={() => setForm((f) => ({ ...f, emirate: em }))}>
                          {form.emirate === em && <FiCheck aria-hidden="true" />} {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="co-field">
                    <label htmlFor="area">Area / community</label>
                    <input id="area" className="co-input" value={form.area} onChange={set('area')} autoComplete="address-level3" placeholder="e.g. Al Barsha, JVC, Al Nahda" />
                  </div>

                  <div className={`co-field ${errors.street ? 'err' : ''}`}>
                    <label htmlFor="street">Building / villa & street</label>
                    <div className="co-input-wrap"><FiMapPin aria-hidden="true" />
                      <input id="street" ref={refs.street} value={form.street} onChange={set('street')} autoComplete="street-address" placeholder="e.g. Apt 1204, Marina Tower, Al Sufouh Rd" aria-invalid={!!errors.street} />
                    </div>
                    {errors.street && <p className="co-err"><FiAlertCircle /> {errors.street}</p>}
                  </div>

                  <div className="co-field co-full">
                    <label htmlFor="landmark">Landmark or delivery note <span className="co-opt">(optional)</span></label>
                    <input id="landmark" className="co-input" value={form.landmark} onChange={set('landmark')} placeholder="e.g. Near Carrefour, call on arrival" />
                  </div>
                </div>

                <label className="co-remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Remember these details on this device for faster checkout</span>
                </label>
              </section>

              {/* 2. Payment */}
              <section className="co-card" aria-labelledby="co-pay">
                <h2 id="co-pay" className="co-h"><span className="co-num">2</span> Payment</h2>
                <div className="co-pays" role="radiogroup" aria-label="Payment method">
                  <button
                    type="button" role="radio" aria-checked={payment === 'card'} disabled={!cardEnabled}
                    className={`co-pay ${payment === 'card' ? 'on' : ''}`} onClick={() => setPayment('card')}
                  >
                    <span className="co-pay-radio" aria-hidden="true" />
                    <span className="co-pay-icon"><FiCreditCard /></span>
                    <span className="co-pay-text">
                      <strong>Card, Apple Pay or Google Pay</strong>
                      <small>{cardEnabled ? 'Pay instantly on a secure Stripe page' : 'Temporarily unavailable'}</small>
                      <span className="co-brands" aria-hidden="true"><i>VISA</i><i>Mastercard</i><i>AMEX</i><i>Apple Pay</i><i>Google Pay</i></span>
                    </span>
                  </button>
                  <button type="button" role="radio" aria-checked={payment === 'cod'} className={`co-pay ${payment === 'cod' ? 'on' : ''}`} onClick={() => setPayment('cod')}>
                    <span className="co-pay-radio" aria-hidden="true" />
                    <span className="co-pay-icon cod"><FiDollarSign /></span>
                    <span className="co-pay-text">
                      <strong>Cash on delivery</strong>
                      <small>Pay the courier in cash when your order arrives</small>
                    </span>
                  </button>
                </div>
                {payment === 'card' && (
                  <p className="co-paynote"><FiShield aria-hidden="true" /> You'll enter your card on Stripe's secure page. We never see or store card numbers.</p>
                )}
              </section>
            </div>

            {/* Summary */}
            <aside className="co-side">
              <div className="co-card co-summary">
                <h2 className="co-h small">Order summary <span className="co-count">{count} {count === 1 ? 'item' : 'items'}</span></h2>
                <ul className="co-items">
                  {items.map((i) => (
                    <li key={i.key}>
                      <span className="co-thumb"><SafeImage src={i.image} alt={i.name} className="co-thumb-img" /><b>{i.qty}</b></span>
                      <span className="co-iname">{i.name}</span>
                      <span className="co-iprice">AED {fmtAED(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <FreeShippingMeter subtotal={subtotal} toFreeShipping={toFreeShipping} />
                <dl className="co-sum">
                  <div><dt>Subtotal</dt><dd>AED {fmtAED(subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'Free' : `AED ${fmtAED(shipping)}`}</dd></div>
                  <div><dt>VAT (5%)</dt><dd>AED {fmtAED(tax)}</dd></div>
                  <div className="co-total"><dt>Total</dt><dd>AED {fmtAED(total)}</dd></div>
                </dl>
                {serverError && <p className="co-server-err" role="alert"><FiAlertCircle /> {serverError}</p>}
                <button type="submit" className="btn btn-primary btn-full btn-lg co-place" disabled={placing}>
                  {placing ? <><span className="spinner spinner-sm" /> {payment === 'card' ? 'Opening secure payment…' : 'Placing order…'}</> : <><FiLock /> {payLabel}</>}
                </button>
                <ul className="co-trust">
                  <li><FiTruck /> Delivered from UAE stock</li>
                  <li><FiShield /> Secure, encrypted checkout</li>
                </ul>
              </div>
            </aside>

            {/* Mobile sticky pay bar */}
            <div className="co-sticky">
              <div><small>Total</small><strong>AED {fmtAED(total)}</strong></div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={placing}>
                {placing ? <span className="spinner spinner-sm" /> : <FiLock />} {payment === 'card' ? 'Pay now' : 'Place order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
