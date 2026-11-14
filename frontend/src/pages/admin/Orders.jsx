import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiPhone, FiMessageCircle, FiPrinter, FiCheck, FiChevronLeft, FiChevronRight, FiRefreshCw, FiDollarSign } from 'react-icons/fi';
import AdminLayout, { useAdminBadges } from './AdminLayout.jsx';
import api from '../../utils/api.js';
import { fmtAED } from '../../store/index.js';
import toast from 'react-hot-toast';

const aed = (n) => `AED ${fmtAED(n)}`;
const FLOW = [
  ['pending', 'New'], ['confirmed', 'Confirmed'], ['processing', 'Packing'], ['shipped', 'Shipped'],
  ['out_for_delivery', 'Out for delivery'], ['delivered', 'Delivered'],
];
const LABEL = Object.fromEntries([...FLOW, ['cancelled', 'Cancelled'], ['refunded', 'Refunded']]);
const TABS = [['', 'All'], ...FLOW, ['cancelled', 'Cancelled']];
const waLink = (phone, text) => `https://wa.me/${String(phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

function printSlip(o) {
  const a = o.shippingAddress || {};
  const w = window.open('', '_blank', 'width=720,height=900');
  if (!w) return;
  const rows = o.items.map((i) => `<tr><td>${i.name}</td><td style="text-align:center">${i.quantity}</td><td style="text-align:right">AED ${fmtAED(i.price * i.quantity)}</td></tr>`).join('');
  w.document.write(`<!doctype html><html><head><title>${o.orderNumber}</title><style>
    body{font-family:system-ui,Arial,sans-serif;padding:28px;color:#111}h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse;margin-top:16px}
    td,th{border-bottom:1px solid #ddd;padding:8px;font-size:13px;text-align:left}.box{border:1px solid #ccc;border-radius:8px;padding:12px;margin-top:14px;font-size:14px;line-height:1.6}
    .big{font-size:18px;font-weight:700}</style></head><body>
    <h1>PrimeGadgets — Delivery slip</h1><div>Order <b>${o.orderNumber}</b> · ${new Date(o.createdAt).toLocaleString('en-AE')}</div>
    <div class="box"><b>${a.fullName || ''}</b><br>${a.phone || ''}<br>${[a.street, a.area, a.emirate].filter(Boolean).join(', ')}${a.landmark ? `<br><i>${a.landmark}</i>` : ''}</div>
    <table><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr>${rows}</table>
    <div class="box">Delivery: AED ${fmtAED(o.shippingFee)} · VAT: AED ${fmtAED(o.tax)}<br>
    <span class="big">Total: AED ${fmtAED(o.total)}</span><br>
    <span class="big">${o.paymentMethod === 'cod' && !o.isPaid ? `COLLECT CASH: AED ${fmtAED(o.total)}` : 'PAID — do not collect'}</span></div>
    <script>window.print()</script></body></html>`);
  w.document.close();
}

function OrderDrawer({ id, onClose, onChanged }) {
  const [o, setO] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState('');

  const load = useCallback(() => {
    api.get(`/orders/${id}`).then(({ data }) => { setO(data.order); setTracking(data.order.trackingNumber || ''); }).catch(() => toast.error('Could not load order'));
  }, [id]);
  useEffect(load, [load]);

  const update = async (body, msg) => {
    setBusy(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, body);
      setO((prev) => ({ ...prev, ...data.order, items: prev.items, user: prev.user }));
      toast.success(msg || 'Order updated');
      onChanged();
    } catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
    finally { setBusy(false); }
  };

  const a = o?.shippingAddress || {};
  const first = a.fullName?.split(' ')[0] || '';

  return (
    <>
      <motion.div className="adm-drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside className="adm-drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 34, stiffness: 320 }}>
        <div className="adm-drawer-h">
          <div>
            <strong className="mono" style={{ fontSize: '1rem' }}>{o?.orderNumber || 'Loading…'}</strong>
            {o && <div className="muted">{new Date(o.createdAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })} · {o.isGuest ? 'Guest checkout' : 'Customer account'}</div>}
          </div>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><FiX /></button>
        </div>
        {o && (
          <div className="adm-drawer-b">
            <div className="adm-actions">
              <span className={`pill ${o.status}`}>{LABEL[o.status]}</span>
              <span className={`pill ${o.isPaid ? 'paid' : 'unpaid'}`}>{o.paymentMethod === 'cod' ? 'COD' : 'Card'} · {o.isPaid ? 'Paid' : 'Unpaid'}</span>
            </div>

            <div className="adm-sec">
              <h4>Customer</h4>
              <dl className="adm-kv">
                <dt>Name</dt><dd>{a.fullName}</dd>
                <dt>Mobile</dt><dd>{a.phone}</dd>
                {a.email && <><dt>Email</dt><dd>{a.email}</dd></>}
                <dt>Address</dt><dd>{[a.street, a.area, a.emirate].filter(Boolean).join(', ')}</dd>
                {a.landmark && <><dt>Note</dt><dd>{a.landmark}</dd></>}
              </dl>
              <div className="adm-actions" style={{ marginTop: 12 }}>
                <a className="btn btn-secondary btn-sm" href={`tel:${a.phone}`}><FiPhone /> Call</a>
                <a className="btn btn-secondary btn-sm" href={waLink(a.phone, `Hi ${first}, this is PrimeGadgets about your order ${o.orderNumber} (${aed(o.total)}). Can we confirm your delivery address and time?`)} target="_blank" rel="noopener noreferrer"><FiMessageCircle /> WhatsApp</a>
                <button className="btn btn-secondary btn-sm" onClick={() => printSlip(o)}><FiPrinter /> Delivery slip</button>
              </div>
            </div>

            <div className="adm-sec">
              <h4>Update status</h4>
              <div className="adm-status-btns">
                {FLOW.map(([k, l]) => (
                  <button key={k} className={o.status === k ? 'on' : ''} disabled={busy || o.status === 'cancelled'} onClick={() => update({ status: k }, `Marked as ${l}`)}>{l}</button>
                ))}
                {!['cancelled', 'delivered'].includes(o.status) && (
                  <button className="cancel" disabled={busy} onClick={() => window.confirm('Cancel this order and return items to stock?') && update({ status: 'cancelled', note: 'Cancelled by admin' }, 'Order cancelled')}>Cancel order</button>
                )}
              </div>
              <div className="adm-actions" style={{ marginTop: 12 }}>
                <input className="adm-input" style={{ flex: 1, minWidth: 160 }} placeholder="Tracking / courier reference" value={tracking} onChange={(e) => setTracking(e.target.value)} />
                <button className="btn btn-secondary btn-sm" disabled={busy || tracking === (o.trackingNumber || '')} onClick={() => update({ trackingNumber: tracking }, 'Tracking saved')}>Save</button>
              </div>
              {!o.isPaid && o.status !== 'cancelled' && o.paymentMethod === 'cod' && (
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} disabled={busy} onClick={() => update({ isPaid: true }, 'Marked as paid')}><FiDollarSign /> Cash collected — mark paid</button>
              )}
            </div>

            <div className="adm-sec">
              <h4>Items</h4>
              <div className="adm-rows">
                {o.items.map((it, i) => (
                  <div key={i} className="adm-row">
                    <img src={it.image} alt="" className="adm-thumb" />
                    <div className="adm-row-main"><strong>{it.name}</strong><span>{it.quantity} × {aed(it.price)}</span></div>
                    <strong>{aed(it.price * it.quantity)}</strong>
                  </div>
                ))}
              </div>
              <dl className="adm-kv" style={{ marginTop: 10 }}>
                <dt>Subtotal</dt><dd>{aed(o.itemsTotal)}</dd>
                <dt>Delivery</dt><dd>{o.shippingFee ? aed(o.shippingFee) : 'Free'}</dd>
                <dt>VAT</dt><dd>{aed(o.tax)}</dd>
                <dt><b>Total</b></dt><dd><b>{aed(o.total)}</b></dd>
                {o.paymentResult?.id && <><dt>Payment ref</dt><dd className="mono" style={{ fontSize: '.72rem' }}>{o.paymentResult.id}</dd></>}
              </dl>
            </div>

            <div className="adm-sec">
              <h4>History</h4>
              <ul className="adm-timeline">
                {[...(o.statusHistory || [])].reverse().map((h, i) => (
                  <li key={i}><i /><div><strong>{LABEL[h.status] || h.status}</strong>{h.note ? ` — ${h.note}` : ''}<small>{new Date(h.date).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</small></div></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const openId = params.get('open');
  const [q, setQ] = useState('');
  const [payment, setPayment] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ orders: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const refreshBadges = useAdminBadges((s) => s.refresh);
  const debounce = useRef();

  const load = useCallback(() => {
    setLoading(true);
    const p = { page, limit: 25 };
    if (status) p.status = status;
    if (q.trim()) p.q = q.trim();
    if (payment === 'paid' || payment === 'unpaid') p.payment = payment;
    if (payment === 'cod' || payment === 'card') p.method = payment;
    api.get('/orders', { params: p }).then(({ data: d }) => setData(d)).catch(() => toast.error('Could not load orders')).finally(() => setLoading(false));
  }, [status, q, payment, page]);

  useEffect(() => { clearTimeout(debounce.current); debounce.current = setTimeout(load, q ? 300 : 0); }, [load]);
  useEffect(() => { setPage(1); }, [status, q, payment]);

  const setParam = (k, v) => { const n = new URLSearchParams(params); v ? n.set(k, v) : n.delete(k); setParams(n); };

  return (
    <AdminLayout>
      <Helmet><title>Orders — PrimeGadgets Admin</title></Helmet>
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Orders</h1>
          <p className="adm-sub">{data.total} {status ? LABEL[status]?.toLowerCase() : ''} orders</p>
        </div>
        <div className="adm-tools">
          <div className="adm-search"><FiSearch /><input className="adm-input" placeholder="Order #, name, phone, email" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <select className="adm-select" value={payment} onChange={(e) => setPayment(e.target.value)} aria-label="Payment filter">
            <option value="">All payments</option>
            <option value="cod">Cash on delivery</option>
            <option value="card">Card</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button className="adm-icon-btn" onClick={load} aria-label="Refresh"><FiRefreshCw /></button>
        </div>
      </div>

      <div className="adm-tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k || 'all'} role="tab" aria-selected={status === k} className={`adm-tab ${status === k ? 'on' : ''}`} onClick={() => setParam('status', k)}>{l}</button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o._id} className="clickable" onClick={() => setParam('open', o._id)}>
                <td><span className="mono">{o.orderNumber}</span></td>
                <td>
                  <strong style={{ display: 'block', fontSize: '.86rem' }}>{o.shippingAddress?.fullName || o.user?.name}</strong>
                  <span className="muted">{o.shippingAddress?.phone} · {o.shippingAddress?.emirate}</span>
                </td>
                <td>{o.items?.reduce((n, i) => n + i.quantity, 0)}</td>
                <td><strong>{aed(o.total)}</strong></td>
                <td><span className={`pill ${o.isPaid ? 'paid' : 'unpaid'}`}>{o.paymentMethod === 'cod' ? 'COD' : 'Card'} · {o.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                <td><span className={`pill ${o.status}`}>{LABEL[o.status]}</span></td>
                <td className="muted">{new Date(o.createdAt).toLocaleString('en-AE', { dateStyle: 'medium', timeStyle: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.orders.length === 0 && <div className="adm-empty">No orders found</div>}
        {loading && data.orders.length === 0 && <div className="adm-empty"><span className="spinner spinner-sm" /></div>}
      </div>

      {data.pages > 1 && (
        <div className="adm-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="adm-icon-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><FiChevronLeft /></button>
          <span className="muted" style={{ alignSelf: 'center' }}>Page {page} of {data.pages}</span>
          <button className="adm-icon-btn" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><FiChevronRight /></button>
        </div>
      )}

      <AnimatePresence>
        {openId && <OrderDrawer key={openId} id={openId} onClose={() => setParam('open', '')} onChanged={() => { load(); refreshBadges(); }} />}
      </AnimatePresence>
    </AdminLayout>
  );
}
