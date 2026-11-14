import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp, FiArrowRight, FiClock, FiTruck, FiMail, FiAlertTriangle, FiPackage, FiRefreshCw,
} from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import { fmtAED } from '../../store/index.js';

const aed = (n) => `AED ${fmtAED(n)}`;
const STATUS_LABEL = { pending: 'New', confirmed: 'Confirmed', processing: 'Packing', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', refunded: 'Refunded' };

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: '.8rem', boxShadow: 'var(--shadow)' }}>
      <strong style={{ display: 'block', marginBottom: 4 }}>{label}</strong>
      {payload.map((p) => <div key={p.dataKey}>{p.dataKey === 'revenue' ? `Revenue: ${aed(p.value)}` : `Orders: ${p.value}`}</div>)}
    </div>
  );
};

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    api.get('/stats').then(({ data }) => setS(data.stats)).catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const chart = (s?.last14 || []).map((d) => ({
    ...d, label: new Date(`${d.date}T12:00:00`).toLocaleDateString('en-AE', { day: 'numeric', month: 'short' }),
  }));
  const split = (s?.paymentSplit || []).map((p) => ({ name: p._id === 'cod' ? 'Cash on delivery' : 'Card', value: p.count, total: p.total }));
  const SPLIT_COLORS = ['#3d8bff', '#22c55e'];

  return (
    <AdminLayout>
      <Helmet><title>Dashboard — PrimeGadgets Admin</title></Helmet>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Dashboard</h1>
          <p className="adm-sub">{new Date().toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Dubai' })} · Dubai time</p>
        </div>
        <div className="adm-tools">
          <button className="btn btn-secondary btn-sm" onClick={load}><FiRefreshCw /> Refresh</button>
          <Link to="/admin/orders" className="btn btn-primary btn-sm"><FiShoppingBag /> Manage orders</Link>
        </div>
      </div>

      {error && <div className="adm-card adm-empty">Could not load stats. <button className="btn btn-sm btn-secondary" onClick={load}>Try again</button></div>}
      {loading && !s && <div className="adm-kpis">{[0, 1, 2, 3].map((k) => <div key={k} className="adm-kpi skeleton" style={{ height: 116 }} />)}</div>}

      {s && (
        <>
          <div className="adm-kpis">
            {[
              { label: 'Revenue today', value: aed(s.revenueToday), sub: <>Last 30 days <b>{aed(s.revenue30)}</b></>, icon: FiDollarSign, c: '#22c55e' },
              { label: 'Orders today', value: s.ordersToday, sub: <>All time <b>{s.totalOrders}</b></>, icon: FiShoppingBag, c: '#3d8bff' },
              { label: 'Avg. order value', value: aed(s.avgOrderValue), sub: <>Total revenue <b>{aed(s.totalRevenue)}</b></>, icon: FiTrendingUp, c: '#a855f7' },
              { label: 'Customers', value: s.totalCustomers, sub: <>Registered accounts <b>{s.totalUsers}</b></>, icon: FiUsers, c: '#f59e0b' },
            ].map((k) => (
              <div className="adm-kpi" key={k.label}>
                <div className="adm-kpi-top"><span>{k.label}</span><span className="adm-kpi-ic" style={{ background: `${k.c}1f`, color: k.c }}><k.icon /></span></div>
                <strong>{k.value}</strong>
                <small>{k.sub}</small>
              </div>
            ))}
          </div>

          <div className="adm-alerts">
            <Link to="/admin/orders?status=pending" className="adm-alert warn"><FiClock /><span><strong>{s.pendingOrders}</strong> new orders to confirm</span></Link>
            <Link to="/admin/orders?status=confirmed" className="adm-alert info"><FiTruck /><span><strong>{s.toShip}</strong> orders to pack &amp; ship</span></Link>
            <Link to="/admin/messages" className="adm-alert info"><FiMail /><span><strong>{s.unreadMessages}</strong> unread messages</span></Link>
            <Link to="/admin/products?status=low" className={`adm-alert ${s.lowStock?.length ? 'warn' : 'ok'}`}><FiAlertTriangle /><span><strong>{s.lowStock?.length || 0}</strong> products low on stock</span></Link>
          </div>

          <div className="adm-grid-2">
            <div className="adm-card">
              <div className="adm-card-h"><h3>Revenue · last 14 days</h3><span className="muted">Paid + cash-on-delivery orders</span></div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chart} margin={{ left: -10, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3d8bff" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3d8bff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis stroke="var(--text-3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#3d8bff" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="adm-card">
              <div className="adm-card-h"><h3>Payment methods</h3></div>
              {split.length ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={split} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                        {split.map((_, i) => <Cell key={i} fill={SPLIT_COLORS[i % 2]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="adm-rows">
                    {split.map((p, i) => (
                      <div key={p.name} className="adm-row">
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: SPLIT_COLORS[i % 2] }} />
                        <div className="adm-row-main"><strong>{p.name}</strong><span>{p.value} orders</span></div>
                        <strong>{aed(p.total)}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div className="adm-empty">No orders yet</div>}
            </div>
          </div>

          <div className="adm-grid-eq">
            <div className="adm-card">
              <div className="adm-card-h"><h3>Latest orders</h3><Link to="/admin/orders">View all <FiArrowRight /></Link></div>
              <div className="adm-rows">
                {s.recentOrders.length ? s.recentOrders.map((o) => (
                  <Link key={o._id} to={`/admin/orders?open=${o._id}`} className="adm-row">
                    <div className="adm-row-main">
                      <strong className="mono">{o.orderNumber}</strong>
                      <span>{o.shippingAddress?.fullName || o.user?.name} · {o.shippingAddress?.emirate} · {new Date(o.createdAt).toLocaleString('en-AE', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    <span className={`pill ${o.status}`}>{STATUS_LABEL[o.status] || o.status}</span>
                    <strong style={{ whiteSpace: 'nowrap' }}>{aed(o.total)}</strong>
                  </Link>
                )) : <div className="adm-empty">No orders yet — share your store link to get the first one.</div>}
              </div>
            </div>

            <div className="adm-card">
              <div className="adm-card-h"><h3>Top products</h3><Link to="/admin/products">Products <FiArrowRight /></Link></div>
              <div className="adm-rows">
                {s.topProducts.length ? s.topProducts.map((p, i) => (
                  <div key={p._id} className="adm-row">
                    <span className="muted" style={{ width: 18 }}>{i + 1}</span>
                    <img src={p.image} alt="" className="adm-thumb" />
                    <div className="adm-row-main"><strong>{p.name}</strong><span>{p.sold} sold</span></div>
                    <strong style={{ whiteSpace: 'nowrap' }}>{aed(p.revenue)}</strong>
                  </div>
                )) : <div className="adm-empty">Sales will appear here</div>}
              </div>
              {s.lowStock?.length > 0 && (
                <>
                  <div className="adm-card-h" style={{ marginTop: 18 }}><h3>Low stock</h3></div>
                  <div className="adm-rows">
                    {s.lowStock.map((p) => (
                      <Link key={p._id} to={`/admin/products/${p._id}/edit`} className="adm-row">
                        <img src={p.images?.[0]?.url} alt="" className="adm-thumb" />
                        <div className="adm-row-main"><strong>{p.name}</strong></div>
                        <span className={`pill ${p.stock === 0 ? 'bad' : 'unpaid'}`}><FiPackage /> {p.stock} left</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
