// Orders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiClock } from 'react-icons/fi';
import api from '../utils/api.js';

const STATUS_STYLES = {
  pending: { bg: 'rgba(245,166,35,.12)', color: '#F5A623' },
  confirmed: { bg: 'rgba(0,102,255,.1)', color: 'var(--blue)' },
  processing: { bg: 'rgba(0,102,255,.1)', color: 'var(--blue)' },
  shipped: { bg: 'rgba(124,58,237,.12)', color: '#7C3AED' },
  out_for_delivery: { bg: 'rgba(0,200,83,.1)', color: 'var(--green)' },
  delivered: { bg: 'rgba(0,200,83,.1)', color: 'var(--green)' },
  cancelled: { bg: 'rgba(255,59,59,.1)', color: 'var(--red)' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(({ data }) => setOrders(data.orders)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet><title>My Orders — PrimeGadgets</title></Helmet>
      <div className="page">
        <div className="container" style={{ maxWidth: 900 }}>
          <h1 className="display-md" style={{ marginBottom: 32 }}>My Orders</h1>
          {loading ? <div className="loading-screen"><div className="spinner" /></div>
            : orders.length === 0 ? (
              <div className="empty-state">
                <FiPackage />
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here</p>
                <Link to="/products" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order, i) => {
                  const st = STATUS_STYLES[order.status] || {};
                  return (
                    <motion.div key={order._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiPackage style={{ color: 'var(--blue)' }} />
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '.875rem' }}>{order.orderNumber}</strong>
                        </div>
                        <span style={{ fontSize: '.78rem', fontWeight: 700, padding: '3px 12px', borderRadius: 'var(--r-full)', background: st.bg, color: st.color, textTransform: 'capitalize' }}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: '.82rem', color: 'var(--text-3)' }}>
                          <FiClock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                        {order.items?.slice(0, 4).map((item, idx) => (
                          <img key={idx} src={item.image} alt={item.name} style={{ width: 52, height: 52, borderRadius: 'var(--r)', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        ))}
                        {order.items?.length > 4 && (
                          <div style={{ width: 52, height: 52, borderRadius: 'var(--r)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.78rem', fontWeight: 700, color: 'var(--text-3)', border: '1px solid var(--border)' }}>+{order.items.length - 4}</div>
                        )}
                        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</span>
                          <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>AED {order.total?.toLocaleString()}</strong>
                        </div>
                      </div>
                      <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                        <FiEye size={14} /> View Details
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </>
  );
}
