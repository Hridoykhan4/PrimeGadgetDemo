import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiStar, FiEye, FiEyeOff, FiTrash2, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';

const TABS = [['', 'All'], ['visible', 'Visible'], ['hidden', 'Hidden']];

export default function AdminReviews() {
  const [status, setStatus] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/reviews', { params: { status: status || undefined } }).then(({ data }) => setReviews(data.reviews)).catch(() => toast.error('Could not load reviews')).finally(() => setLoading(false));
  };
  useEffect(load, [status]);

  const toggle = async (r) => {
    try { await api.put(`/reviews/${r._id}/approval`, { isApproved: !r.isApproved }); toast.success(r.isApproved ? 'Review hidden' : 'Review visible'); load(); }
    catch { toast.error('Update failed'); }
  };
  const remove = async (r) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try { await api.delete(`/reviews/${r._id}`); toast.success('Review deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <AdminLayout>
      <Helmet><title>Reviews — PrimeGadgets Admin</title></Helmet>
      <div className="adm-head">
        <div><h1 className="adm-title">Reviews</h1><p className="adm-sub">{reviews.length} reviews · hide anything inappropriate</p></div>
      </div>
      <div className="adm-tabs">
        {TABS.map(([k, l]) => <button key={k || 'all'} className={`adm-tab ${status === k ? 'on' : ''}`} onClick={() => setStatus(k)}>{l}</button>)}
      </div>
      <div className="adm-list">
        {reviews.map((r) => (
          <div key={r._id} className={`adm-msg ${r.isApproved ? '' : 'unread'}`} style={{ opacity: r.isApproved ? 1 : 0.75 }}>
            <div className="adm-msg-h">
              <img src={r.product?.images?.[0]?.url} alt="" className="adm-thumb" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.product?.name || 'Deleted product'}</strong>
                <span className="muted">{r.displayName}{r.email || r.user?.email ? ` · ${r.email || r.user?.email}` : ''} · {new Date(r.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}</span>
              </div>
              <span className="pill muted" style={{ color: 'var(--gold)' }}><FiStar /> {r.rating}</span>
              {r.isVerifiedPurchase && <span className="pill ok"><FiCheckCircle /> Verified</span>}
              {!r.isApproved && <span className="pill bad">Hidden</span>}
            </div>
            {r.title && <strong>{r.title}</strong>}
            <p>{r.body}</p>
            <div className="adm-msg-actions">
              <button className="btn btn-secondary btn-sm" onClick={() => toggle(r)}>{r.isApproved ? <><FiEyeOff /> Hide</> : <><FiEye /> Show</>}</button>
              <a className="btn btn-secondary btn-sm" href={`/products/${r.product?._id}`} target="_blank" rel="noopener noreferrer"><FiExternalLink /> Product</a>
              <button className="btn btn-sm btn-secondary" style={{ color: 'var(--red)' }} onClick={() => remove(r)}><FiTrash2 /> Delete</button>
            </div>
          </div>
        ))}
        {!loading && !reviews.length && <div className="adm-card adm-empty">No reviews yet. Customers can review any product from its page — no account needed.</div>}
      </div>
    </AdminLayout>
  );
}
