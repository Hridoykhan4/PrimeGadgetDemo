import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiMapPin, FiCreditCard, FiX, FiCheck, FiMessageCircle, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import api from '../utils/api.js';
import { useGuestOrdersStore, fmtAED } from '../store/index.js';
import { SafeImage } from '../components/product/ProductCard.jsx';
import toast from 'react-hot-toast';
import './OrderPages.css';

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '971581234567';

const STEPS = [
  ['pending', 'Order placed'],
  ['confirmed', 'Confirmed'],
  ['processing', 'Packed'],
  ['shipped', 'Shipped'],
  ['out_for_delivery', 'Out for delivery'],
  ['delivered', 'Delivered'],
];
const STATUS_TEXT = { pending: 'Order placed', confirmed: 'Confirmed', processing: 'Being packed', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };

// Resolves the access key for guest orders: URL ?key= first, then this device's saved orders.
export function useOrderKey(id) {
  const [params] = useSearchParams();
  const saved = useGuestOrdersStore((s) => s.orders.find((o) => o.id === id)?.key);
  return params.get('key') || saved || undefined;
}

export function StatusTracker({ status }) {
  if (status === 'cancelled' || status === 'refunded') return null;
  const idx = STEPS.findIndex(([s]) => s === status);
  return (
    <ol className="op-track" aria-label="Order progress">
      {STEPS.map(([s, label], i) => (
        <li key={s} className={i < idx ? 'done' : i === idx ? 'current' : ''} aria-current={i === idx ? 'step' : undefined}>
          <span className="op-dot">{i < idx ? <FiCheck /> : i + 1}</span>
          <span className="op-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const key = useOrderKey(id);
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/orders/${id}`, { params: { key } })
      .then(({ data }) => setOrder(data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id, key]);

  useEffect(() => {
    if (params.get('payment') === 'cancelled') toast('Payment was not completed. Your order is saved — you can pay below.', { id: 'paycancel' });
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post('/payments/checkout-session', { orderId: id, key });
      window.location.assign(data.url);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not start payment'); setPaying(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer', key });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'This order cannot be cancelled'); }
    finally { setCancelling(false); }
  };

  if (loading) return <div className="loading-screen" style={{ paddingTop: 140 }}><div className="spinner" /></div>;
  if (!order) {
    return (
      <div className="op-page"><div className="container op-narrow">
        <div className="op-card op-empty">
          <FiAlertCircle />
          <h1>We couldn't open this order</h1>
          <p>Use your order number and mobile number to find it.</p>
          <Link to="/track" className="btn btn-primary">Track an order</Link>
        </div>
      </div></div>
    );
  }

  const a = order.shippingAddress || {};
  const cancelled = order.status === 'cancelled';
  const needsPayment = order.paymentMethod === 'card' && !order.isPaid && !cancelled;
  const waText = encodeURIComponent(`Hi PrimeGadgets, I have a question about my order ${order.orderNumber}.`);

  return (
    <>
      <Helmet><title>Order {order.orderNumber} — PrimeGadgets</title></Helmet>
      <div className="op-page">
        <div className="container op-wide">
          <div className="op-head">
            <div>
              <p className="op-kicker">Order</p>
              <h1 className="op-title">{order.orderNumber}</h1>
              <p className="op-sub">Placed {new Date(order.createdAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <span className={`op-status s-${order.status}`}>{STATUS_TEXT[order.status] || order.status}</span>
          </div>

          {needsPayment && (
            <div className="op-alert">
              <FiCreditCard aria-hidden="true" />
              <div><strong>Payment pending</strong><span>Complete your card payment to confirm this order.</span></div>
              <button className="btn btn-primary" onClick={handlePay} disabled={paying}>{paying ? 'Opening…' : `Pay AED ${fmtAED(order.total)}`}</button>
            </div>
          )}

          {!cancelled && <div className="op-card"><StatusTracker status={order.status} /></div>}

          <div className="op-grid">
            <div className="op-col">
              <section className="op-card">
                <h2 className="op-h"><FiPackage /> Items</h2>
                <ul className="op-items">
                  {order.items.map((it, i) => (
                    <li key={i}>
                      <Link to={`/products/${it.product?._id || it.product}`} className="op-thumb"><SafeImage src={it.image} alt={it.name} className="op-thumb-img" /></Link>
                      <div className="op-item-info">
                        <Link to={`/products/${it.product?._id || it.product}`} className="op-item-name">{it.name}</Link>
                        <span>Qty {it.quantity} · AED {fmtAED(it.price)}</span>
                      </div>
                      <strong>AED {fmtAED(it.price * it.quantity)}</strong>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="op-card">
                <h2 className="op-h"><FiMapPin /> Delivery</h2>
                <p className="op-addr">
                  <strong>{a.fullName}</strong><br />
                  {a.phone}{a.email ? ` · ${a.email}` : ''}<br />
                  {[a.street, a.area, a.emirate].filter(Boolean).join(', ')}
                  {a.landmark ? <><br /><em>{a.landmark}</em></> : null}
                </p>
              </section>
            </div>

            <aside className="op-card op-summary">
              <h2 className="op-h">Summary</h2>
              <dl className="op-sum">
                <div><dt>Items</dt><dd>AED {fmtAED(order.itemsTotal)}</dd></div>
                <div><dt>Delivery</dt><dd>{order.shippingFee === 0 ? 'Free' : `AED ${fmtAED(order.shippingFee)}`}</dd></div>
                <div><dt>VAT (5%)</dt><dd>AED {fmtAED(order.tax)}</dd></div>
                <div className="op-total"><dt>Total</dt><dd>AED {fmtAED(order.total)}</dd></div>
              </dl>
              <div className="op-paybox">
                {order.paymentMethod === 'cod' ? <FiDollarSign /> : <FiCreditCard />}
                <div>
                  <strong>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card payment'}</strong>
                  <span className={order.isPaid ? 'paid' : 'unpaid'}>{order.isPaid ? 'Paid' : order.paymentMethod === 'cod' ? 'Pay on delivery' : 'Not paid yet'}</span>
                </div>
              </div>
              {needsPayment && <button className="btn btn-primary btn-full" onClick={handlePay} disabled={paying}><FiCreditCard /> {paying ? 'Opening secure payment…' : `Pay now · AED ${fmtAED(order.total)}`}</button>}
              <a className="btn btn-secondary btn-full" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`} target="_blank" rel="noopener noreferrer"><FiMessageCircle /> Ask about this order</a>
              {['pending', 'confirmed'].includes(order.status) && (
                <button className="op-cancel" onClick={handleCancel} disabled={cancelling}><FiX /> {cancelling ? 'Cancelling…' : 'Cancel order'}</button>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
