import React, { useEffect, useState } from 'react';
import { FiStar, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import api from '../../utils/api.js';
import { useAuthStore } from '../../store/index.js';
import toast from 'react-hot-toast';
import './ProductReviews.css';

const Stars = ({ value, size = 16 }) => (
  <span className="rv-stars" aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} style={{ width: size, height: size }} className={s <= Math.round(value) ? 'on' : ''} aria-hidden="true" />
    ))}
  </span>
);
export { Stars };

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ProductReviews({ productId, onChange }) {
  const { user } = useAuthStore();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0, breakdown: [] });
  const [form, setForm] = useState({ rating: 0, body: '', name: '' });
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const load = () => api.get(`/reviews/product/${productId}`).then(({ data: d }) => setData(d)).catch(() => {});
  useEffect(() => { load(); setDone(false); setOpen(false); }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please choose a star rating'); return; }
    if (form.body.trim().length < 5) { toast.error('Please write a few words'); return; }
    if (!user && form.name.trim().length < 2) { toast.error('Please enter your name'); return; }
    setBusy(true);
    try {
      await api.post(`/reviews/product/${productId}`, { rating: form.rating, body: form.body, name: form.name });
      toast.success('Thank you for your review!');
      setForm({ rating: 0, body: '', name: '' });
      setDone(true); setOpen(false);
      await load();
      onChange?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit your review');
    } finally { setBusy(false); }
  };

  const max = Math.max(1, ...data.breakdown.map((b) => b.count));

  return (
    <div className="rv">
      <div className="rv-top">
        <div className="rv-score">
          <strong>{data.count ? data.average.toFixed(1) : '–'}</strong>
          <Stars value={data.average} size={18} />
          <span>{data.count ? `${data.count} ${data.count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</span>
        </div>
        <div className="rv-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const c = data.breakdown.find((b) => b.star === star)?.count || 0;
            return (
              <div key={star} className="rv-bar">
                <span>{star}<FiStar aria-hidden="true" /></span>
                <i><b style={{ width: `${(c / max) * 100}%` }} /></i>
                <em>{c}</em>
              </div>
            );
          })}
        </div>
        <div className="rv-cta">
          <p>{done ? 'Thanks — your review is live.' : 'Bought this item? Help other shoppers in the UAE.'}</p>
          {!done && <button className="btn btn-primary" onClick={() => setOpen((o) => !o)}><FiMessageSquare /> Write a review</button>}
        </div>
      </div>

      {open && (
        <form className="rv-form" onSubmit={submit}>
          <div className="rv-pick" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Your rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                type="button" key={s} role="radio" aria-checked={form.rating === s} aria-label={`${s} star${s > 1 ? 's' : ''}`}
                className={(hover || form.rating) >= s ? 'on' : ''}
                onMouseEnter={() => setHover(s)} onClick={() => setForm((f) => ({ ...f, rating: s }))}
              >
                <FiStar aria-hidden="true" />
              </button>
            ))}
            <span className="rv-pick-label">{LABELS[hover || form.rating] || 'Tap to rate'}</span>
          </div>
          {!user && (
            <label className="rv-field">Your name
              <input className="co-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Fatima" maxLength={60} />
            </label>
          )}
          <label className="rv-field">Your review
            <textarea className="co-input rv-text" rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="What did you like? How was the quality and delivery?" maxLength={2000} />
          </label>
          <div className="rv-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</button>
          </div>
        </form>
      )}

      {data.reviews.length > 0 && (
        <ul className="rv-list">
          {data.reviews.map((r) => (
            <li key={r._id} className="rv-item">
              <div className="rv-item-head">
                <span className="rv-avatar">{r.displayName?.[0]?.toUpperCase() || 'C'}</span>
                <div>
                  <strong>{r.displayName}</strong>
                  <div className="rv-meta">
                    <Stars value={r.rating} size={13} />
                    {r.isVerifiedPurchase && <span className="rv-verified"><FiCheckCircle /> Verified purchase</span>}
                  </div>
                </div>
                <time>{new Date(r.createdAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}</time>
              </div>
              {r.title && <h4>{r.title}</h4>}
              <p>{r.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
