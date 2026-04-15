import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiMapPin, FiCreditCard, FiX } from 'react-icons/fi';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STEP_LABELS = { pending: 'Pending', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
const STATUS_COLORS = { pending: '#F5A623', confirmed: 'var(--blue)', processing: 'var(--blue)', shipped: '#7C3AED', out_for_delivery: 'var(--green)', delivered: 'var(--green)', cancelled: 'var(--red)' };

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    finally { setCancelling(false); }
  };

  if (loading) return <div className="loading-screen" style={{ paddingTop: 120 }}><div className="spinner" /></div>;
  if (!order) return <div className="page"><div className="container"><p>Order not found</p></div></div>;

  const isCancelled = order.status === 'cancelled';
  const currentIdx = STEPS.indexOf(order.status);

  return (
    <>
      <Helmet><title>Order {order.orderNumber} — PrimeGadgets</title></Helmet>
      <div className="page">
        <div className="container" style={{ maxWidth: 960 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
            <div>
              <h1 className="display-md" style={{ marginBottom: 4 }}>Order Details</h1>
              <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '.875rem' }}>{order.orderNumber}</p>
            </div>
            <span style={{ padding: '6px 18px', borderRadius: 'var(--r-full)', background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], fontWeight: 700, fontSize: '.875rem', textTransform: 'capitalize' }}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          {/* Tracker */}
          {!isCancelled && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '24px 32px', marginBottom: 28, overflowX: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: 500 }}>
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= currentIdx ? STATUS_COLORS[s] || 'var(--green)' : 'var(--surface-2)', border: `2px solid ${i <= currentIdx ? STATUS_COLORS[s] || 'var(--green)' : 'var(--border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i <= currentIdx ? '#fff' : 'var(--text-3)', fontSize: '.75rem', fontWeight: 700, transition: 'all .3s' }}>
                        {i < currentIdx ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '.7rem', fontWeight: 600, color: i <= currentIdx ? 'var(--text)' : 'var(--text-3)', textAlign: 'center' }}>{STEP_LABELS[s]}</span>
                    </div>
                    {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentIdx ? 'var(--green)' : 'var(--border-strong)', margin: '-20px 4px 0', transition: 'background .3s' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Items */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}><FiPackage style={{ color: 'var(--blue)' }} /> Items</h3>
                {order.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 60, height: 60, borderRadius: 'var(--r)', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/products/${item.product?._id || item.product}`} style={{ fontWeight: 600, fontSize: '.9rem', display: 'block', marginBottom: 3 }}>{item.name}</Link>
                      <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>Qty: {item.quantity}</span>
                    </div>
                    <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--blue)' }}>AED {(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              {/* Shipping */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}><FiMapPin style={{ color: 'var(--blue)' }} /> Shipping Address</h3>
                <p style={{ fontSize: '.9rem', lineHeight: 1.7, color: 'var(--text-2)' }}>
                  <strong>{order.shippingAddress.fullName}</strong><br />
                  {order.shippingAddress.phone}<br />
                  {order.shippingAddress.street}{order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}<br />
                  {order.shippingAddress.emirate}, {order.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, position: 'sticky', top: 'calc(var(--nav-h) + 16px)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 20 }}>Summary</h3>
              {[['Items', `AED ${order.itemsTotal?.toLocaleString()}`], ['Shipping', order.shippingFee === 0 ? 'Free' : `AED ${order.shippingFee}`], ['VAT', `AED ${order.tax?.toFixed(2)}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '.875rem', color: 'var(--text-2)' }}>
                  <span>{k}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 20 }}>
                <span>Total</span><strong style={{ color: 'var(--blue)' }}>AED {order.total?.toLocaleString()}</strong>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Payment</span>
                <p style={{ fontSize: '.875rem', marginTop: 4, textTransform: 'capitalize' }}>{order.paymentMethod.replace('_', ' ')}</p>
              </div>
              {['pending', 'confirmed'].includes(order.status) && (
                <button className="btn btn-danger btn-full" style={{ justifyContent: 'center' }} onClick={handleCancel} disabled={cancelling}>
                  <FiX /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){ .page .container > div:last-child{grid-template-columns:1fr !important;} }`}</style>
    </>
  );
}
