import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiAlertTriangle, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STATUS_COLORS = { pending: '#F5A623', confirmed: '#0066FF', processing: '#0066FF', shipped: '#7C3AED', delivered: '#00C853', cancelled: '#FF3B3B' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats').then(({ data }) => setStats(data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><div className="loading-screen"><div className="spinner" /></div></AdminLayout>;

  const chartData = stats?.last6Months?.map(m => ({ month: MONTHS[m._id.m - 1], revenue: m.revenue, orders: m.count })) || [];
  const statusData = stats?.statusBreakdown?.map(s => ({ name: s._id, count: s.count })) || [];

  const cards = [
    { label: 'Total Revenue', value: `AED ${stats?.totalRevenue?.toLocaleString() || 0}`, icon: FiDollarSign, color: '#00C853', bg: 'rgba(0,200,83,.1)' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingBag, color: '#0066FF', bg: 'rgba(0,102,255,.1)' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: FiPackage, color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
    { label: 'Customers', value: stats?.totalUsers || 0, icon: FiUsers, color: '#F5A623', bg: 'rgba(245,166,35,.1)' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '10px 16px', fontSize: '.82rem' }}><p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>{payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === 'revenue' ? `AED ${p.value?.toLocaleString()}` : p.value}</p>)}</div>;
  };

  return (
    <AdminLayout>
      <Helmet><title>Admin Dashboard — PrimeGadgets</title></Helmet>
      <div style={{ maxWidth: 1400 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '.875rem' }}>Welcome back! Here's what's happening at PrimeGadgets.</p>
        </div>

        {/* Stat cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {cards.map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 'var(--r-lg)', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <c.icon size={22} style={{ color: c.color }} />
              </div>
              <div>
                <p style={{ fontSize: '.78rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>{c.label}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{c.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Revenue (Last 6 Months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-3)" fontSize={11} />
                <YAxis stroke="var(--text-3)" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--blue)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-3)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--text-3)" fontSize={11} width={100} tickFormatter={v => v.replace('_', ' ')} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="var(--blue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid-2">
          {/* Top products */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Top Products</h3>
              <Link to="/admin/products" style={{ fontSize: '.8rem', color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <FiArrowRight size={12} /></Link>
            </div>
            {stats?.topProducts?.map((p, i) => (
              <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ width: 22, fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--text-3)', flexShrink: 0 }}>#{i + 1}</span>
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{p.sold} sold</p>
                </div>
                <strong style={{ fontFamily: 'var(--font-display)', fontSize: '.875rem', color: 'var(--blue)', flexShrink: 0 }}>AED {p.revenue?.toLocaleString()}</strong>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>Recent Orders</h3>
              <Link to="/admin/orders" style={{ fontSize: '.8rem', color: 'var(--blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>View all <FiArrowRight size={12} /></Link>
            </div>
            {stats?.recentOrders?.map((order) => {
              const sc = STATUS_COLORS[order.status] || 'var(--text-3)';
              return (
                <div key={order._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '10px 12px', borderRadius: 'var(--r-lg)', background: 'var(--surface-2)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>{order.orderNumber}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-3)' }}>{order.user?.name}</p>
                  </div>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '2px 9px', borderRadius: 'var(--r-full)', background: `${sc}18`, color: sc, textTransform: 'capitalize', flexShrink: 0 }}>{order.status}</span>
                  <strong style={{ fontSize: '.875rem', fontFamily: 'var(--font-display)', flexShrink: 0 }}>AED {order.total?.toLocaleString()}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
