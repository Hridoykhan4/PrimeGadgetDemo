// admin/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiEye, FiSearch } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const STATUS_COLORS = { pending:'#F5A623', confirmed:'#0066FF', processing:'#0066FF', shipped:'#7C3AED', out_for_delivery:'#00C853', delivered:'#00C853', cancelled:'#FF3B3B', refunded:'#FF6B00' };
const ALL_STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetch = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/orders${params}`).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetch();
    } catch { toast.error('Update failed'); }
  };

  const filtered = orders.filter(o =>
    !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <Helmet><title>Orders — Admin</title></Helmet>
      <div style={{ maxWidth: 1300 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:700, marginBottom:2 }}>Orders</h1>
            <p style={{ color:'var(--text-3)', fontSize:'.875rem' }}>{filtered.length} orders</p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <div className="input-wrap">
              <FiSearch className="input-icon-left" size={15} />
              <input className="input has-icon-left" style={{ width:220 }} placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width:160 }} value={filter} onChange={e => { setFilter(e.target.value); setLoading(true); }}>
              <option value="">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="loading-screen"><div className="spinner" /></div> : (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r-xl)', overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--surface-2)' }}>
                  {['Order #','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'.75rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text-3)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const sc = STATUS_COLORS[order.status] || 'var(--text-3)';
                  return (
                    <tr key={order._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'.82rem', fontWeight:700 }}>{order.orderNumber}</span>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <div>
                          <p style={{ fontSize:'.875rem', fontWeight:600, marginBottom:2 }}>{order.user?.name}</p>
                          <p style={{ fontSize:'.75rem', color:'var(--text-3)' }}>{order.user?.email}</p>
                          {order.shippingAddress?.phone && <p style={{ fontSize:'.75rem', color:'var(--text-2)' }}>{order.shippingAddress.phone} · {order.shippingAddress.emirate}</p>}
                        </div>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:'.875rem', color:'var(--text-2)' }}>{order.items?.length}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <strong style={{ fontFamily:'var(--font-display)', fontSize:'.9rem', color:'var(--blue)' }}>AED {order.total?.toLocaleString()}</strong>
                      </td>
                      <td style={{ padding:'14px 16px', whiteSpace:'nowrap' }}>
                        <span style={{ fontSize:'.78rem', fontWeight:600 }}>{order.paymentMethod === 'cod' ? 'COD' : 'Card'}</span>{' '}
                        <span style={{ fontSize:'.72rem', fontWeight:700, padding:'2px 8px', borderRadius:'var(--r-full)', background: order.isPaid ? 'rgba(0,200,83,.12)' : 'rgba(245,166,35,.14)', color: order.isPaid ? 'var(--green)' : '#b7791f' }}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order._id, e.target.value)}
                          style={{ padding:'5px 10px', background:'var(--surface-2)', border:`1.5px solid ${sc}`, borderRadius:'var(--r-sm)', color:sc, fontWeight:700, fontSize:'.78rem', cursor:'pointer', textTransform:'capitalize' }}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                        </select>
                      </td>
                      <td style={{ padding:'14px 16px', fontSize:'.82rem', color:'var(--text-3)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-AE', { day:'numeric', month:'short', year:'2-digit' })}
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <Link to={`/orders/${order._id}`} className="btn btn-sm btn-secondary" style={{ padding:'6px 12px' }}>
                          <FiEye size={13} /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign:'center', padding:'40px', color:'var(--text-3)' }}>No orders found</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
