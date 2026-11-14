import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiPackage, FiArrowRight, FiHome, FiCreditCard, FiClock } from 'react-icons/fi';
import api from '../utils/api.js';

export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState(null);
  const [paid, setPaid] = useState(null); // null = checking / not a card order

  useEffect(() => {
    window.scrollTo(0, 0);
    if (sessionId) {
      api.get(`/payments/verify/${id}`, { params: { session_id: sessionId } })
        .then(({ data }) => { setOrder(data.order); setPaid(data.paid); })
        .catch(() => setPaid(false));
    } else {
      api.get(`/orders/${id}`).then(({ data }) => { setOrder(data.order); if (data.order.paymentMethod === 'card') setPaid(data.order.isPaid); }).catch(() => {});
    }
  }, [id, sessionId]);

  return (
    <>
      <Helmet><title>Order Confirmed — PrimeGadgets</title></Helmet>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 60px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,200,83,0.12)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: '2rem', color: 'var(--green)' }}
          >
            <FiCheck strokeWidth={3} />
          </motion.div>

          <h1 className="display-md" style={{ marginBottom: 12 }}>{paid ? 'Payment Successful!' : 'Order Confirmed!'}</h1>
          <p style={{ color: 'var(--text-2)', marginBottom: 8 }}>
            {paid
              ? 'Thank you! Your card payment was received and your order is confirmed.'
              : order?.paymentMethod === 'cod'
                ? 'Thank you! Pay in cash or card when your order arrives.'
                : 'Thank you for your purchase. Your order has been placed successfully.'}
          </p>
          {order?.paymentMethod === 'card' && (
            <div role="status" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '.82rem', fontWeight: 600, background: paid ? 'rgba(0,200,83,.12)' : 'rgba(245,166,35,.14)', color: paid ? 'var(--green)' : '#b7791f' }}>
              {paid ? <><FiCreditCard size={13} /> Paid · AED {order.total?.toFixed(2)}</> : paid === false ? <><FiClock size={13} /> Payment pending — you can pay from your order page</> : <><FiClock size={13} /> Confirming payment…</>}
            </div>
          )}
          {order && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', background: 'var(--surface-2)', borderRadius: 'var(--r-full)', margin: '16px 0', fontSize: '.875rem' }}>
              <FiPackage size={14} style={{ color: 'var(--blue)' }} />
              <span style={{ color: 'var(--text-2)' }}>Order #</span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{order.orderNumber}</strong>
            </div>
          )}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, margin: '24px 0', textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: 16 }}>What happens next?</h3>
            {[
              { step: '1', title: 'Order Confirmed', desc: 'We received your order and are verifying it' },
              { step: '2', title: 'Processing', desc: 'We\'ll prepare and pack your items' },
              { step: '3', title: 'Out for Delivery', desc: 'Your order is on its way' },
              { step: '4', title: 'Delivered', desc: 'Enjoy your new gadget! 🎉' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
                <div><strong style={{ display: 'block', fontSize: '.9rem' }}>{s.title}</strong><span style={{ fontSize: '.82rem', color: 'var(--text-3)' }}>{s.desc}</span></div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to={`/orders/${id}`} className="btn btn-primary btn-lg">
              <FiPackage /> Track Order
            </Link>
            <Link to="/" className="btn btn-secondary btn-lg">
              <FiHome /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
