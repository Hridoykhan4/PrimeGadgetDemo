// Shared building blocks for the Storefront (CMS) admin pages
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiX, FiSearch, FiChevronUp, FiChevronDown, FiImage, FiCheck } from 'react-icons/fi';
import api from '../../utils/api.js';
import { ICONS, Icon } from '../../utils/categories.jsx';
import { useSiteStore } from '../../store/site.js';
import toast from 'react-hot-toast';

export const THEMES = [
  ['light', '#f3f6fb'], ['dark', '#15171c'], ['blue', '#0066ff'], ['orange', '#ff6b00'],
  ['green', '#16a34a'], ['purple', '#8b5cf6'], ['red', '#ef4444'],
];

// Refresh the public storefront cache after any dashboard change
export const refreshStorefront = () => useSiteStore.getState().load(true);

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 });
  return data.url;
}

export function ImageUpload({ value, onChange, label = 'Image', hint, height = 140, contain = true }) {
  const [busy, setBusy] = useState(false);
  const input = useRef(null);
  const pick = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setBusy(true);
    try { onChange(await uploadImage(f)); toast.success('Image uploaded'); }
    catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setBusy(false); }
  };
  return (
    <div className="cms-field">
      <span className="cms-label">{label}</span>
      <div className="cms-img" style={{ height }}>
        {value
          ? <img src={value} alt="" style={{ objectFit: contain ? 'contain' : 'cover' }} />
          : <span className="cms-img-empty"><FiImage /> No image</span>}
        {busy && <span className="cms-img-busy"><span className="spinner spinner-sm" /></span>}
      </div>
      <div className="cms-row">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={busy}><FiUpload /> {value ? 'Replace' : 'Upload'}</button>
        {value && <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange('')}><FiX /> Remove</button>}
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden onChange={pick} />
      </div>
      {hint && <span className="cms-hint">{hint}</span>}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="cms-field">
      <span className="cms-label">{label}</span>
      {children}
      {hint && <span className="cms-hint">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="cms-toggle">
      <button type="button" className={`adm-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked} />
      <span>{label}</span>
    </label>
  );
}

export function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="cms-field">
      <span className="cms-label">Icon</span>
      <button type="button" className="cms-icon-btn" onClick={() => setOpen((o) => !o)}><Icon name={value || 'grid'} /> <span>{value || 'grid'}</span></button>
      {open && (
        <div className="cms-icon-grid">
          {Object.keys(ICONS).map((k) => (
            <button type="button" key={k} title={k} className={value === k ? 'on' : ''} onClick={() => { onChange(k); setOpen(false); }}><Icon name={k} /></button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ThemePicker({ value, onChange }) {
  return (
    <div className="cms-field">
      <span className="cms-label">Colour</span>
      <div className="cms-swatches">
        {THEMES.map(([k, c]) => (
          <button type="button" key={k} title={k} className={value === k ? 'on' : ''} style={{ background: c }} onClick={() => onChange(k)}>
            {value === k && <FiCheck color={k === 'light' ? '#111' : '#fff'} />}
          </button>
        ))}
      </div>
    </div>
  );
}

// Search the catalog and pick one product
export function ProductPicker({ value, onChange, label = 'Product' }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    if (!open) return;
    t.current = setTimeout(() => {
      api.get('/products/admin/all', { params: { q: q || undefined, status: 'active' } })
        .then(({ data }) => setResults(data.products.slice(0, 30))).catch(() => {});
    }, 250);
  }, [q, open]);
  return (
    <div className="cms-field">
      <span className="cms-label">{label}</span>
      {value && typeof value === 'object' && (
        <div className="cms-picked">
          <img src={value.images?.[0]?.url} alt="" />
          <span>{value.name}</span>
          <button type="button" onClick={() => onChange(null)} aria-label="Clear product"><FiX /></button>
        </div>
      )}
      <div className="adm-search" style={{ width: '100%' }}>
        <FiSearch />
        <input className="adm-input" style={{ width: '100%' }} placeholder={value ? 'Change product…' : 'Search products…'} value={q} onFocus={() => setOpen(true)} onChange={(e) => setQ(e.target.value)} />
      </div>
      {open && (
        <div className="cms-results">
          {results.map((p) => (
            <button type="button" key={p._id} onClick={() => { onChange(p); setOpen(false); setQ(''); }}>
              <img src={p.images?.[0]?.url} alt="" /><span>{p.name}</span><b>AED {p.salePrice > 0 ? p.salePrice : p.price}</b>
            </button>
          ))}
          {!results.length && <div className="adm-empty">No products</div>}
          <button type="button" className="cms-results-close" onClick={() => setOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

// Pick several products in a chosen order
export function MultiProductPicker({ value = [], onChange }) {
  const move = (i, d) => { const a = [...value]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; onChange(a); };
  return (
    <div className="cms-field">
      <span className="cms-label">Products (in this order)</span>
      <div className="cms-multi">
        {value.map((p, i) => (
          <div key={p._id} className="cms-picked">
            <img src={p.images?.[0]?.url} alt="" />
            <span>{p.name}</span>
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><FiChevronUp /></button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down"><FiChevronDown /></button>
            <button type="button" onClick={() => onChange(value.filter((x) => x._id !== p._id))} aria-label="Remove"><FiX /></button>
          </div>
        ))}
      </div>
      <ProductPicker label="Add a product" value={null} onChange={(p) => p && !value.some((x) => x._id === p._id) && onChange([...value, p])} />
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <AnimatePresence>
      <motion.div className="adm-drawer-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside className="adm-drawer" style={wide ? { width: 'min(720px, 100vw)' } : undefined} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 34, stiffness: 320 }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="adm-drawer-h">
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{title}</strong>
          <button className="adm-icon-btn" onClick={onClose} aria-label="Close"><FiX /></button>
        </div>
        <div className="adm-drawer-b">{children}</div>
        {footer && <div className="cms-footer">{footer}</div>}
      </motion.aside>
    </AnimatePresence>
  );
}

export function MoveButtons({ index, total, onMove }) {
  return (
    <span className="cms-move">
      <button type="button" className="adm-icon-btn" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Move up"><FiChevronUp /></button>
      <button type="button" className="adm-icon-btn" onClick={() => onMove(index, 1)} disabled={index === total - 1} aria-label="Move down"><FiChevronDown /></button>
    </span>
  );
}

// CRUD + ordering for /cms/:collection
export function useCms(collection) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    return api.get(`/cms/${collection}`).then(({ data }) => setItems(data.items)).catch(() => toast.error('Could not load')).finally(() => setLoading(false));
  }, [collection]);
  useEffect(() => { load(); }, [load]);

  const save = async (item) => {
    try {
      if (item._id) await api.put(`/cms/${collection}/${item._id}`, item);
      else await api.post(`/cms/${collection}`, item);
      toast.success('Saved — live on the store');
      await load(); refreshStorefront();
      return true;
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); return false; }
  };
  const remove = async (item) => {
    try { await api.delete(`/cms/${collection}/${item._id}`); toast.success('Deleted'); await load(); refreshStorefront(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };
  const quick = async (item, patch) => {
    setItems((list) => list.map((x) => (x._id === item._id ? { ...x, ...patch } : x)));
    try { await api.put(`/cms/${collection}/${item._id}`, patch); refreshStorefront(); }
    catch { toast.error('Update failed'); load(); }
  };
  // Reorder within a subset (e.g. hero banners only)
  const move = async (subset, index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= subset.length) return;
    const ordered = [...subset];
    [ordered[index], ordered[j]] = [ordered[j], ordered[index]];
    const ids = ordered.map((x) => x._id);
    setItems((list) => {
      const rank = Object.fromEntries(ids.map((id, i) => [id, i]));
      return list.map((x) => (x._id in rank ? { ...x, order: rank[x._id] } : x)).sort((a, b) => (a.placement || '').localeCompare(b.placement || '') || a.order - b.order);
    });
    try { await api.put(`/cms/${collection}/reorder`, { ids }); refreshStorefront(); }
    catch { toast.error('Reorder failed'); load(); }
  };
  return { items, loading, load, save, remove, quick, move };
}
